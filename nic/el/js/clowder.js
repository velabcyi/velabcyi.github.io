class ClowderJS {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    // async createDataset(spaceId, name, description) {
    //     const url = `${this.baseUrl}/datasets/`;
    //     const body = JSON.stringify({
    //         name,
    //         description,
    //         spaceId
    //     });

    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'X-API-Key': this.apiKey
    //         },
    //         body: body
    //     });
    //     return await response.json();
    // }

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
                //https://cyprus.ncsa.illinois.edu/clowder/api/spaces/66621cb1e4b0d1566328ac6d/addDatasetToSpace/66622a58e4b0d1566328adc4
                //https://cyprus.ncsa.illinois.edu/clowder/api/spaces/66621cb1e4b0d1566328ac6d/addDatasetToSpace/66622a58e4b0d1566328adc4
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

// // Example Usage
// const clowder = new ClowderJS('3c60303b-5d59-49be-b3ed-56e274b51e66', 'https://cyprus.ncsa.illinois.edu/clowder/api');

// // Create a new dataset
// clowder.createDataset('66621cb1e4b0d1566328ac6d', 'Dataset Name', 'Dataset Description').then(dataset => {
//     console.log('Created Dataset:', dataset);

//     // Upload a file
//     const fileInput = document.querySelector('input[type="file"]');
//     const file = fileInput.files[0];
//     clowder.uploadFile(dataset.id, file).then(fileResponse => {
//         console.log('File uploaded:', fileResponse);

//         // Add metadata to the dataset
//         const metadata = {
//             data: {
//                 description: "This is a test dataset with metadata."
//             }
//         };
//         clowder.addMetadata(dataset.id, metadata).then(metadataResponse => {
//             console.log('Metadata added:', metadataResponse);
//         });
//     });
// });
