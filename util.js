var config = require('./config');
var YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=";

module.exports = {
	lastfmApiBuilder: function(method) {
		return 'http://ws.audioscrobbler.com/2.0/?method=' + method + '&api_key=' + config.LASTFM_API_KEY + '&format=json';
	},
	youtubeSearchBuilder: function(query) {
		return encodeURI(YOUTUBE_SEARCH_URL + query + '&key=' + config.YOUTUBE_API_KEY);
	},
	youtubeVideoUrl: function(videoId) {
		return encodeURI('https://youtube.com/watch?v=' + videoId);	
	},
	errors: {
		basic: function() {
			console.log('Something went wrong. Please check your network connection');
		}
	}	
}