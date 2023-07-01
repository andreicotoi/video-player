/** @type {HTMLCanvasElement} */

const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const uploader = document.querySelector('#file-input');
const playlist = document.querySelector('#playlist');
var playlistDivs = document.querySelectorAll('.playlist-item');
// var playlistArray = Array.from(playlistDivs);
// var left = canvas.getBoundingClientRect().left;
// var right = canvas.getBoundingClientRect().right;
var video = document.createElement('video');
video.muted = false;
video.autoplay = false;
video.loop = false;
var preview = document.createElement('video'); preview.muted = true; preview.autoplay = false; preview.loop = false;

const playpause = document.createElement('img');
playpause.src = './assets/playpause.png';
const prev = document.createElement('img');
prev.src = './assets/prev.png';
const next = document.createElement('img');
next.src = './assets/next.png';
const voldown = document.createElement('img');
voldown.src = './assets/voldown.png';
const volup = document.createElement('img');
volup.src = './assets/volup.png';

const initialSeekbar = new Path2D();
initialSeekbar.rect(0, canvas.height - canvas.height * 0.03, canvas.width, canvas.height * 0.03);
context.fillStyle = 'rgba(255, 255, 255, 0.2)';
context.fill(initialSeekbar);

const initialSeekbarHovered = new Path2D();
initialSeekbarHovered.rect(0, canvas.height - canvas.height * 0.13, canvas.width, canvas.height * 0.06);

const controlWidth = canvas.height * 0.08;
const controlHeight = canvas.height * 0.07;
const controlStartPos = canvas.width / 2 - 2.5 * controlWidth;

const controls = new Path2D();
controls.rect(0, canvas.height  - controlHeight, canvas.width, controlHeight);

const prevButton = new Path2D();
prevButton.rect(controlStartPos, canvas.height  - controlHeight, controlWidth, controlHeight);

const playPauseButton = new Path2D();
playPauseButton.rect(controlStartPos + controlWidth, canvas.height - controlHeight, controlWidth, controlHeight);

const nextButton = new Path2D();
nextButton.rect(controlStartPos + 2 * controlWidth, canvas.height - controlHeight, controlWidth, controlHeight)

const volDownButton = new Path2D();
volDownButton.rect(controlStartPos + 3 * controlWidth, canvas.height - controlHeight, controlWidth, controlHeight);

const volUpButton = new Path2D();
volUpButton.rect(controlStartPos + 4 * controlWidth, canvas.height - controlHeight, controlWidth, controlHeight);

const drawControls = () => {
	fillPath('rgba(0, 0, 0, 0.5)', controls);
	context.drawImage(prev, controlStartPos, canvas.height  - controlHeight, controlWidth, controlHeight);
	context.drawImage(playpause, controlStartPos + controlWidth, canvas.height - controlHeight, controlWidth, controlHeight);
	context.drawImage(next,	controlStartPos + 2 * controlWidth, canvas.height - controlHeight, controlWidth, controlHeight);
	context.drawImage(voldown, controlStartPos + 3 * controlWidth, canvas.height - controlHeight, controlWidth, controlHeight);
	context.drawImage(volup, controlStartPos + 4 * controlWidth, canvas.height - controlHeight, controlWidth, controlHeight);
}

const drawInitialText = () => {
	context.beginPath();
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = 'white';
	context.textAlign = 'center';
	context.font = '16px Times New Roman';
	context.fillText('No video playing.', canvas.width/2, canvas.height/2);
	context.closePath();
}
drawInitialText();

var interval;
var videoParams = [0, 0, 0, 0];
var previewParams = [0, 0]; // doar width si height
var	percentage = 0;
var mouseOnCanvas = false;
var mouseOnSeekbar = false;
var mouseOnPlayButton = false;
var mouseOnPrevButton = false;
var mouseOnNextButton = false;
var mouseOnVoldownButton = false;
var mouseOnVolupButton = false;
var stopped = true; // we are stopped aici
var position = 0; // pozitia cand sunt pe seekbar

const fillPath = (color, path) => {
	context.fillStyle = color;
	context.fill(path);
}

const loadAndPlayVideo = () => {
	video.load();
	video.onloadeddata = preview.load();
	preview.onloadeddata = playSelectedVideo(0);
}

function playSelectedVideo(time) {
	video.onloadedmetadata = () => {
		setVideoParams();
		video.currentTime = time;
	}
	preview.onloadedmetadata = () => {
		setPreviewParams();
	}
	stopped = false;
	updatePlaylistColor();
	updatePlaylistColor();
	setTimeout(() => {
		video.play();
		drawVideo();
	}, 500); //doar ca marja in caz de cv
}

const setVideoParams = () => {
	let scale = video.videoWidth / video.videoHeight;
	let widthToBePlayed = canvas.width;
	let heightToBePlayed = canvas.height;
	if (scale < 16 / 9) {
		heightToBePlayed = canvas.height;
		widthToBePlayed = heightToBePlayed * scale;
		videoParams[0] = canvas.width / 2 - widthToBePlayed / 2;
		videoParams[1] = 0;
		videoParams[2] = widthToBePlayed;
		videoParams[3] = heightToBePlayed;
	} else if (scale > 16 / 9) {
		widthToBePlayed = canvas.width;
		heightToBePlayed = widthToBePlayed / scale;
		videoParams[0] = 0;
		videoParams[1] = canvas.height / 2 - heightToBePlayed / 2;
		videoParams[2] = widthToBePlayed;
		videoParams[3] = heightToBePlayed;
	}
	else {
		videoParams[0] = 0;
		videoParams[1] = 0;
		videoParams[2] = widthToBePlayed;
		videoParams[3] = heightToBePlayed;
	}
}

const setPreviewParams = () => {
	let scale = preview.videoWidth / preview.videoHeight;
	let widthToBePlayed = canvas.width * 0.2;
	let heightToBePlayed = canvas.height * 0.2;
	if (scale < 16 / 9) {
		heightToBePlayed = canvas.height * 0.2;
		widthToBePlayed = heightToBePlayed * scale;
		previewParams[0] = widthToBePlayed;
		previewParams[1] = heightToBePlayed;
	} else if (scale > 16 / 9) {
		widthToBePlayed = canvas.width * 0.2;
		heightToBePlayed = widthToBePlayed / scale;
		previewParams[0] = widthToBePlayed;
		previewParams[1] = heightToBePlayed;
	}
	else {
		previewParams[0] = widthToBePlayed;
		previewParams[1] = heightToBePlayed;
	}
}

const updateSeekbar = () => {
	let width = canvas.width * percentage / 100;
	let height = mouseOnCanvas === true ? canvas.height * 0.06 : canvas.height * 0.03;
	if (height === canvas.height * 0.06) {
		context.clearRect(0, canvas.height - canvas.height * 0.07 - height, width, height);
		context.fillStyle = 'rgba(0, 100, 160, 1)';
		context.fillRect(0, canvas.height - canvas.height * 0.07 - height, width, height);
	} else {
		context.clearRect(0, canvas.height - height, width, height);
		context.fillStyle = 'rgba(0, 100, 160, 1)';
		context.fillRect(0, canvas.height - height, width, height);
	}
}

const drawPreview = (position) => {
	let x = canvas.width * position - previewParams[0] / 2;
	let y = canvas.height - canvas.height * 0.13 - previewParams[1];
	if (x > canvas.width - previewParams[0]) x = canvas.width - previewParams[0];
	if (x < 0) x = 0;
	context.drawImage(preview, x, y, ...previewParams);
}

const drawVideo = () => {
	interval = setInterval(() => {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(video, ...videoParams);
	
		percentage = video.currentTime / video.duration * 100;
		updateSeekbar();
	
		if (mouseOnCanvas === true) {
			fillPath('rgba(255, 255, 255, 0.2)', initialSeekbarHovered);
			drawControls();
		} else {
			fillPath('rgba(255, 255, 255, 0.2)', initialSeekbar);
		}
		
		if (mouseOnSeekbar === true) {
			if (position * preview.duration <= preview.duration) { // in cazul in care raman cu mouse pe seekbar si trece la urmatorul video si are durata mai mica
				preview.currentTime = position * preview.duration;
			}
			drawPreview(position);
		}

		if (stopped === true) {
			clearInterval(interval);
		}

		if (mouseOnPrevButton === true) { fillPath('rgba(200, 200, 200, 0.2)', prevButton); }
		if (mouseOnPlayButton === true) { fillPath('rgba(200, 200, 200, 0.2)', playPauseButton); }
		if (mouseOnNextButton === true) { fillPath('rgba(200, 200, 200, 0.2)', nextButton); }
		if (mouseOnVoldownButton === true) { fillPath('rgba(200, 200, 200, 0.2)', volDownButton); }
		if (mouseOnVolupButton === true) { fillPath('rgba(200, 200, 200, 0.2)', volUpButton); }

		if (percentage >= 100 || video.ended) {
			clearInterval(interval);
			mouseOnSeekbar === false;	// in caz ca imi ramane mouse pe seekbar in timp ce trece la next ???sakld;lsaolokdas
			updateSeekbar();
			playNext();
		}
	}, 1000 / 30);
}

const playNext = () => {
	let currentVideoName = video.src.substring(video.src.lastIndexOf('/') + 1);
	let currentIndex = Array.from(playlistDivs).findIndex(element => element.innerHTML === currentVideoName);
	let nextDiv = playlistDivs[currentIndex + 1];
	if (nextDiv !== undefined) {
		video.src = './media/' + nextDiv.innerHTML;
		preview.src = './media/' + nextDiv.innerHTML;
		loadAndPlayVideo();
	} else {
		stopPlayer();
	}
}

const playPrev = () => {
	let currentVideoName = video.src.substring(video.src.lastIndexOf('/') + 1);
	let currentIndex = Array.from(playlistDivs).findIndex(element => element.innerHTML === currentVideoName);
	let prevDiv = playlistDivs[currentIndex - 1];
	if (prevDiv !== undefined) {
		video.src = './media/' + prevDiv.innerHTML;
		preview.src = './media/' + prevDiv.innerHTML;
		loadAndPlayVideo();
	} else {
		stopPlayer();
	}
}

const updatePlaylistColor = () => {
	let currentVideoName = video.src.substring(video.src.lastIndexOf('/') + 1);
	Array.from(playlistDivs).forEach(element => {
		if (element.innerHTML === currentVideoName) {
			element.style.backgroundColor = 'rgb(218, 218, 218)';
		} else {
			element.style.backgroundColor = 'white';
		}	
	});
}

uploader.onchange = () => {
	if (playlist.innerHTML === 'No files uploaded.') {
		playlist.innerHTML = '';
	}
	playlist.style.display = 'block';

	let files = uploader.files;
	for (var i = 0; i < files.length; i++) {
		let div = document.createElement('div');
		div.className = 'playlist-item';

		div.setAttribute('style', `
			border-bottom: 1px solid rgb(200, 200, 200);
			padding-left: 5%;
			text-align: left;
			height: 15%;
			display: flex;
			align-items: center;
			cursor: pointer;
		`);
		div.draggable = true;

		div.innerHTML = files[i].name;
		
		if (Array.from(playlistDivs).findIndex(element => element.innerHTML === div.innerHTML) !== -1) {
			alert('One of your files has already been uploaded.');
		} else {
			playlist.appendChild(div);
			updatePlaylist();
		}
	}
}

canvas.onclick = (e) => {
	if (stopped === false) {
		if (context.isPointInPath(initialSeekbarHovered, e.offsetX, e.offsetY)) {
			if (video.ended) {
				video.currentTime = e.offsetX / canvas.width * video.duration;
				playSelectedVideo(video.currentTime);
			} else {
				video.currentTime = e.offsetX / canvas.width * video.duration;
			}
		}
		if (context.isPointInPath(prevButton, e.offsetX, e.offsetY)) {
			playPrev();
		}
		if (context.isPointInPath(playPauseButton, e.offsetX, e.offsetY)) {
			if (video.paused) {
				playSelectedVideo(video.currentTime);
			} else {
				video.pause();
			}
		}
		if (context.isPointInPath(nextButton, e.offsetX, e.offsetY)) {
			playNext();
		}
		if (context.isPointInPath(volDownButton, e.offsetX, e.offsetY)) {
			if (video.volume >= 0.1 && video.volume <= 1) { video.volume -= 0.1; }
		}
		if (context.isPointInPath(volUpButton, e.offsetX, e.offsetY)) {
			if (video.volume >= 0 && video.volume <= 0.9) { video.volume += 0.1; }
		}
	}
}

canvas.onmouseenter = () => {
	if (stopped === false) {
		mouseOnCanvas = true;
	}
	canvas.onmousemove = (e) => {
		if (stopped === false) {
			if (context.isPointInPath(initialSeekbarHovered, e.offsetX, e.offsetY)) {
				mouseOnSeekbar = true;
				position = e.offsetX / canvas.width;
			} else {
				mouseOnSeekbar = false;
			}
			context.isPointInPath(prevButton, e.offsetX, e.offsetY) ? mouseOnPrevButton = true : mouseOnPrevButton = false;
			context.isPointInPath(playPauseButton, e.offsetX, e.offsetY) ? mouseOnPlayButton = true : mouseOnPlayButton = false;
			context.isPointInPath(nextButton, e.offsetX, e.offsetY) ? mouseOnNextButton = true : mouseOnNextButton = false;
			context.isPointInPath(volDownButton, e.offsetX, e.offsetY) ? mouseOnVoldownButton = true : mouseOnVoldownButton = false;
			context.isPointInPath(volUpButton, e.offsetX, e.offsetY) ? mouseOnVolupButton = true : mouseOnVolupButton = false;
	
			if (context.isPointInPath(initialSeekbarHovered, e.offsetX, e.offsetY) || context.isPointInPath(controls, e.offsetX, e.offsetY)) {
				canvas.style.cursor = 'pointer';
			} else {
				canvas.style.cursor = 'default';
			}
		}
	}
}

canvas.onmouseleave = () => {
	mouseOnCanvas = false;
	mouseOnSeekbar = false;
	mouseOnPrevButton = false;
	mouseOnPlayButton = false;
	mouseOnNextButton = false;
	mouseOnVoldownButton = false;
	mouseOnVolupButton = false;
}

playlist.onmouseover = () => {
	Array.from(playlistDivs).forEach(element => {
		element.onclick = () => {
			video.src = './media/' + element.innerHTML;
			preview.src = './media/' + element.innerHTML;

			loadAndPlayVideo();
		}
	});
	sortPlaylist();
}

const sortPlaylist = () => {
	let draggedDiv, draggedDivIndex, droppedDivIndex;
	for (let div of playlistDivs) {
		div.ondragover = (e) => {
			e.preventDefault();
		}
		div.ondragstart = () => {
			draggedDiv = div;
			draggedDivIndex = Array.from(playlistDivs).indexOf(div);
		}
		div.ondragenter = () => {
			if (div != draggedDiv) {
				div.style.borderTop = '2px solid black';
			}
		}
		div.ondragleave = () => {
			div.style.borderTop = 'none';
		}
		div.ondrop = () => {
			div.style.borderTop = 'none';
			if (div != draggedDiv) {
				droppedDivIndex = Array.from(playlistDivs).indexOf(div);
				// .. to continue
			}
		}
	}
}

const stopPlayer = () => {
	video.pause();
	video.currentTime = 0;
	stopped = true;
	setTimeout(() => {
		drawInitialText();
	}, 1000);
}

const clearPlaylist = () => {
	playlist.innerHTML = 'No files uploaded.';
	playlist.style.display = 'flex';
	// playlistArray = [];
}

const updatePlaylist = (div) => {
	playlistDivs = document.querySelectorAll('.playlist-item');
	// playlistArray = Array.from(playlistDivs);
}