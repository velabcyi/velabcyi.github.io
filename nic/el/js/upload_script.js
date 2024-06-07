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
    const clowder = new ClowderJS('3c60303b-5d59-49be-b3ed-56e274b51e66', 'https://cyprus.ncsa.illinois.edu/clowder/api');
    const datasetName = document.getElementById('subject').value || 'Default Dataset Name';
    const datasetDesc = document.getElementById('text').value || 'No Description Provided';
    
    try {
        const dataset = await clowder.createDataset('66621cb1e4b0d1566328ac6d', datasetName, datasetDesc);
        console.log('Created Dataset:', dataset);

        // Get all list items, which contain files
        const listItems = document.getElementById('filesList').children;
        for (const item of listItems) {
            if (item.file) {
                const fileResponse = await clowder.uploadFile(dataset.id, item.file);
                console.log('File uploaded:', fileResponse);
            }
        }

        const metadata = {
            data: {
                description: datasetDesc,
                uploadDate: new Date().toISOString() // Capturing the upload date and time
            }
        };
        const metadataResponse = await clowder.addMetadata(dataset.id, metadata);
        console.log('Metadata added:', metadataResponse);

        alert('Upload and dataset creation successful!');
    } catch (error) {
        console.error('Error during form submission:', error);
        alert('An error occurred during upload!');
    }
}
