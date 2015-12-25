
var fs = require('fs'),
	mime = require('mime-types'),
	path = require('path'),
	zlib = require('zlib');

function parseReqUrl(req) {

	// try to detect index file
	var headers = req.headers,
		reqUrl = req.url,
		referer;

	// detect index

	// http://asdsasd/asdsad/ or http://asdsasd/asds.ad/sad
	if ( (reqUrl.lastIndexOf('/') === reqUrl.length - 1) || (reqUrl.lastIndexOf('.') < reqUrl.lastIndexOf('/')) ) {
		return '.' + path.normalize(reqUrl + '/index.html');
	}

	referer = headers.referer;

	if ( referer.lastIndexOf('/') === referer.length - 1 ) {
		return '.' + path.normalize(reqUrl);
	}

	reqUrl = path.normalize(referer.replace(req.protocol + '://' + headers.host, '') + '/' + reqUrl);

	return '.' + path.normalize(reqUrl);

}

function sendFile(req, res) {

	var reqUrl = parseReqUrl(req),
		file,
		acceptEncoding;

	fs.stat(reqUrl, function (err, data) {

		var lastModified;

		if (err) {
			res.statusCode = 404;
			res.end('Not found - 404');
			console.error(err);
			return;
		}

		lastModified = data.mtime.toString();

		if (req.headers['if-modified-since'] === lastModified) {
			res.statusCode = 304;
			res.end('Not Modified - 304');
			console.log('Not Modified - 304');
			return;
		}

		res.setHeader('last-modified', lastModified);

		res.setHeader('cache-control', 'private, max-age=300');

		res.setHeader('content-type', mime.contentType(path.extname(reqUrl)));

		file = new fs.ReadStream(reqUrl);

		acceptEncoding = req.headers['accept-encoding'].split(/\s?\,\s?/gi);

		if (acceptEncoding.indexOf('deflate') !== -1) {
			res.setHeader('content-encoding', 'deflate');
			file.pipe(zlib.createDeflate()).pipe(res);
		} else if (acceptEncoding.indexOf('gzip') !== -1) {
			res.setHeader('content-encoding', 'gzip');
			file.pipe(zlib.createGzip()).pipe(res);
		} else {
			file.pipe(res);
		}

		//file.pipe(process.stdout); // see in console
		file.on('error', function (err) {
			res.statusCode = 404;
			res.end('Not found - 404');
			console.error('Not found - 404');
			console.error(err);
		});

		// detect when user close page until data was received
		res.on('close', function () {
			file.destroy();
		});

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

exports.sendFile = sendFile;