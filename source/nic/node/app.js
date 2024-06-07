const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const fs = require('fs');
const { createDataset, addMetadata } = require('./clowder');
const logFilePath = './server.log';

function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`, 'utf8');
}

require('dotenv').config();
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'] // Allow only GET and POST requests
}));
app.use(bodyParser.json());



// Endpoint to create a dataset in a specific space
app.post('/api/dataset/create', async (req, res) => {
    const { spaceId, name, description } = req.body;
    logToFile(`Received request to create dataset: ${JSON.stringify(req.body)}`);
    try {
        const dataset = await createDataset(spaceId, name, description);
        logToFile(`Dataset created successfully: ID ${dataset.id}`);
        res.json({
            datasetId: dataset.id,
            uploadUrl: `https://cyprus.ncsa.illinois.edu/clowder/api/datasets/${dataset.id}/files`,
            key: `e21b857a-97b1-4a9e-bfed-4f3542d176f2`
        });
    } catch (error) {
        logToFile(`Failed to create dataset: ${error}`);
        console.error('Failed to create dataset:', error);
        res.status(500).json({ error: error.toString() });
    }
});

// Endpoint to add metadata to a dataset
app.post('/api/dataset/:datasetId/metadata', async (req, res) => {
    const { datasetId } = req.params;
    const metadata = req.body;
    logToFile(`Received request to add metadata to dataset ${datasetId}: ${JSON.stringify(metadata)}`);
    try {
        logToFile(`geoing to add metadata to dataset: ${datasetId}`);

        const result = await addMetadata(datasetId, metadata);
        logToFile(`Metadata added successfully to dataset ${datasetId}`);
        res.json(result);
    } catch (error) {
        logToFile(`Failed to add metadata to dataset ${datasetId}: ${error}`);
        console.error('Failed to add metadata:', error);
        res.status(500).json({ error: error.toString() });
    }
});




// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    logToFile(`Server running on port ${port}`);
});
