fs = require('fs');
ytdl = require('ytdl-core');
ffmpeg = require('fluent-ffmpeg');

url = "https://www.youtube.com/watch?v=FM7MFYoylVs";
mp4 = './video.mp4';
mp3 = './music.mp3';

var stream = fs.createWriteStream(mp4);

console.log('Downloading video...');
ytdl(url, {quality: 'lowest'}).pipe(stream);
stream.on('finish', function() {
	console.log('Download completed');
	console.log('Converting video...');
	proc = new ffmpeg({
		source: mp4
	}).toFormat('mp3').on('end', function() {
		console.log('Done!');
	}).saveToFile(mp3);
});