var fs = require('fs'),
	mime = require('mime-types'),
	path = require('path'),
	zlib = require('zlib'),
	deferred = require('deferred'),
	multiparty = require('multiparty');

function parseReqUrl(req) {

	// try to detect index file
	var headers = req.headers,
		reqUrl = req.url,
		reqUrlSlashIndex = reqUrl.lastIndexOf('/'),
		referer,
		refererSlashIndex;

	if (reqUrl.indexOf('/favicon.ico') !== -1) {
		return './favicon.ico';
	}

	// http://asdsasd/asdsad/ or http://asdsasd/asds.ad/sad
	if ((reqUrlSlashIndex === reqUrl.length - 1) || (reqUrl.lastIndexOf('.') < reqUrlSlashIndex)) {
		return '.' + path.normalize(reqUrl + '/index.html');
	}

	referer = headers.referer;

	if (!referer) {
		return '.' + path.normalize(reqUrl);
	}

	referer = referer.replace(req.protocol + '://' + headers.host, '');

	refererSlashIndex = referer.lastIndexOf('/');

	if (refererSlashIndex === referer.length - 1) {
		return '.' + path.normalize(reqUrl);
	}

	if (refererSlashIndex < referer.lastIndexOf('.')) {
		if (refererSlashIndex) {
			return '.' + path.normalize(referer.slice(0, refererSlashIndex - 1) + '/' + reqUrl);
		} else {
			return '.' + path.normalize('/' + reqUrl);
		}

	}

	return '.' + path.normalize(referer + '/' + reqUrl);

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

function renameSavedFile(name, file) {

	var def = deferred(),
		curPath = file.path,
		newPath;

	newPath = curPath.split('/');
	newPath.pop();
	newPath.push(file.originalFilename);
	newPath = newPath.join('/');

	fs.rename(curPath, newPath, function(err) {
		if ( err ) console.log('ERROR: ' + err);
		console.log('rename');
		def.resolve();
	});

	return def.promise;

}

function saveFilesToDisk(req, res) {

	var form = new multiparty.Form({
			//autoFiles: true,
			uploadDir: 'upload-files'
		}),
		def = deferred(),
		savedFiles = 0,
		allFiles = Infinity;

	function tryToResolve() {
		return savedFiles === allFiles && def.resolve();
	}

	form.on('file', function (name, file) {

		renameSavedFile(name, file).then(function () {
			savedFiles += 1;

			tryToResolve();

		});

	});

	form.parse(req, function (err, fields, files) {

		//Object.keys(fields).forEach(function (name) {
			//console.log('got field named ' + name);
		//});

		//Object.keys(files).forEach(function (name) {
			//console.log(arguments);
			//console.log('got file named ' + name);
		//});

		console.log('Upload completed!');

		allFiles = Object.keys(files).length;

		tryToResolve();

		res.end('Received ' + files.length + ' files');

	});

	return def.promise;

}

exports.saveFilesToDisk = saveFilesToDisk;

exports.sendFile = sendFile;