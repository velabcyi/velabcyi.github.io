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
    li.textContent = file.name;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.onclick = function() {
        li.parentNode.removeChild(li);
    };
    li.appendChild(removeBtn);
    document.getElementById('filesList').appendChild(li);
}


function submitForm() {
    const formData = new FormData(document.getElementById('mediaForm'));
    formData.append('audioBlob', document.getElementById('audioPlayback').src);
    fetch('https://your-clowder-instance.com/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Upload successful!');
    })
    .catch(error => console.error('Error:', error));
}
