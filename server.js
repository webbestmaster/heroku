var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var path = require('path');

var port = Number(process.env.PORT || 3000);

new http.Server(function (req, res) {

	var reqUrl = '.' + req.url;

	if (reqUrl === './') {
		reqUrl = './index.html';
	}

	fs.stat(reqUrl, function (err, data) {

		if (err) {
			res.statusCode = 404;
			res.end('Not found - 404');
			console.error(err);
			return;
		}

		var lastModified = data.mtime.toString();

		if (req.headers['if-modified-since'] === lastModified) {

			res.statusCode = 304;
			res.end('Not Modified - 304');
			console.log('Not Modified - 304');
			return;

		}

		// get last modified
		res.setHeader('last-modified', lastModified);

		res.setHeader('content-type', mime.contentType(path.extname(reqUrl)));

		sendFile(reqUrl, res);

	});

}).listen(port);

//var stream = new fs.ReadStream('big.html', {encoding: 'utf-8'});
//var stream = new fs.ReadStream('file.png');

function sendFile(reqUrl, res) {

	var file = new fs.ReadStream(reqUrl);

	file.pipe(res);

	//file.pipe(process.stdout); // see in console
	file.on('error', function (err) {
		res.statusCode = 404;
		res.end('Not found - 404');
		console.error(err);
	});

	// detect when user close page until data was received
	res.on('close', function () {
		file.destroy();
	});

	// normal behavior for file stream - open and close
/*
	file
		.on('open', function (err) {
			// start pipe from file to res
			console.log('file stream is open');
			console.log(Date.now());
		})
		.on('close', function (err) {
			// end pipe from file to res
			console.log(Date.now());
			console.log('file stream is close');
		})
		.on('data', function (buffer) {
			console.log('---');
			console.log(buffer);
		});
*/


}


