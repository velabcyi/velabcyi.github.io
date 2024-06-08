  //UPLOAD HANDLING
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
    const previewArea = document.getElementById('preview-attachments');
    previewArea.style.display = files.length>0?"block":"none"; // Set to default or 'block' to show
}
function clearFiles() {
        const filesList = document.getElementById('filesList');
        const fileUpload = document.getElementById('fileUpload');
        const photo = document.getElementById('photo');
        const previewArea = document.getElementById('preview-attachments');
      
        // Remove all <li> elements from the filesList
        while (filesList.firstChild) {
          filesList.removeChild(filesList.firstChild);
        }
      
        // Clear the value of the file input elements
        fileUpload.value = '';
        photo.value = '';
      
        // Hide the preview area if there are no files remaining
        previewArea.style.display = 'none';
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
                    console.log('File uploaded.');
                    // console.log('File uploaded:', fileResult);
                } else {
                    console.error('Error uploading file:', fileResponse.statusText);
                }
            }
        }
    } else {
        console.log("No files to upload.");
    }
}
