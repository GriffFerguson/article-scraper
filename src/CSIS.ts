// engine for "Center for Strategic and International Studies"
import PDFProcessor from "./pdf_processor";
import { JSDOM } from "jsdom";

const PDF = new PDFProcessor("CSIS");

async function main(page: number) {
    let res = await fetch(`https://www.csis.org/views/ajax?
        f[0]=content_type:report&
        f[1]=report_type:3034&
        page=${page}&
        view_name=search_default_index&
        view_path=/node/101271&
        view_display_id=block_1&
        view_dom_id=e7a45816617bddcace79141e149c15f2f29af394e4f472973a753420671aeeaa
    `);

    let results = await res.json();

    let {document} = new JSDOM(results[3].data).window;

    let articles = document.getElementsByTagName("article")

    for (var article of articles) {
        let h3 = article.getElementsByTagName("h3")[0];
        let link = h3.getElementsByTagName("a")[0].getAttribute("href")!;
        
        let articleRes = await fetch(link);
        let articleBody = await articleRes.text();
        await PDF.print(articleBody, link);
    }

    await PDF.merge();
    PDF.close()
}
for (var page = 0; page < 4; page++) {
    main(page);
}