// testDocx.js
const { Packer, Document, Paragraph, TextRun } = require('docx');

let doc = createVerySimpleDocument();

Packer.toBuffer(doc).then(buffer => {
    console.log("Document created successfully!");
}).catch(err => {
    console.error("Error creating document:", err);
});