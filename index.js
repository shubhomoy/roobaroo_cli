var fs = require('fs');
var ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');
var http = require('http');
var prompt = require('prompt');
var request = require('request');

var YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=";
var mp4 = './video.mp4';
var mp3 = './music.mp3';

var YOUTUBE_APIKEY = "AIzaSyAdfnHdZ4bDpty7baQC9PVkdnSqyuSql28";
var LASTFM_APIKEY = "c09a42d23c8151e0e20238df559570f9";

var stream = fs.createWriteStream(mp4);

http.get('http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=' + LASTFM_APIKEY + '&format=json', function(response) {
	var str = '';
	response.on('data', function(chunk) {
		str += chunk;
	});
	response.on('end', function() {
		var response = JSON.parse(str);
		var tracks = response.tracks.track;
		var length = tracks.length > 5 ? 5:tracks.length;
		for (var i = 0; i<length; i++) {
			console.log((i+1) + ' - ' + tracks[i].name);
		}
		console.log('Press the curresponding song to download');
		prompt.start();
		prompt.get(['Song number'], function(err, response) {
			request(YOUTUBE_SEARCH_URL + tracks[response['Song number']-1].name + '&key=' + YOUTUBE_APIKEY, function(error, response, body) {
				response = JSON.parse(body);
				if(response.items.length > 0) {
					var item = response.items[0];
					console.log('Downloading video...');
					var url = "https://youtube.com/watch/?v=" + item.id.videoId;
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
				}
			});
		});
	});
});