const fetch = require('node-fetch');
const fs = require('fs');
const logFilePath = './clowder.log';

// Function to log messages to a file with a timestamp
function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`, 'utf8');
}

const clowderAPIKey = process.env.CLOWDER_API_KEY;
const baseUrl = 'https://cyprus.ncsa.illinois.edu/clowder/api';

// Function to create a dataset and add it to a specific space
async function createDataset(spaceId, name, description) {
    const url = `${baseUrl}/datasets/createempty`;
    logToFile(`Attempting to create dataset with name: ${name} and description: ${description}`);
    logToFile(clowderAPIKey)
    try {
        const createResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': clowderAPIKey
            },
            body: JSON.stringify({ name, description })
        });

        if (!createResponse.ok) {
            logToFile(`Failed to create dataset: HTTP status ${createResponse.status}`);
            throw new Error(`HTTP status ${createResponse.status}`);
        }

        const dataset = await createResponse.json();
        logToFile(`Dataset created with ID: ${dataset.id}`);

        // Associate the dataset with a space if spaceId is provided
        if (spaceId) {
            logToFile(`Adding dataset to space.`);
            await associateDatasetWithSpace(spaceId, dataset.id);
        }
        else{
            logToFile(`Not adding dataset to space.`);
        }

        return dataset;
    } catch (error) {
        logToFile(`Error in createDataset function: ${error.message}`);
        throw error;
    }
}

async function associateDatasetWithSpace(spaceId, datasetId) {
    const associateUrl = `${baseUrl}/spaces/${spaceId}/addDatasetToSpace/${datasetId}`;
    logToFile(`Attempting to associate dataset ID ${datasetId} with space ID ${spaceId}`);
    try {
        const associateResponse = await fetch(associateUrl, {
            method: 'POST',
            headers: {
                'X-API-Key': clowderAPIKey
            }
        });

        if (!associateResponse.ok) {
            logToFile(`Failed to associate dataset with space: HTTP status ${associateResponse.status}`);
            throw new Error(`Failed to associate dataset with space: ${await associateResponse.text()}`);
        }

        logToFile(`Dataset ID ${datasetId} successfully associated with space ID ${spaceId}`);
    } catch (error) {
        logToFile(`Error associating dataset with space: ${error.message}`);
        throw error;
    }
}

// Function to add metadata to a dataset
async function addMetadata(datasetId, metadata) {
    const url = `${baseUrl}/datasets/${datasetId}/metadata`;
    logToFile(`Attempting to add metadata to dataset ID ${datasetId}: ${JSON.stringify(metadata)}`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': clowderAPIKey
            },
            body: JSON.stringify(metadata)
        });

        if (!response.ok) {
            logToFile(`Failed to add metadata: HTTP status ${response.status}`);
            throw new Error(`HTTP status ${response.status}`);
        }

        const result = await response.json();
        logToFile(`Metadata added successfully to dataset ID ${datasetId}`);
        return result;
    } catch (error) {
        logToFile(`Error adding metadata to dataset: ${error.message}`);
        throw error;
    }
}

module.exports = { createDataset, addMetadata };
