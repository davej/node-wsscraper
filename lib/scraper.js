var request = require('request');
var jsdom  = require('jsdom');
xml2js = require('xml2js');
var requestDefaults = {
	'uri': null
	, 'headers': {
		'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
	}
};
var fetchDefaults = {
	'reqPerSec': 0
};
module.exports = function scrape(requestOptions, format, callback, fetchOptions) {
    if (!format) {
		format = 'html';
	}
	if (!fetchOptions) {
		fetchOptions = {};
	}
	if (!callback) {
		callback = function(){};
	}
	Object.keys(fetchDefaults).forEach(function(key) {
		if (fetchOptions[key] === undefined) {
			fetchOptions[key] = fetchDefaults[key]
		}
	});

	var fetches = [];
	var queue = [];

	if (!Array.isArray(requestOptions)) {
		fetches.push(requestOptions);
	} else {
		fetches = requestOptions;
	}

	fetches.forEach(function(requestOptions, index) {
		queue.push(function() {
			Object.keys(requestDefaults).forEach(function(key) {
				requestOptions[key] = requestOptions[key] || requestDefaults[key];
			});
			if (typeof requestOptions === 'string') {
				requestOptions = {
					'uri': requestOptions
				}
			}

			if (!requestOptions['uri']) {
				callback(new Error('You must supply an uri.'), null, null);
			}

			request(requestOptions, function (err, response, body) {
				setTimeout(runNextFetch, timeSpacing);
				if (err) {
					callback(err, null, null);
				}
				if (response && response.statusCode == 200) {
				    if (format === 'json') {
    					callback(null, JSON.parse(body), requestOptions['uri']);
				    }
				    if (format === 'xml') {
				        var parser = new xml2js.Parser();
				        parser.addListener('end', function(result) {
                            callback(null, result, requestOptions['uri']);
                        });
                        parser.parseString(body);
				    }
				    if (format === 'html') {
				        var window = jsdom.jsdom().createWindow();
    					jsdom.jQueryify(window, function(win, $) {
    						$('body').append($(body).find('body').html());
    						callback(null, $, requestOptions['uri']);
    					});
				    }
				} else {
					callback(new Error('Request to '+requestOptions['uri']+' ended with status code: '+(typeof response !== 'undefined' ? response.statusCode : 'unknown')), null, null);
				}
			});
		})
	});

	var concurrentConnections = !fetchOptions['reqPerSec'] ? queue.length : (Math.floor(fetchOptions['reqPerSec']) || 1);
	var timeSpacing = !fetchOptions['reqPerSec'] ? 0 : 1000/fetchOptions['reqPerSec'];

	for (var i=0; i < concurrentConnections; i++) {
		runNextFetch(i);
	};

	function runNextFetch(i) {
		if (!i) {
			i = 0;
		}
		if (queue[i]) {
			queue[i]();
			queue.shift();
		}
	}
};