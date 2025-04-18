import { Readability } from "@mozilla/readability";
import { readFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import puppeteer, { Browser } from "puppeteer";
import { JSDOM } from "jsdom";
import { PDFDocument, PDFPage } from "pdf-lib";

export default class PDFProcessor {
    private SOURCE: string;
    private OUTPUT_DIR: string;
    private STYLES: string;
    private browser!: Browser;
    private BlankPDF!: PDFPage;
    
    constructor(
        outputDir: string
    ) {
        this.SOURCE = outputDir;
        this.OUTPUT_DIR = join(__dirname, "../output/", outputDir);
        if (!existsSync(this.OUTPUT_DIR)) {
            mkdirSync(this.OUTPUT_DIR);
        }

        this.STYLES = readFileSync(join(__dirname, "../assets/pdf_style.css"), {encoding: "utf8"});
        
        puppeteer.launch()
            .then(browser => {
                this.browser = browser;
            })
        
            PDFDocument.create().then(doc => {
            this.BlankPDF = doc.getPage(0);
        });
    }

    async print(dom: Document | string, link: string | null) {
        let page = await this.browser.newPage();
        console.log("Processing document with link " + link);
        if (typeof dom === "string") {
            dom = new JSDOM(dom).window.document
        }

        let readable = new Readability(dom).parse();
        if (Object.keys(readable || {}).indexOf("content") == -1 ){
            console.error("WARNING! Unable to parse readable content from " + link);
            return;
        }
        // add links to the bottom
        readable!.content = `${readable?.content}<br/><br/><p><b>This article was originally published at <a href="${link}">${link}</a></b></p>`;
        readable!.textContent += `\n\nThis article was originally published at ${link}`;

        let topics = [
            "Things Trump Did",
            "Tariffs",
            "Economics",
            "Healthcare",
            "Immigration"
        ]
        let topic = "";
        
        // ensure title is displayed and add styles
        readable!.content = `
            <!DOCTYPE html>
            <html><head>
                <title>${readable?.title}</title>
                <style>${this.STYLES}</style>
            </head><body>
                <h1>${readable?.title}</h1>
                ${topic ? `<p><b>Suggested categorization: ${topic}</b></p>` : ""}
                ${readable?.content}
            </body></html>`

        readable!.content = readable!.content.replace(/’/gm, "'");
        readable!.content = readable!.content.replace(/—/gm, "--");
        readable!.content = readable!.content.replace(/”/gm, '"');
        readable!.content = readable!.content.replace(/“/gm, '"');

        // render article
        let base64 = Buffer.from(readable!.content, "utf-8").toString("base64");
        let dataURI = `data:text/html;base64,${base64}`;

        try {
            await page.goto(dataURI)
            await page.pdf({
                path: join(this.OUTPUT_DIR, readable!.title + ".pdf")
            })
            await page.close();
        } catch(e) {
            console.error(e);
        }
    }

    async merge() {
        let files = readdirSync(this.OUTPUT_DIR);

        let startFile = readFileSync(join(this.OUTPUT_DIR, files.shift()!));
        let startPDF = await PDFDocument.load(startFile);

        if (startPDF.getPageCount() % 2 == 1) {
            startPDF.addPage(this.BlankPDF);
        }

        for (var file of files) {
            console.log("adding pdf " + file)
            let donorPDF = await PDFDocument.load(readFileSync(join(this.OUTPUT_DIR, file)));
            let pageCount = donorPDF.getPageCount();

            if (pageCount % 2 == 1) {
                console.log("added extra blank page due to odd page count")
                donorPDF.addPage(this.BlankPDF);
            }
            pageCount = donorPDF.getPageCount();

            for (var page = 0; page < pageCount; page++) {
                let [donorPage] = await startPDF.copyPages(donorPDF, [page]);
                startPDF.addPage(donorPage);
            }
        }
        
        let pdfToSave = await startPDF.save();
        writeFileSync(join(__dirname, "../output", `${this.SOURCE}.pdf`), pdfToSave);

        console.log("done merging");
    }

    async close() {
        return await this.browser.close();
    }
}