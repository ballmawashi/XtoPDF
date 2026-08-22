import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const authToken = process.env.X_AUTH_TOKEN;
        const ct0 = process.env.X_CT0;

        console.log('Launching browser for URL:', url);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        // Match the A4 printable width (210mm - 12mm*2 ≈ 703px @96dpi) so X lays
        // the page out at exactly the width it will be printed at — no
        // shrink-to-fit, no clipping at the right edge
        await page.setViewport({ width: 703, height: 900 });
        // Mask headless UA (X blocks "HeadlessChrome")
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');

        // Set X auth cookies if provided (skip placeholder values — an invalid
        // auth_token makes X error out instead of falling back to guest view)
        if (authToken && authToken.length > 20) {
            await page.setCookie(
                { name: 'auth_token', value: authToken, domain: '.x.com', path: '/' },
                ...(ct0 ? [{ name: 'ct0', value: ct0, domain: '.x.com', path: '/' }] : [])
            );
        }

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for tweet content
        try {
            await page.waitForSelector('article', { timeout: 15000 });
        } catch (e) {
            console.log('Article selector not found, proceeding anyway');
        }

        // If this tweet has a linked X article, navigate to it
        const articleLink = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="/i/article/"], a[href*="x.com/i/article/"]'));
            return links.length > 0 ? (links[0] as HTMLAnchorElement).href : null;
        });

        if (articleLink) {
            console.log('Found article link, navigating to:', articleLink);
            await page.goto(articleLink, { waitUntil: 'networkidle2', timeout: 60000 });
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Scroll to trigger lazy loading
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 400;
                const timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= document.body.scrollHeight) {
                        clearInterval(timer);
                        window.scrollTo(0, 0);
                        resolve();
                    }
                }, 150);
            });
        });

        // Wait for lazy-loaded images to finish (X articles load screenshots on scroll)
        await Promise.race([
            page.evaluate(() => Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))
            )),
            new Promise(resolve => setTimeout(resolve, 10000)),
        ]);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clean up UI: remove sidebars, nav, login prompts
        await page.evaluate(() => {
            const hide = (selector: string) => {
                document.querySelectorAll(selector).forEach((el) => {
                    if (el instanceof HTMLElement) el.style.display = 'none';
                });
            };

            hide('header[role="banner"]');
            hide('[data-testid="sidebarColumn"]');
            hide('#layers');
            // Login/signup prompts
            hide('[data-testid="LoginForm"]');
            hide('[aria-label="Sign up"]');
            // Bottom bar on mobile
            hide('[data-testid="BottomBar"]');

            // X's guest article view prepends a degraded plain-text copy of the
            // whole article as one huge <p> (no paragraph breaks) above the
            // properly formatted version — hide it
            document.querySelectorAll('article p').forEach((p) => {
                if (p instanceof HTMLElement && (p.textContent || '').length > 2000) {
                    p.style.display = 'none';
                }
            });

            // Expand primary column to full width
            const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
            if (primaryColumn instanceof HTMLElement) {
                primaryColumn.style.maxWidth = '100%';
                primaryColumn.style.width = '100%';
                let parent = primaryColumn.parentElement;
                let count = 0;
                while (parent && count < 5) {
                    (parent as HTMLElement).style.display = 'block';
                    parent = parent.parentElement;
                    count++;
                }
            }

            const style = document.createElement('style');
            style.textContent = `
                body { background: #fff !important; }
                article { font-family: sans-serif !important; }
                div[data-testid="tweetText"] { font-size: 15px !important; line-height: 1.5 !important; }
                /* A4改ページで画像・動画・コードブロックが途中で切れないように。
                   Xの画像は絶対配置なので、通常フローにいるラッパー側に効かせる */
                img, video, figure, pre, blockquote,
                [data-testid="tweetPhoto"], [data-testid="videoComponent"],
                [data-testid="card.wrapper"] { break-inside: avoid; }
            `;
            document.head.appendChild(style);
        });

        // Clip everything below the last real content — X leaves ~3000px of
        // empty reserved space at the bottom, which becomes blank PDF pages
        await page.evaluate(() => {
            // fixed/sticky elements (nav, account widget, footer) sit at viewport
            // coordinates — when scrolled to the bottom they'd read as the
            // lowest content and inflate the clamp, so exclude them
            const fixedRoots: Element[] = [];
            for (const el of document.querySelectorAll('body *')) {
                const pos = window.getComputedStyle(el).position;
                if (pos === 'fixed' || pos === 'sticky') fixedRoots.push(el);
            }
            let last = 0;
            for (const el of document.querySelectorAll('body *')) {
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') continue;
                if (fixedRoots.some((root) => root.contains(el))) continue;
                const hasOwnText = Array.from(el.childNodes).some(
                    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim()
                );
                if (hasOwnText || ['IMG', 'VIDEO', 'CANVAS'].includes(el.tagName)) {
                    last = Math.max(last, el.getBoundingClientRect().bottom + window.scrollY);
                }
            }
            if (last > 0) {
                const h = Math.ceil(last) + 20;
                document.documentElement.style.height = h + 'px';
                document.documentElement.style.overflow = 'hidden';
                document.body.style.height = h + 'px';
                document.body.style.overflow = 'hidden';
            }
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' }
        });

        await browser.close();

        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', 'attachment; filename="article.pdf"');

        // page.pdf() returns Uint8Array<ArrayBufferLike>, which BodyInit rejects — copy into a plain ArrayBuffer
        return new NextResponse(new Uint8Array(pdfBuffer).buffer, { status: 200, headers });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF. Make sure the URL is correct and public.' },
            { status: 500 }
        );
    }
}
