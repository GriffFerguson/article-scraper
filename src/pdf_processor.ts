import { Readability } from "@mozilla/readability";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import puppeteer, { Browser, Page } from "puppeteer";
import { JSDOM } from "jsdom";

export default class PDFProcessor {
    private OUTPUT_DIR: string;
    private STYLES: string;
    private browser!: Browser;
    
    constructor(
        outputDir: string
    ) {
        this.OUTPUT_DIR = join(__dirname, "../output/", outputDir);
        if (!existsSync(this.OUTPUT_DIR)) {
            mkdirSync(this.OUTPUT_DIR);
        }

        this.STYLES = readFileSync(join(__dirname, "../assets/pdf_style.css"), {encoding: "utf8"});
        puppeteer.launch()
            .then(browser => {
                this.browser = browser;
            })
    }

    async print(dom: Document | string, link: string) {
        let page = await this.browser.newPage();
        console.log("Processing document with link " + link);
        if (typeof dom === "string") {
            dom = new JSDOM(dom).window.document
        }

        let readable = new Readability(dom).parse();

        // add links to the bottom
        readable!.content += `<br/><br/><p><b>This article was originally published at <a href="${link}">${link}</a></b></p>`;
        readable!.textContent += `\n\nThis article was originally published at ${link}`;

        // ensure title is displayed and add styles
        readable!.content = `<!DOCTYPE html><html><head><title>${readable?.title}</title><style>${this.STYLES}</style></head><body>${readable?.content}</body></html>`

        // render article
        let dataURI = `data:text/html;base64,${Buffer.from(readable!.content).toString("base64")}`;

        await page.goto(dataURI)
        await page.pdf({
            path: join(this.OUTPUT_DIR, readable!.title + ".pdf")
        })

        page.close();
    }

    close() {
        return this.browser.close();
    }
}