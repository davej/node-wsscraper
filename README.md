# node-wsscraper

A little module that makes scraping and performing auth with JSON/XML web services a little easier. If no JSON/XML web service is available then it can scrape ordinary webpages using JQuery. Uses node.js, xml2js and jQuery.

node-wsscraper is being developed as a future component of the [OJAX++ project](http://www.ucd.ie/ojax/).

This is a fork of [node-scraper](http://github.com/mape/node-scraper) by [mape](http://github.com/mape/), if you just want webpage scraping then check out his project instead.

## Installation

Via [npm](http://github.com/isaacs/npm):

    $ npm install wsscraper

## To-do

* Add nice wrapper for doing OAuth.
* Provide the option of using expat for those who require crazy-fast XML parsing.
* Add more examples and clean up readme.

## Examples

### Simple JSON
First argument is a url as a string, second is the response format, third is a callback which exposes error information, the JSON object and info about the url.

	var scraper = require('wsscraper');

	scraper('http://search.twitter.com/search.json?q=javascript', 'json', function(err, json_object, urlInfo) {
		if (err) {throw err;}
	    for (var i=0; i < json_object.results.length; i++) {
	        console.log(json_object.results[i].text+'\n');
	    };
	});
	
### Simple XML
JSON is the preferred response format. When JSON isn't available wsscraper can also parse XML responses and convert them to JSON objects using [xml2js](https://github.com/maqr/node-xml2js). Simply specify 'xml' as the expected response format.

	var scraper = require('wsscraper');

	scraper('http://search.twitter.com/search.atom?q=javascript', 'xml', function(err, json_object, urlInfo) {
		if (err) {throw err;}
	    for (var i=0; i < json_object.entry.length; i++) {
	        console.log(json_object.entry[i].title+'\n')
	    };
	});

### Simple HTML
And if no web service API is available then we can use JQuery to scrape the webpage. Simply specify 'html' as the expected response format. *Note: This uses jsdom and JQuery so it's pretty slow*.

	var scraper = require('wsscraper');

	scraper('http://search.twitter.com/search?q=javascript', 'html', function(err, $, urlInfo) {
		if (err) {throw err;}
		$('.msg').each(function() {
			console.log($(this).text().trim()+'\n');
		});
	});
### "Advanced"
First argument is an object containing settings for the "request" instance used internally, second is a callback which exposes a jQuery object with your scraped site as "body" and third is an object from the request containing info about the url.

    var scraper = require('scraper');
    scraper(
	    {
           'uri': 'http://search.twitter.com/search?q=nodejs'
               , 'headers': {
                   'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
               }
        }
		, 'html'
        , function(err, $) {
            if (err) {throw err}

            $('.msg').each(function() {
                console.log($(this).text().trim()+'\n');
            });
        }
    );
### Parallel
First argument is an array containing either strings or objects, second is a callback which exposes a jQuery object with your scraped site as "body" and third is an object from the request containing info about the url.

**You can also add rate limiting to the fetcher by adding an options object as the third argument containing 'reqPerSec': float.**

    var scraper = require('scraper');
    scraper(
	    [
            'http://search.twitter.com/search?q=javascript'
            , 'http://search.twitter.com/search?q=css'
            , {
                'uri': 'http://search.twitter.com/search?q=nodejs'
                , 'headers': {
                    'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
                }
            }
            , 'http://search.twitter.com/search?q=html5'
        ]
		, 'html'
        , function(err, $, urlInfo) {
            if (err) {throw err;}

            console.log('Messages from: '+urlInfo.href);
            $('.msg').each(function() {
                console.log($(this).text().trim()+'\n');
            });
        }
        , {
            'reqPerSec': 0.2 // Wait 5sec between each external request
        }
    );



## Arguments

### First (required)
Contains the info about what page/pages will be scraped

#### string
    'http://www.nodejs.org'
**or**

#### request object
    {
       'uri': 'http://search.twitter.com/search?q=nodejs'
           , 'headers': {
               'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
           }
    }
**or**

#### Array (if you want to do fetches on multiple URLs)
    [
        urlString
        , urlString
        , requestObject
        , urlString
    ]

### Second (optional)
The expected response format, defaults to 'html' if not specified.

	'json'
**or**
	'xml' // Runs XML through xml2js and passes a JSON object to the callback
**or**
	'html' // Creates a DOM for HTML page and passes a JQuerified body to the callback


### Third (optional)
The callback that allows you do use the data retrieved from the fetch.

    function(err, $, urlInfo) {
        if (err) {throw err;}
        
        /* Showing the data within urlInfo: 
        { href: 'http://search.twitter.com/search?q=javascript',
          protocol: 'http:',
          slashes: true,
          host: 'search.twitter.com',
          hostname: 'search.twitter.com',
          search: '?q=javascript',
          query: 'q=javascript',
          pathname: '/search',
          port: 80 }
        */
    
        console.log('Messages from: '+urlInfo.href);
        $('.msg').each(function() {
            console.log($(this).text().trim()+'\n');
        }
    }

### Fourth (optional)
This argument is an object containing settings for the fetcher overall.

* **reqPerSec**: float; (allows you to throttle your fetches so you don't hammer the server you are scraping)

## Depends on
* [tmpvar](https://github.com/tmpvar/)'s [jsdom](https://github.com/tmpvar/jsdom)
* [mikeal](https://github.com/mikeal/)'s [request](https://github.com/mikeal/node-utils/tree/master/request)
* [maqr](https://github.com/maqr/)'s [xml2js](https://github.com/maqr/node-xml2js)
* [jquery](https://github.com/jquery/jquery)