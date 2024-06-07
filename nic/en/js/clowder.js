class ClowderJS {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async createDataset(spaceId, name, description) {
        // Step 1: Create the dataset
        const createUrl = `${this.baseUrl}/datasets/createempty`;
        const createRequestBody = {
            name: name,
            description: description
        };
    
        try {
            const createResponse = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify(createRequestBody)
            });
            const dataset = await createResponse.json();
    
            // Check if the dataset was successfully created before proceeding
            if (dataset && dataset.id) {
                // Step 2: Associate the dataset with the space
                const associateUrl = `${this.baseUrl}/spaces/${spaceId}/addDatasetToSpace/${dataset.id}`;
                const associateResponse = await fetch(associateUrl, {
                    method: 'POST',
                    headers: {
                        // 'Content-Type': 'application/json', // May not be necessary if no body is sent
                        'X-API-Key': this.apiKey
                    }
                });
    
                if (!associateResponse.ok) {
                    throw new Error(`Failed to associate dataset with space: ${await associateResponse.text()}`);
                }
    
                return dataset; // Return the dataset information after successfully associating it with the space
            } else {
                throw new Error('Dataset creation failed or returned no ID.');
            }
        } catch (error) {
            console.error('Error creating and associating dataset:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }
    
    

    async uploadFile(datasetId, file) {
        const url = `${this.baseUrl}/datasets/${datasetId}/files`;
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-API-Key': this.apiKey
            },
            body: formData
        });
        return await response.json();
    }

    async addMetadata(datasetId, metadata) {
        const url = `${this.baseUrl}/datasets/${datasetId}/metadata`;
        const body = JSON.stringify(metadata);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            },
            body: body
        });
        return await response.json();
    }
}