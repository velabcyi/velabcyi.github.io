document.getElementById('fileUpload').addEventListener('change', function(event) {
    handleFiles(event.target.files);
});

document.getElementById('photo').addEventListener('change', function(event) {
    handleFiles(event.target.files);
});

function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        appendFileToList(files[i]);
    }
}

function appendFileToList(file) {
    const li = document.createElement('li');
    const textNode = document.createTextNode(file.name);
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = function() {
        li.parentNode.removeChild(li);
    };

    // Store file reference directly on the list item for later access
    li.file = file;

    // Create a preview for image and audio files
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.height = 60;
        img.onload = function() {
            URL.revokeObjectURL(this.src);
        };
        li.appendChild(img);
    } else if (file.type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = URL.createObjectURL(file);
        audio.onloadend = function() {
            URL.revokeObjectURL(this.src);
        };
        li.appendChild(audio);
    }

    li.appendChild(textNode);
    li.appendChild(removeBtn);
    document.getElementById('filesList').appendChild(li);
}

async function submitForm() {
    const apiUrl = 'https://clowderapi.web.illinois.edu/api/dataset/create';
    const datasetName = document.getElementById('subject').value || 'Default Dataset Name';
    const datasetDesc = document.getElementById('text').value || 'No Description Provided';
    const email = document.getElementById('email').value;
    const rights = document.getElementById('rights').value;
    const contributorInfo = document.getElementById('contributorInfo').value || '';
    console.log("Submitting form");

    // Validate inputs here if necessary
    try {
        // Disable submit button and show a loading indicator
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('loadingIndicator').style.display = 'block';
        console.log("Creating Dataset");

        // API call to create dataset
        const createResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spaceId:"66621cb1e4b0d1566328ac6d", name: datasetName, description: datasetDesc })
        });
        console.log("Returned");


        if (!createResponse.ok) {
            throw new Error(`HTTP status ${createResponse.status}`);
        }

        const dataset = await createResponse.json();
        console.log('Created Dataset:', dataset);
        console.log("Uploading metadata");

        // Metadata handling
        const metadata = {
            data: {
                subject: datasetName,
                description: datasetDesc,
                email: email,
                rights: rights,
                contributorInfo: contributorInfo,
                uploadDate: new Date().toISOString()
            }
        };
        console.log("Created metadata object");

        console.log(metadata);
        console.log("posting");

        const metadataResponse = await fetch(`https://clowderapi.web.illinois.edu/api/dataset/${dataset.datasetId}/metadata/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metadata)
        });

        if (!metadataResponse.ok) {
            throw new Error(`Error adding metadata: ${metadataResponse.statusText}`);
        }

        console.log('Metadata added:', await metadataResponse.json());

        // File uploads
        await handleFileUploads(dataset.uploadUrl, dataset.key);

        alert('Upload and dataset creation successful!');
    } catch (error) {
        console.error('Error during form submission:', error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        // Re-enable submit button and hide loading indicator
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

async function handleFileUploads(uploadUrl, apiKey) {
    const listItems = document.getElementById('filesList').children;
    if (listItems.length > 0) {
        console.log("Uploading files...");
        for (const item of listItems) {
            if (item.file) {
                // Prepare FormData with file
                const formData = new FormData();
                formData.append('file', item.file);
                console.log('Uploading file:', item.file.name); // Log the file name being uploaded

                // Configure fetch call
                const fileResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        'X-API-Key': apiKey // Properly use the API key in headers if applicable
                    },
                    body: formData
                });

                // Handle response
                if (fileResponse.ok) {
                    const fileResult = await fileResponse.json();
                    console.log('File uploaded:', fileResult);
                } else {
                    console.error('Error uploading file:', fileResponse.statusText);
                }
            }
        }
    } else {
        console.log("No files to upload.");
    }
}
