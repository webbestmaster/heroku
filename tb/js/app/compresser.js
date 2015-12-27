/*jslint white: true, nomen: true */
(function (win, doc) {

	'use strict';
	/*global window */
	/*global */

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

			var self = this,
				res;

			if (!self.canNext()) {
				return self.end();
			}

			res = self.getNext()();
			if (res instanceof Promise) {
				res.then(self.run.bind(self));
			} else {
				self.run();
			}

			return self.deferred.promise;

		},
		end: function () {
			return this.deferred.resolve();
		}

	};

	win.compresser = {

		attr: {},

		toArray: function (likeArray) {

			return Array.prototype.slice.call(likeArray);

		},

		set: function (keyOrObj, value) {

			var slider = this,
				attr = slider.attr;

			if (typeof keyOrObj === 'string') {
				attr[keyOrObj] = value;
				return slider;
			}

			Object.keys(keyOrObj).forEach(function (key) {
				this[key] = keyOrObj[key];
			}, attr);

			return slider;

		},

		get: function (key) {

			return this.attr[key];

		},

		init: function () {

			var master = this;

			master.set('$files', $('.js-drop-down-zone'));

			master.bindEventListeners();

		},

		bindEventListeners: function () {

			var master = this,
				$files = master.get('$files');

			$files.on('change', function (e) {

				console.log('begin');

				var files = e.currentTarget.files;

				if ( !files.length ) {
					console.log('end');
					return;
				}

				master
					.prepareImages(master.toArray(files))
					.then(function (files) {
						master.sendFilesToServer(files);
					});

			});

		},

		prepareImages: function (files) {

			function isImage(file) {

				var fileName = file.name;

				return /\.(png|jpg|jpeg)$/.test(fileName);

			}

			function readAsDataURL(file) {

				return new Promise(function (resolve, reject) {

					var reader = new FileReader();

					if ( !isImage(file) ) {
						alert(file.name + ' - is not a image file!!!');
						location.reload();
						return;
					}

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

					if (canvasSize > 980) {
						canvasSize = 980;
					}

					canvas.width = canvas.height = canvasSize;

					ctx.fillStyle = "#FFF";

					ctx.fillRect(0, 0, canvasSize, canvasSize);

					scaleWidth = canvasSize / imageWidth;
					scaleHeight = canvasSize / imageHeight;

					if (scaleWidth < scaleHeight) {
						offsetTop = ( canvasSize - imageHeight * scaleWidth ) / 2 | 0;
						ctx.drawImage(img, offsetLeft, offsetTop, imageWidth * scaleWidth | 0, imageHeight * scaleWidth | 0);
					} else {
						offsetLeft = ( canvasSize - imageWidth * scaleHeight ) / 2 | 0;
						ctx.drawImage(img, offsetLeft, offsetTop, imageWidth * scaleHeight | 0, imageHeight * scaleHeight | 0);
					}

					resolve(canvas.toDataURL("image/jpeg", 1));

				});

			}

			function dataURLToFile(dataUrl) {

				var blobBin = atob(dataUrl.split(',')[1]),
					array = [],
					i, len;

				for (i = 0, len = blobBin.length; i < len; i += 1) {
					array.push(blobBin.charCodeAt(i));
				}

				return new Blob([new Uint8Array(array)], {type: 'image/png'});

			}

			return new Promise(function (resolve, reject) {

				var queue = new Queue(),
					preparedFiles = [];

				files.forEach(function (file) {

					queue.push(function () {
						return readAsDataURL(file)
							.then(dataURLToImage)
							.then(resizeImage)
							.then(function (dataURL) {
								preparedFiles.push({
									name: file.name,
									file: dataURLToFile(dataURL)
								});
							});
					});

				});

				queue.run().then(function () {
					resolve(preparedFiles);
				});

			});

		},

		sendFilesToServer: function (files) {

			var formData = new FormData(),
				fileName;

			files.forEach(function (item) {
				fileName = item.name.replace(/\s+/g, '_');
				formData.append('file.' + fileName, item.file, fileName);
			});

			xhrPro({
				type: 'POST',
				url: '/api/convert-photo',
				data: formData
			}).then(function (data) {

				var wrapper = $('<div></div>');

				JSON.parse(data).forEach(function (data) {
					wrapper
						.append('<a class="download-image-link" style="display: none;" href="' + data.path + '/' + data.name + '" download="tb-' + data.name + '" >' + data.name + '</a>');
				});

				wrapper.find('a').trigger('click');

				console.log('end');

			});
		}

	};

}(window, window.document));