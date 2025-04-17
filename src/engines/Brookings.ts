import PDFProcessor from "../pdf_processor";
import { sleep } from "../utils";

const PDF = new PDFProcessor("Brookings");

async function pageProcessor(page: number) {
    let res = await fetch(
        `https://xgc391w2we-2.algolianet.com/1/indexes/*/queries?x-algolia-agent=Algolia for JavaScript (4.18.0); Browser (lite); instantsearch.js (4.56.5); JS Helper (3.13.2)&x-algolia-api-key=52dcafdcc61d4c5885aeccd7d2e4d788&x-algolia-application-id=XGC391W2WE`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `{"requests":[{"indexName":"prod_searchable_posts","params":"distinct=true&facetFilters=%5B%22content_type%3ACommentary%22%5D&facets=%5B%22content_type%22%2C%22tax_ids.topic_tax%22%2C%22tax_ids.region_tax%22%2C%22expert_ids%22%2C%22entity_ids%22%2C%22locale%22%5D&filters=(post_type%3Aarticle%20OR%20post_type%3Abook%20OR%20post_type%3Aevent%20OR%20post_type%3Anews)%20AND%20(tax_ids.topic_tax%3A26)%20%20AND%20(locale%3Aen)%20AND%20(locale%3Aen)&highlightPostTag=__%2Fais-highlight__&highlightPreTag=__ais-highlight__&hitsPerPage=10&maxValuesPerFacet=30000&page=${page}&query=&tagFilters="}]}`
        }
    )

    let results = await res.json();
    if (Object.keys(results).indexOf("status") && results.status != 200) {
        console.error("Received error: ", results)
        return;
    }

    for (var article of results.results[0].hits) {
        let articleRes = await fetch(article.permalink);
        let articleBody = await articleRes.text();
        await PDF.print(articleBody, article.permalink);

        await sleep(2000);
    }
}

for (var page = 0; page < 10; page++) {
    pageProcessor(page);
}