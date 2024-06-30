//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
function startRecording() {
    console.log("startRecording() called");
    var constraints = { audio: true, video: false };

    // Disable the record button immediately to prevent multiple clicks
    document.getElementById('recordButton').disabled = true;

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

        gumStream = stream;
        audioContext = new AudioContext();

        console.log("Format: 2 channel WAV @ " + audioContext.sampleRate/1000 + "kHz");
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

        // Enable the stop button
        document.getElementById('stopButton').disabled = false;
    }).catch(function(err) {
        console.error("getUserMedia error:", err);
        alert("Microphone access denied or error occurred. Please try again.");
        
        // Re-enable the record button and ensure stop button is disabled
        document.getElementById('recordButton').disabled = false;
        document.getElementById('stopButton').disabled = true;
    });
}

// function startRecording() {
// 	console.log("startRecording() called");
// 	// Ensure all variables are scoped to the entire function, if needed elsewhere
// 	var constraints = { audio: true, video: false }

// 	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
// 		console.log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

// 		gumStream = stream; // Assign stream to gumStream
// 		audioContext = new AudioContext(); // Create a new audio context

// 		// Display the recording format
// 		console.log("Format: 2 channel WAV @ " + audioContext.sampleRate/1000 + "kHz");
// 		input = audioContext.createMediaStreamSource(stream); // Create an audio source node from the stream

// 		// Initialize the WebAudioRecorder
// 		recorder = new WebAudioRecorder(input, {
// 			workerDir: "js/", // Directory where the worker js files are located
// 			encoding: "wav", // Set encoding to WAV
// 			numChannels: 2, // Stereo audio recording
// 			onEncoderLoading: function(recorder, encoding) {
// 				console.log("Loading " + encoding + " encoder...");
// 			},
// 			onEncoderLoaded: function(recorder, encoding) {
// 				console.log(encoding + " encoder loaded");
// 			}
// 		});

// 		recorder.onComplete = function(recorder, blob) { 
// 			console.log("Encoding complete");
// 			createDownloadLink(blob, "wav"); // Always use WAV as the encoding type
// 		};

// 		// Recorder options
// 		recorder.setOptions({
// 			timeLimit: 120, // Maximum recording time
// 			encodeAfterRecord: true, // Encoding the recorded audio immediately after recording
// 		});

// 		// Start recording
// 		recorder.startRecording();
// 		console.log("Recording started");

// 	}).catch(function(err) {
// 	  	// Enable the record button if getUserMedia() fails
//     	document.getElementById('recordButton').disabled = false;
//     	document.getElementById('stopButton').disabled = true;
//     	console.error("getUserMedia error:", err);
// 	});

// 	// Disable the record and enable the stop button
// 	document.getElementById('recordButton').disabled = true;
// 	document.getElementById('stopButton').disabled = false;
// }


// function stopRecording() {
// 	console.log("stopRecording() called");
	
// 	//stop microphone access
// 	gumStream.getAudioTracks()[0].stop();

// 	//disable the stop button
// 	stopButton.disabled = true;
// 	recordButton.disabled = false;
	
// 	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
// 	recorder.finishRecording();

// 	console.log('Recording stopped');
// }
function stopRecording() {
    console.log("stopRecording() called");
    
    if (gumStream) {
        gumStream.getAudioTracks()[0].stop();
    }

    if (recorder && recorder.finishRecording) {
        recorder.finishRecording();
    }

    // Always reset the button states
    document.getElementById('stopButton').disabled = true;
    document.getElementById('recordButton').disabled = false;

    console.log('Recording stopped');
}
function createDownloadLink(blob, encoding) {
    const url = URL.createObjectURL(blob);
    const au = document.createElement('audio');
    const li = document.createElement('li');
    const removeBtn = document.createElement('button');  // Button to remove the file
    const fileName = new Date().toISOString() + '.' + encoding;  // Generate a filename based on the current timestamp and encoding

    // Add controls to the <audio> element
    au.controls = true;
    au.src = url;

    // Create the File object from the blob
    const file = new File([blob], fileName, {type: `audio/${encoding}`});

    // Store the file reference in the li element for later upload
    li.file = file;

    // Create and configure the remove button
    removeBtn.textContent = 'X';
    removeBtn.onclick = function() {
        URL.revokeObjectURL(au.src);  // Clean up the object URL
        li.parentNode.removeChild(li);  // Remove the li element from the list
    };

	appendFileToList(file);
	const previewArea = document.getElementById('preview-attachments');
    previewArea.style.display = "block";

    // // Append audio and remove button to the list item
    // li.appendChild(au);
    // li.appendChild(removeBtn);

    // // Add the list item to the unified file list
    // document.getElementById('filesList').appendChild(li);
	// const previewArea = document.getElementById('preview-attachments');
    // previewArea.style.display = files.length>0?"block":"none"; // Set to default or 'block' to show

}


// function createDownloadLink(blob, encoding) {
//     var url = URL.createObjectURL(blob);
//     var au = document.createElement('audio');
//     var li = document.createElement('li');
//     // var link = document.createElement('a');
//     var removeBtn = document.createElement('button');  // Button to remove the file

//     // Add controls to the <audio> element
//     au.controls = true;
//     au.src = url;

//     // // Link the <a> element to the blob
//     // link.href = url;
//     // link.download = new Date().toISOString() + '.' + encoding;
//     // link.innerHTML = 'Download ' + link.download;

//     // Add the new audio and <a> elements to the li element
//     li.appendChild(au);
//     // li.appendChild(link);

//     // Create and configure the remove button
//     removeBtn.textContent = 'X';
//     removeBtn.onclick = function() {
//         li.parentNode.removeChild(li);  // Remove the li element from the list
//     };

//     // Append the remove button to the list item
//     li.appendChild(removeBtn);

//     // Add the li element to the unified list
//     document.getElementById('filesList').appendChild(li);
// }

//helper function
// function __log(e, data) {
// 	log.innerHTML += "\n" + e + " " + (data || '');
// }