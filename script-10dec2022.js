/** @type {HTMLCanvasElement} */

const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

const drawInitialText = () => {
	context.beginPath();
	context.fillStyle = 'white';
	context.textAlign = 'center';
	context.font = '16px Times New Roman';
	context.fillText('No video playing.', canvas.width/2, canvas.height/2);
	context.closePath();
}
drawInitialText();

var uploader = document.querySelector('#file-input');
const playlist = document.querySelector('#playlist');
var playlistArray = document.querySelectorAll('.playlist-item');
// var left = canvas.getBoundingClientRect().left;
// var right = canvas.getBoundingClientRect().right;

var asd = false;

var video = document.createElement('video');
video.muted = false;
video.autoplay = false;
video.loop = false;

const initialSeekbar = new Path2D();
initialSeekbar.width = canvas.width;
initialSeekbar.height = canvas.height * 0.03;
initialSeekbar.x = 0;
initialSeekbar.y = canvas.height - initialSeekbar.height;
initialSeekbar.rect(initialSeekbar.x, initialSeekbar.y, initialSeekbar.width, initialSeekbar.height);
initialSeekbar.color = 'rgba(255, 255, 255, 0.2)';
context.fillStyle = initialSeekbar.color;
context.fill(initialSeekbar);

const actualSeekbar = new Path2D();
actualSeekbar.width = 0;
actualSeekbar.height = canvas.height * 0.03;
actualSeekbar.x = 0;
actualSeekbar.y = canvas.height - actualSeekbar.height;
actualSeekbar.color = 'rgba(0, 100, 160, 1)';

var drawImageParams = [];

const playSelectedVideo = (time) => {
	video.onloadedmetadata = () => {
		setDrawImageParams();
		video.currentTime = time;
	}
	updatePlaylistColor();
	video.play();
	drawVideo();
}

const setDrawImageParams = () => {
	let scale = video.videoWidth / video.videoHeight;
	let widthToBePlayed = 0;
	let heightToBePlayed = 0;
	if (scale < 16 / 9) {
		widthToBePlayed = canvas.height * scale;
		heightToBePlayed = canvas.height;
		drawImageParams[0] = canvas.width / 2 - widthToBePlayed / 2;
		drawImageParams[1] = 0;
		drawImageParams[2] = widthToBePlayed;
		drawImageParams[3] = heightToBePlayed;
	} else if (scale > 16 / 9) {
		widthToBePlayed = canvas.width;
		heightToBePlayed = canvas.width / scale;
		drawImageParams[0] = 0;
		drawImageParams[1] = canvas.height / 2 - heightToBePlayed / 2;
		drawImageParams[2] = widthToBePlayed;
		drawImageParams[3] = heightToBePlayed;
	}
	else {
		drawImageParams[0] = 0;
		drawImageParams[1] = 0;
		drawImageParams[2] = canvas.width;
		drawImageParams[3] = canvas.height;
	}
}

const updateActualSeekbar = (percentage) => {
	actualSeekbar.width = canvas.width * percentage / 100;
	context.clearRect(actualSeekbar.x, actualSeekbar.y, actualSeekbar.width, actualSeekbar.height);
	context.fillStyle = actualSeekbar.color;
	context.fillRect(actualSeekbar.x, actualSeekbar.y, actualSeekbar.width, actualSeekbar.height);
}

const drawVideo = () => {
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(video, drawImageParams[0], drawImageParams[1], drawImageParams[2], drawImageParams[3]);

	// context.clearRect(0, 0, canvas.width, canvas.height);
	// context.drawImage(video, 0, 0, canvas.width, canvas.height);
	
	context.fillStyle = initialSeekbar.color;
	context.fill(initialSeekbar);

	let	percentage = video.currentTime / video.duration * 100;
	updateActualSeekbar(percentage);

	// canvas.onmouseenter = () => {
	if (asd === true) {
		drawControls();
	}
	// }

	let request = requestAnimationFrame(drawVideo);

	if (percentage >= 100) {
		percentage = 0;
		updateActualSeekbar(percentage);
		cancelAnimationFrame(request);

		playNext();
	}
}

const playNext = () => {
	let currentVideoName = video.src.substring(video.src.lastIndexOf('/') + 1);
	let currentIndex = playlistArray.findIndex(element => element.innerHTML === currentVideoName);
	let nextDiv = playlistArray[currentIndex + 1];
	if (nextDiv !== undefined) {
		video.src = './media/' + nextDiv.innerHTML;
		video.load();
		playSelectedVideo(0);
	}
}

const updatePlaylistColor = () => {
	let currentVideoName = video.src.substring(video.src.lastIndexOf('/') + 1);
	playlistArray.forEach(element => {
		if (element.innerHTML === currentVideoName) {
			element.style.backgroundColor = 'rgb(218, 218, 218)';
		} else {
			element.style.backgroundColor = 'white';
		}	
	});
}

canvas.onclick = (e) => {
	if (context.isPointInPath(initialSeekbar, e.offsetX, e.offsetY)) {
		if (video.ended) {
			video.currentTime = e.offsetX / canvas.width * video.duration;
			playSelectedVideo(video.currentTime);
		} else {
			video.currentTime = e.offsetX / canvas.width * video.duration;
		}
	} else {
		if (video.src !== '') {
			if (video.paused) {
				playSelectedVideo(video.currentTime);
			} else {
				video.pause();
			}
		}
	}
}

uploader.onchange = () => {
	playlist.innerHTML = '';
	playlist.style.display = 'block';

	clearPlaylistArray();

	let files = uploader.files;
	for (var i = 0; i < files.length; i++) {
		let div = document.createElement('div');
		div.className = 'playlist-item';

		div.style.borderBottom = '1px solid black';
		div.style.paddingLeft = '5%';
		div.style.textAlign = 'left';
		div.style.height = '20%';
		div.style.display = 'flex';
		div.style.alignItems = 'center';
		div.style.cursor = 'pointer';

		div.innerHTML = `${files[i].name}`;
		playlist.appendChild(div);

		addToPlaylistArray(div);
	}
}

playlist.onmouseover = () => {
	playlistArray.forEach(element => {
		element.onclick = () => {
			video.pause();
			video.src = './media/' + element.innerHTML;
			video.load();
			playSelectedVideo(0);
		}
	});
}

const drawControls = () => {
	context.beginPath();
	context.fillStyle = 'red';
	context.fillRect(0, 0, 40, 40);
	context.closePath();
}

const clearControls = () => {
	context.beginPath();
	context.clearRect(0, 0, 40, 40);
	context.closePath();
}

canvas.onmouseenter = () => {
	asd = true;
	drawControls();
}

canvas.onmouseleave = () => {
	asd = false;
	clearControls();
}

const clearPlaylistArray = () => {
	playlistArray = [];
}

const addToPlaylistArray = (div) => {
	playlistArray.push(div);
}
