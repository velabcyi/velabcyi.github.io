document.getElementById('startRecord').addEventListener('click', startRecording);
document.getElementById('stopRecord').addEventListener('click', stopRecording);

let mediaRecorder;
let audioChunks = [];

function startRecording() {
    const audioConstraints = {
        audio: {
            sampleSize: 16,
            sampleRate: 44100,
            channelCount: 2,
            echoCancellation: true,
            noiseSuppression: true
        }
    };

    navigator.mediaDevices.getUserMedia(audioConstraints)
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            document.getElementById('stopRecord').disabled = false;
            document.getElementById('startRecord').disabled = true;
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
        })
        .catch(error => console.error('Error accessing media devices:', error));
}


function stopRecording() {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById('audioPlayback').src = audioUrl;
        document.getElementById('audioPlayback').hidden = false;
        audioChunks = [];
        document.getElementById('startRecord').disabled = false;
        document.getElementById('stopRecord').disabled = true;
    };
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
