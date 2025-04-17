const PDFProcessor = require("../dist/pdf_processor.js").default;

const OutputDirs = [
    "WilsonCenter",
    "CSIS",
    "CFR_InBriefs",
    "Brookings"
]

async function main() {
    for (var dir of OutputDirs) {   
        const PDF = new PDFProcessor(dir);
        await PDF.merge()
        PDF.close();
    }
}
main()