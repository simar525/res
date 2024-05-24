const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const app = express();
const port = process.env.PORT || 3000;

// Body parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from 'public' directory (create this directory in your project)
app.use(express.static('public'));

app.get('/test', (req, res) => {
  res.send('Test route is working');
});

// Endpoint to receive chat data and generate DOCX
app.post('/exportChat', (req, res) => {
    const chatData = req.body.chatData;

    // Load the DOCX template as a binary content (you need a template in the 'templates' folder)
    const templateFile = "templates/chatTemplate.docx";
    const content = fs.readFileSync(templateFile, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    // Set the template data
    const templateData = {
        ChatHistory: chatData.map(chat => {
            const prefix = chat.type === 'userMessage' ? 'User' : 'AI';
            return `${prefix}: ${chat.message}`;
        }).join('\n\n')
    };
    doc.setData(templateData);

    try {
        // Render the document
        doc.render();
    } catch (error) {
        const err = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
        }
        console.error(JSON.stringify(err));
        res.status(500).json({ error: 'Error in document generation' });
        return;
    }

    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    // Send document as a download
    res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename=chatHistory.docx'
    });

    res.send(buf);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});