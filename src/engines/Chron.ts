import puppeteer from "puppeteer";
import PDFProcessor from "../pdf_processor";
import { JSDOM } from "jsdom";
import { holdAndConfirm } from "../captcha_handler";
import { sleep } from "../utils";

const PDF = new PDFProcessor("Chron");
const browser = puppeteer.launch({
    headless: false,
    devtools: true,
    args: ["--no-sandbox"]
});

// engine for "Chron"
// Houston and Texas feed
async function HTX() {
    const page = await (await browser).newPage();
    await page.setViewport({
        width: 1850,
        height: 910
    })

    await page.goto(`https://www.chron.com/news/houston-texas/`, {
        waitUntil: "networkidle0",
        timeout: 120000,
    })

    let body;
    if ((await page.title()).indexOf("Access") != -1) {
        console.log("CAPTCHA detected, attempting to solve bypass");
        body = await holdAndConfirm(page);
    } else {
        body = await page.content();
    }
    console.log(body);

    let {document} = new JSDOM(body?.toString()).window;

    let articles = document.getElementsByTagName("article");

    for (var article of articles) {
        let h2 = article.getElementsByTagName("h2")[0];
        let link = h2.getElementsByTagName("a")[0].getAttribute("href");

        await page.goto(`https://www.chron.com${link}`, {
            waitUntil: "load"
        });

        PDF.print(await page.content(), link);

        console.log(link);
        await sleep(15000);
    }
}

// Politics feed
async function politics() {
    const page = await (await browser).newPage();

    
}

HTX();
politics();