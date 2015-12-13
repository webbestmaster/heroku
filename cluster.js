var cluster = require('cluster'),
	http = require('http'),
	fs = require('fs'),
	mime = require('mime-types'),
	path = require('path'),
	zlib = require('zlib');

files = [];

//process.on('uncaughtException', function (err) {
//	console.log(err.stack);
//	process.exit();
//});
//

/*process.on('message', function (msg) {
	console.log(msg);
});

if (cluster.isMaster) {

	console.log("Master pid: " + process.pid);

	var numCPUs = require('os').cpus().length;
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	Object.keys(cluster.workers).forEach(function (id) {

		var worker = cluster.workers[id];

		console.log('creating process with id = ' + worker.process.pid);

		// getting message
		worker.on('message', function (msg) {

			console.log(msg.procId);

			// console.log("Getting message from process : ", msg.procId);
			// console.log(msg.msg);

			worker.send('ddddd');

		});

		worker.on('end', function (msg) {

			console.log(msg.procId);
			// console.log("Getting message from process : ", msg.procId);
			// console.log(msg.msg);

		});

		//Getting worker online
		worker.on('online', function () {
			console.log("Worker pid: " + worker.process.pid + " is online");
		});

		//printing the listening port
		worker.on('listening', function (address) {
			console.log("Listening on port:", address.port);
		});

		//Catching errors
		worker.on('exit', function (code, signal) {
			if (signal) {
				console.log("worker was killed by signal: " + signal);
			} else if (code !== 0) {
				console.log("worker exited with error code: " + code);
			} else {
				console.log("worker success!");
			}
		});

	});

	setInterval(function () {
		console.log(Object.keys(cluster.workers).length);
	}, 1000);

	cluster.on('exit', function(worker){
		console.log('Worker ' + worker.id + ' died..');
		cluster.fork();
	});

} else {*/

	// Create HTTP server.
	new http.Server(function (req, res) {

		var reqUrl = '.' + req.url;

		if (reqUrl === './') {
			reqUrl = './index.html';
		}

		if (reqUrl === './4' || reqUrl === './4/' ) {
			reqUrl = './4/index.html';
		}

		if (reqUrl === './upload') {

			var dataUrl = '';

			req.on('data', function(data) {
				dataUrl += data.toString();
			});

			req.on('end', function() {

				var data = dataUrl,
					video = data[0],
					audio = data[1];

				if (files.length >= 10) {
					files.shift();
				}

				files.push({
					data: data,
					date: Date.now()
				});

			});

			res.statusCode = 200;
			res.end();
			return;

		}

		if (reqUrl === './get-last') {

			var lastDate = req.headers['last-date'] || '',
				lastFile = files[files.length - 1];

			res.statusCode = 200;

			res.setHeader('content-type', 'text/plain; charset=utf-8');

			if ( !lastDate ) {
				res.setHeader('last-date', lastFile.date);
				res.end(lastFile.data);
				return;
			}

			var index = files.length - 1;

			files.forEach(function (file, indexOfArr) {

				if (file.date === lastDate) {
					index = indexOfArr + 1;
				}

			});

			lastFile = files[index] || lastFile;

			res.setHeader('last-date', lastFile.date);

			res.end(files[index]);

			return;

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

			res.setHeader('last-modified', lastModified);

			res.setHeader('cache-control', 'private, max-age=300');

			res.setHeader('content-type', mime.contentType(path.extname(reqUrl)));

			//process.send({ msg: reqUrl, procId: process.pid });

			sendFile(reqUrl, req, res);

		});

	}).listen(process.env.PORT || 3000);

//var stream = new fs.ReadStream('big.html', {encoding: 'utf-8'});
//var stream = new fs.ReadStream('file.png');

	function sendFile(reqUrl, req, res) {

		var file = new fs.ReadStream(reqUrl),
			acceptEncoding = req.headers['accept-encoding'].split(/\s?\,\s?/gi);

		if ( acceptEncoding.indexOf('deflate') !== -1 ) {
			res.setHeader('content-encoding', 'deflate');
			file.pipe(zlib.createDeflate()).pipe(res);
		} else if ( acceptEncoding.indexOf('gzip') !== -1 ) {
			res.setHeader('content-encoding', 'gzip');
			file.pipe(zlib.createGzip()).pipe(res);
		} else {
			file.pipe(res);
		}

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

//}

