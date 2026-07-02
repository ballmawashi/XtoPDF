module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/generate-pdf/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$puppeteer__$5b$external$5d$__$28$puppeteer$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$puppeteer$29$__ = __turbopack_context__.i("[externals]/puppeteer [external] (puppeteer, esm_import, [project]/node_modules/puppeteer)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$puppeteer__$5b$external$5d$__$28$puppeteer$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$puppeteer$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$puppeteer__$5b$external$5d$__$28$puppeteer$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$puppeteer$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function POST(req) {
    try {
        const { url } = await req.json();
        if (!url) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'URL is required'
            }, {
                status: 400
            });
        }
        const authToken = process.env.X_AUTH_TOKEN;
        const ct0 = process.env.X_CT0;
        console.log('Launching browser for URL:', url);
        const browser = await __TURBOPACK__imported__module__$5b$externals$5d2f$puppeteer__$5b$external$5d$__$28$puppeteer$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$puppeteer$29$__["default"].launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1280,
            height: 900
        });
        // Set X auth cookies if provided
        if (authToken) {
            await page.setCookie({
                name: 'auth_token',
                value: authToken,
                domain: '.x.com',
                path: '/'
            }, ...ct0 ? [
                {
                    name: 'ct0',
                    value: ct0,
                    domain: '.x.com',
                    path: '/'
                }
            ] : []);
        }
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });
        // Wait for tweet content
        try {
            await page.waitForSelector('article', {
                timeout: 15000
            });
        } catch (e) {
            console.log('Article selector not found, proceeding anyway');
        }
        // If this tweet has a linked X article, navigate to it
        const articleLink = await page.evaluate(()=>{
            const links = Array.from(document.querySelectorAll('a[href*="/i/article/"], a[href*="x.com/i/article/"]'));
            return links.length > 0 ? links[0].href : null;
        });
        if (articleLink) {
            console.log('Found article link, navigating to:', articleLink);
            await page.goto(articleLink, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });
            await new Promise((resolve)=>setTimeout(resolve, 3000));
        }
        // Scroll to trigger lazy loading
        await page.evaluate(async ()=>{
            await new Promise((resolve)=>{
                let totalHeight = 0;
                const distance = 400;
                const timer = setInterval(()=>{
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
        await new Promise((resolve)=>setTimeout(resolve, 2000));
        // Clean up UI: remove sidebars, nav, login prompts
        await page.evaluate(()=>{
            const hide = (selector)=>{
                document.querySelectorAll(selector).forEach((el)=>{
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
            // Expand primary column to full width
            const primaryColumn = document.querySelector('[data-testid="primaryColumn"]');
            if (primaryColumn instanceof HTMLElement) {
                primaryColumn.style.maxWidth = '100%';
                primaryColumn.style.width = '100%';
                let parent = primaryColumn.parentElement;
                let count = 0;
                while(parent && count < 5){
                    parent.style.display = 'block';
                    parent = parent.parentElement;
                    count++;
                }
            }
            const style = document.createElement('style');
            style.textContent = `
                body { background: #fff !important; }
                article { font-family: sans-serif !important; }
                div[data-testid="tweetText"] { font-size: 15px !important; line-height: 1.5 !important; }
                div[style*="height"], div[style*="min-height"] { height: auto !important; min-height: 0 !important; }
                article div:empty { display: none !important; }
            `;
            document.head.appendChild(style);
        });
        const bodyHeight = await page.evaluate(()=>document.body.scrollHeight);
        const pdfBuffer = await page.pdf({
            width: '900px',
            height: `${bodyHeight + 40}px`,
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });
        await browser.close();
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', 'attachment; filename="article.pdf"');
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](pdfBuffer, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to generate PDF. Make sure the URL is correct and public.'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0055072d._.js.map