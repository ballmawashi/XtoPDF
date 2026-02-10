import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log('Launching browser for URL:', url);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        // Set viewport to a reasonable desktop size
        await page.setViewport({ width: 1280, height: 1024 });

        // Go to URL
        // waitUntil networkidle2 is usually good for SPAs like X
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Attempt to wait for article to ensure content loaded
        try {
            await page.waitForSelector('article', { timeout: 15000 });
        } catch (e) {
            console.log('Article selector not found, proceeding anyway');
        }

        // Clean up the page before generating PDF
        await page.evaluate(() => {
            // Helper to hide elements safely
            const hideOptions = (selector: string) => {
                const els = document.querySelectorAll(selector);
                els.forEach((el) => {
                    if (el instanceof HTMLElement) el.style.display = 'none';
                });
            };

            // 1. Hide Left Sidebar (Navigation)
            hideOptions('header[role="banner"]');

            // 2. Hide Right Sidebar (Trends, Who to follow)
            hideOptions('[data-testid="sidebarColumn"]');

            // 3. Remove typical sticky headers/bars that might overlap
            // This is a bit aggressive but helps clean up "Login" banners if not logged in
            hideOptions('#layers');

            // 4. Adjust Main Column Layout
            // The primary column typically has data-testid="primaryColumn"
            const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
            if (primaryColumn instanceof HTMLElement) {
                // Reset width constraints to allow it to fill the PDF page better
                primaryColumn.style.maxWidth = '100%';
                primaryColumn.style.width = '100%';

                // Try to center it or remove margin from parent flex containers
                // Walking up to find the main grid container
                let safeCounter = 0;
                let parent = primaryColumn.parentElement;
                while (parent && safeCounter < 5) {
                    // If parent is a flex/grid container, we might want to adjust it
                    const style = window.getComputedStyle(parent);
                    if (style.display === 'flex' || style.display === 'grid') {
                        parent.style.justifyContent = 'center'; // Center the single remaining column
                        parent.style.display = 'block'; // Often switching to block helps remove side gaps
                    }
                    parent = parent.parentElement;
                    safeCounter++;
                }
            }

            // 5. Aggressively remove whitespace and tighten layout
            const style = document.createElement('style');
            style.textContent = `
                /* Tighten all text within the article */
                article {
                    font-family: sans-serif !important;
                }
                
                /* Reduce gap between text blocks */
                div[data-testid="tweetText"] {
                    line-height: 1.3 !important;
                    font-size: 14px !important;
                }
                
                /* Reduce margins of all block elements inside the article */
                article div, article span, article p {
                    margin-bottom: 4px !important;
                    padding-bottom: 0 !important;
                    padding-top: 0 !important;
                }

                /* Remove big spacers */
                div[style*="height"], div[style*="min-height"] {
                    height: auto !important;
                    min-height: 0 !important;
                }

                /* Hide empty elements that might be taking up space */
                article div:empty {
                    display: none !important;
                }
                
                /* Tighten image containers */
                div[data-testid="tweetPhoto"] {
                    margin-top: 4px !important;
                    margin-bottom: 4px !important;
                }
                
                /* Remove default borders that look like spacers */
                * {
                    border-color: #eee !important;
                }
            `;
            document.head.appendChild(style);

            // Remove <br> tags to avoid double spacing
            document.querySelectorAll('article br').forEach(br => br.remove());
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        // Return PDF
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', 'attachment; filename="article.pdf"');

        return new NextResponse(pdfBuffer, { status: 200, headers });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF. Make sure the URL is correct and public.' },
            { status: 500 }
        );
    }
}
