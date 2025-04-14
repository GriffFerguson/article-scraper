const PDFProcessor = require("../dist/pdf_processor.js").default;

const PDF = new PDFProcessor("WilsonCenter");

PDF.merge()