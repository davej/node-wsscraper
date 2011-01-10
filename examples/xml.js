var scraper = require('wsscraper');

scraper('http://search.twitter.com/search.atom?q=javascript', 'xml', function(err, json_object, urlInfo) {
	if (err) {throw err;}
    for (var i=0; i < json_object.entry.length; i++) {
        console.log(i+1 + ": " + json_object.entry[i].title)
    };
});