// Declare mediaRecorder globally within the script
let mediaRecorder;
let audioChunks = [];

document.getElementById('startRecord').addEventListener('click', function() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            // Check if MediaRecorder is available or exit function
            if (typeof MediaRecorder === 'undefined') {
                console.error('MediaRecorder not supported on this browser.');
                return;
            }

            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('audioPlayback').src = audioUrl;
                document.getElementById('audioPlayback').hidden = false;
                audioChunks = []; // Clear the chunks after creating the blob
            };

            mediaRecorder.start();
            console.log("Recorder started");
            document.getElementById('stopRecord').disabled = false;
            document.getElementById('startRecord').disabled = true;
        })
        .catch(function(err) {
            console.error('Could not get media stream:', err);
        });
});

document.getElementById('stopRecord').addEventListener('click', function() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        console.log("Recorder stopped");
        document.getElementById('startRecord').disabled = false;
        document.getElementById('stopRecord').disabled = true;
    }
});


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
