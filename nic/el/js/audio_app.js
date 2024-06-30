// Existing variables and setup
URL = window.URL || window.webkitURL;
var gumStream, recorder, input, AudioContext, audioContext;
AudioContext = window.AudioContext || window.webkitAudioContext;

// New variables for UI control
let isRecording = false;
let recordingStartTime;
let recordInterval;
const maxRecordingTime = 120; // Maximum duration in seconds (2 minutes)

// Get UI elements
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');
const timer = document.getElementById('timer');

// Add event listeners
recordButton.addEventListener("click", () => toggleRecording(true));
stopButton.addEventListener("click", () => toggleRecording(false));

function toggleRecording(start) {
    if (start && !isRecording) {
        startRecording();
    } else if (isRecording) {
        stopRecording();
    }
}

function startRecording() {
    console.log("startRecording() called");
    var constraints = { audio: true, video: false };

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

        isRecording = true;
        recordButton.style.display = 'none';
        stopButton.style.display = 'inline';
        stopButton.disabled = false;
        recordingStartTime = Date.now();
        timer.style.display = 'inline';
        recordInterval = setInterval(updateTimer, 1000);

        gumStream = stream;
        audioContext = new AudioContext();

        input = audioContext.createMediaStreamSource(stream);

        recorder = new WebAudioRecorder(input, {
            workerDir: "js/",
            encoding: "wav",
            numChannels: 2,
            onEncoderLoading: function(recorder, encoding) {
                console.log("Loading " + encoding + " encoder...");
            },
            onEncoderLoaded: function(recorder, encoding) {
                console.log(encoding + " encoder loaded");
            }
        });

        recorder.onComplete = function(recorder, blob) { 
            console.log("Encoding complete");
            createDownloadLink(blob, "wav");
        };

        recorder.setOptions({
            timeLimit: 120,
            encodeAfterRecord: true,
        });

        recorder.startRecording();
        console.log("Recording started");

    }).catch(function(err) {
        console.error("getUserMedia error:", err);
        handlePermissionDenial(err);
    });
}
function handlePermissionDenial(err) {
    const lang = document.documentElement.lang;
    let messages = {
        en: {
            denied: "Microphone access was denied. ",
            dismissed: "Please try again and click 'Allow' in the permission dialog.",
            settings: "You may need to enable microphone access in your browser settings.",
            notFound: "No microphone was found. Please ensure your microphone is properly connected.",
            unexpected: "An unexpected error occurred. Please check your browser settings or try a different browser."
        },
        el: {
            denied: "Η πρόσβαση στο μικρόφωνο απορρίφθηκε. ",
            dismissed: "Παρακαλώ δοκιμάστε ξανά και κάντε κλικ στο 'Επιτρέπεται' στο παράθυρο διαλόγου άδειας.",
            settings: "Ίσως χρειαστεί να ενεργοποιήσετε την πρόσβαση στο μικρόφωνο στις ρυθμίσεις του προγράμματος περιήγησής σας.",
            notFound: "Δεν βρέθηκε μικρόφωνο. Βεβαιωθείτε ότι το μικρόφωνό σας είναι σωστά συνδεδεμένο.",
            unexpected: "Παρουσιάστηκε ένα απροσδόκητο σφάλμα. Παρακαλώ ελέγξτε τις ρυθμίσεις του προγράμματος περιήγησής σας ή δοκιμάστε ένα διαφορετικό πρόγραμμα περιήγησης."
        }
    };

    // Default to English if the language is not Greek
    const m = messages[lang === 'el' ? 'el' : 'en'];

    let message = m.denied;

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        if (err.message.includes('Permission dismissed')) {
            message += m.dismissed;
        } else {
            message += m.settings;
        }
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = m.notFound;
    } else {
        message += m.unexpected;
    }

    alert(message);

    resetUI();
}
function getBrowserSpecificSettingsLink() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("firefox") > -1) {
        return "about:preferences#privacy";
    } else if (userAgent.indexOf("chrome") > -1) {
        return "chrome://settings/content/microphone";
    } else if (userAgent.indexOf("safari") > -1) {
        return "https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac";
    }
    return null;
}

function stopRecording() {
    console.log("stopRecording() called");
    
    if (gumStream) {
        gumStream.getAudioTracks()[0].stop();
    }

    if (recorder && recorder.finishRecording) {
        recorder.finishRecording();
    }

    resetUI();
    clearInterval(recordInterval);
    console.log('Recording stopped');
}

function resetUI() {
    isRecording = false;
    stopButton.style.display = 'none';
    recordButton.style.display = 'inline';
    recordButton.disabled = false;
    timer.style.display = 'none';
    timer.textContent = "00:00 / 02:00 🔴";
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - recordingStartTime) / 1000);
    if (elapsedTime >= maxRecordingTime) {
        toggleRecording(false); // Stop recording if max time is reached
    } else {
        timer.textContent = formatTime(elapsedTime) + ' / 02:00 🔴';
    }
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    minutes = minutes.toString().padStart(2, '0');
    seconds = seconds.toString().padStart(2, '0');
    return minutes + ':' + seconds;
}

function createDownloadLink(blob, encoding) {
    const url = URL.createObjectURL(blob);
    const fileName = new Date().toISOString() + '.' + encoding;
    const file = new File([blob], fileName, {type: `audio/${encoding}`});
    appendFileToList(file);
    const previewArea = document.getElementById('preview-attachments');
    previewArea.style.display = "block";
}