import { JSDOM } from "jsdom";
import PDFProcessor from "./pdf_processor";

const PDF = new PDFProcessor("WilsonCenter");

async function main(page: number) {
    let res = await fetch(`https://www.wilsoncenter.org/api/search/topics-regions/taxonomy/285?
        _page=${page}&
        keywords=&
        _tab=insight-analysis&
        _limit=100
    `);

    let body = await res.json();

    let {document} = new JSDOM(body.results).window;

    let articles = document.getElementsByTagName("article");

    for (var headline of articles) {
        let h2 = headline.getElementsByTagName("h2")[0];
        let link = h2.getElementsByTagName("a")[0].getAttribute("href");
        if (!link?.startsWith("http")) {
            link = `https://www.wilsoncenter.org${link}`;
        }

        let articleRes = await fetch(link);
        let articleBody = await articleRes.text();
        await PDF.print(articleBody, link);
    }

    await PDF.merge();
    PDF.close();
}

for (var page = 0; page < 4; page++) {
    main(page);
}