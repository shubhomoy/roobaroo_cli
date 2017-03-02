var prompt = require('prompt');
var request = require('request');
var util = require('./util');
var services = require('./services');

console.log('1. Get top tracks\n2. Paste youtube music video link\n');
prompt.start();
prompt.get(['option'], function(err, response) {
	switch(response['option']) {
		case '1':
			services.getTopTracks();
		break;
		case '2':
			console.log('Paste youtube url :');
			prompt.start();
			prompt.get(['url'], function(err, response) {
				services.urlDownloadMp3(response['url']);
			});
		break;
	}
});
