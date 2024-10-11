
const videoFiles = ["panorama-at-cafe_compressed.mp4", "parkinglog-to-tarmac-day-with-photos_compressed.mp4", "dialogue-checkin_compressed.mp4", "3-interactions-at-passport_compressed.mp4", "tarmac-and-bus_compressed.mp4", "parking-tarmac-plane-video_compressed.mp4", "full-run-1_compressed.mp4", "walkway-pano_compressed.mp4", "main-hall-walkway-pano_compressed.mp4", "clip_13_compressed.mp4", "clip_3_compressed.mp4", "clip_9_compressed.mp4", "clip_12_compressed.mp4", "clip_2_compressed.mp4"];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getBasePath() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.hasAttribute('data-video-base-path')) {
            return script.getAttribute('data-video-base-path');
        }
    }
    return ''; // Default to current directory if not specified
}

function getVideoPath(filename) {
    const basePath = getBasePath();
    return `${basePath}${filename}`;
}

function getTargetElementId() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.hasAttribute('data-target-element-id')) {
            return script.getAttribute('data-target-element-id');
        }
    }
    return null; // Return null if not specified
}

function playNextVideo(videoElement, playlist) {
    if (playlist.length === 0) {
        playlist = [...videoFiles];
        shuffleArray(playlist);
    }
    const nextVideo = playlist.pop();
    videoElement.src = getVideoPath(nextVideo);
    videoElement.play();
}

document.addEventListener('DOMContentLoaded', () => {
    const targetElementId = getTargetElementId();
    const targetElement = targetElementId ? document.getElementById(targetElementId) : document.body;

    if (!targetElement) {
        console.error(`Target element with id "${targetElementId}" not found. Video will not be displayed.`);
        return;
    }

    const videoElement = document.createElement('video');
    videoElement.setAttribute('autoplay', '');
    videoElement.setAttribute('muted', '');
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    targetElement.appendChild(videoElement);

    let playlist = [...videoFiles];
    shuffleArray(playlist);

    videoElement.addEventListener('ended', () => {
        playNextVideo(videoElement, playlist);
    });

    playNextVideo(videoElement, playlist);
});
