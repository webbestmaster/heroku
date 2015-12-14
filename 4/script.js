/*jslint white: true, nomen: true */
(function (win, doc) {

	'use strict';
	/*global window */
	/*global */

	function $(selector) {
		return doc.querySelector(selector);
	}


	function readAsDataURL(file) {

		return new Promise(function (resolve, reject) {

			var reader = new FileReader();

			reader.addEventListener('load', function (e) {
				resolve(e.currentTarget.result);
			}, false);

			reader.readAsDataURL(file);

		});

	}

	function dataURLToImage(dataUrl) {

		return new Promise(function (resolve, reject) {

			var image = new Image();

			image.addEventListener('load', function () {
				resolve(this);
			}, false);

			image.src = dataUrl;

		});

	}

	function resizeImage(img) {

		return new Promise(function (resolve, reject) {

			var minCanvasSize = 350,
				canvasSize,
				canvas = doc.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				imageWidth = img.width,
				imageHeight = img.height,
				offsetTop = 0,
				offsetLeft = 0,
				scaleWidth,
				scaleHeight,
				maxScale = Math.max(imageWidth / minCanvasSize, imageHeight / minCanvasSize, 1);

			canvasSize = Math.round(minCanvasSize * maxScale);

			canvas.width = canvas.height = canvasSize;

			ctx.fillStyle = "#FFF";

			ctx.fillRect(0, 0, canvasSize, canvasSize);

			scaleWidth = canvasSize / imageWidth;
			scaleHeight = canvasSize / imageHeight;

			if (scaleWidth < scaleHeight) {
				offsetTop = ( canvasSize - imageHeight * scaleWidth ) / 2|0;
				ctx.drawImage(img, offsetLeft, offsetTop, imageWidth * scaleWidth|0, imageHeight * scaleWidth|0);
			} else {
				offsetLeft = ( canvasSize - imageWidth * scaleHeight ) / 2|0;
				ctx.drawImage(img, offsetLeft, offsetTop, imageWidth * scaleHeight|0, imageHeight * scaleHeight|0);
			}

			resolve(canvas.toDataURL("image/jpeg", 1));

		});

	}

	function saveDataURLAsImage(dataURL, fileName) {
		var a = doc.createElement('a');
		a.setAttribute('href', dataURL);
		a.setAttribute('download', 'squared-image-' + fileName.replace(/\.\w+?$/, '.jpeg'));
		a.dispatchEvent(new Event('click'));
	}

	function Queue() {

		this.queue = [];
		this.index = 0;
		this.deferred = Promise.defer();

	}

	Queue.prototype = {

		push: function (data) {
			this.queue.push(data);
		},

		getNext: function () {
			return this.queue[this.index++];
		},

		canNext: function () {
			return this.queue.length > this.index;
		},

		run: function () {

			var self = this;

			if ( !self.canNext() ) {
				return self.end();
			}

			self.getNext()().then(self.run.bind(self));

			return self.deferred.promise;

		},
		end: function () {
			return this.deferred.resolve();
		}

	};

	$('.js-drop-down-zone').addEventListener('change', function (e) {

		var queue = new Queue();

		Array.prototype.forEach.call(e.currentTarget.files, function (file) {

			queue.push(function () {
				return readAsDataURL(file)
					.then(dataURLToImage)
					.then(resizeImage)
					.then(function (dataURL) {
						return saveDataURLAsImage(dataURL, file.name);
					});
			});

		});

		queue.run().then(function () {
			console.log('queue is done');
		});

	}, false);

}(window, window.document));