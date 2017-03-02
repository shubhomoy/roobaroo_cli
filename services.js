var fs = require('fs');
var request = require('request');
var util = require('./util');
var ytdl = require('youtube-dl');
var ffmpeg = require('fluent-ffmpeg');
var prompt = require('prompt');
var services = require('./services');

var searchDownloadMp3Util = function(query, outputFile) {
	var mp4 = './video.mp4';
	var stream = fs.createWriteStream(mp4);
	request(util.youtubeSearchBuilder(query), function(error, response, body) {
		response = JSON.parse(body);
		if(response.items.length > 0) {
			var item = response.items[0];
			console.log('Please wait...');
			var url = util.youtubeVideoUrl(item.id.videoId);
			ytdl.getInfo(url, function(err, info) {
				var minFormat = null;
				var minSize = Number.MAX_SAFE_INTEGER;
				info.formats.forEach(function(format) {
					if(format.filesize < minSize) {
						minFormat = format;
						minSize = minFormat.filesize;
					}
				});
				console.log('File size of ' + (minFormat.filesize/(1024*1024)).toFixed(2) + ' mb will be downloaded');
				var video = ytdl(url, ['--format=' + minFormat.format_id]);
				console.log('Downloading...');
				video.pipe(stream);
				stream.on('finish', function() {
					console.log('Download completed');
					console.log('Converting...');
					proc = new ffmpeg({
						source: mp4
					}).toFormat('mp3').on('end', function() {
						console.log('Done!');
						fs.unlink(mp4);
					}).saveToFile(outputFile);
				});

			});
		}
	});	
};

var urlDownloadMp3Util = function(url) {
	console.log('Fetching video...');
	var mp4 = './video.mp4';
	var stream = fs.createWriteStream(mp4);
	var outputFile = null;
	ytdl.getInfo(url, function(err, info) {
		var minFormat = null;
		var minSize = Number.MAX_SAFE_INTEGER;
		info.formats.forEach(function(format) {
			if(format.filesize < minSize) {
				minFormat = format;
				minSize = minFormat.filesize;
			}
		});
		outputFile = './output/' + escape(info.title) + '.mp3';
		console.log('File size of ' + (minFormat.filesize/(1024*1024)).toFixed(2) + ' mb will be downloaded');
		var video = ytdl(url, ['--format=' + minFormat.format_id]);
		video.on('info', function(info) {
			console.log('Downloading...');
		});
		video.pipe(stream);
		stream.on('finish', function() {
			console.log('Download completed');
			console.log('Converting...');
			proc = new ffmpeg({
				source: mp4
			}).toFormat('mp3').on('end', function() {
				console.log('Done!');
				fs.unlink(mp4);
			}).saveToFile(outputFile);
		});

	});
}

module.exports = {
	searchDownloadMp3: function(query, outputFile) {
		searchDownloadMp3Util(query, outputFile);
	},
	getTopTracks: function() {
		console.log('Fetching top tracks...');
		request(util.lastfmApiBuilder('chart.gettoptracks'), function(error, response, body) {
			if(!error && response.statusCode == 200) {
				var response = JSON.parse(body);
				var tracks = response.tracks.track;
				var length = tracks.length > 20 ? 20:tracks.length;
				for (var i = 0; i<length; i++) {
					console.log((i+1) + ' - ' + tracks[i].name);
				}
				console.log('Press the curresponding song to download');
				prompt.start();
				prompt.get(['Song number'], function(err, response) {
					console.log('Preparing...');
					var outputFile = './output/' + escape(tracks[response['Song number']-1].name) + '.mp3';
					searchDownloadMp3Util(tracks[response['Song number']-1].name, outputFile);
				});
			}else{
				util.errors.basic();
			}
		});
	},
	urlDownloadMp3: function(url) {
		urlDownloadMp3Util(url);
	}
};