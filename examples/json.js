var scraper = require('wsscraper');

scraper('http://search.twitter.com/search.json?q=javascript', 'json', function(err, json_object, urlInfo) {
	if (err) {throw err;}
    for (var i=0; i < json_object.results.length; i++) {
        console.log(json_object.results[i].text+'\n');
    };
});