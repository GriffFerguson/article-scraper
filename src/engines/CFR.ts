// engine for "Council on Foreign Relations" in particular the "In-Briefs" category
import PDFProcessor from "../pdf_processor";
import {JSDOM} from "jsdom";

const PDF = new PDFProcessor("CFR_InBriefs");

async function main(page: number) {
    let res = await fetch(`https://www.cfr.org/views/ajax?
        _wrapper_format=drupal_ajax&
        view_name=secondary_destination_pages&
        view_display_id=in_brief_filter_block&
        view_path=/node/225934&
        view_dom_id=787b7290403961d94244b48bafaab3b42c44f7d05713ea61e6fad4432115e2ad&
        page=${page}
    `, {
        headers: {
            "Cookie":  "__cf_bm=WYVxx5329ccq5sYGeq_9cykDEtET7L.U1GcH6sWLxhI-1744724701-1.0.1.1-P.p4NqbGzxsErOpTAuYpQthLz.HCibAHhPuGbogGqOF_dloEXMR45G7.LlCahOEJwbef0KnEhy1arbCfSiykkwZ5ODRzZm22f5EVC4h7NWY"
        }
    })

    let body = await res.text();

    let results = JSON.parse(body);

    let {document} = new JSDOM(results[3].data).window;

    let articles = document.getElementsByClassName("card-article-large");

    for (var article of articles) {
        let link = article.getElementsByTagName("a")[1].getAttribute("href")!;

        let articleRes = await fetch(`https://www.cfr.org${link}`);
        let articleBody = await articleRes.text();
        await PDF.print(articleBody, link);
    }
}

for (var page = 0; page < 5; page++) {
    main(page);
}