/*jslint white: true, nomen: true */
(function (win) {

	'use strict';
	/*global window */
	/*global */

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
				master.sendFilesToServer(master.toArray(e.currentTarget.files));
			});


		},

		sendFilesToServer: function (files) {

			var formData = new FormData(),
				fileName;

			files.forEach(function (file) {
				fileName = file.name.replace(/\s+/g, '_');
				formData.append('file.' + fileName, file, fileName);
			});

			xhrPro({
				type: 'POST',
				url: '/api/convert-photo',
				data: formData
			}).then(function (data) {

				var wrapper = $('.js-download-links');

				JSON.parse(data).forEach(function (data) {
					wrapper
						.append('<a class="download-image-link" style="display: none;" href="' + data.path + '/' + data.name + '" download="' + data.name + '" >' + data.name + '</a>');
				});

				wrapper.find('a').trigger('click');

			});
		}

	};

}(window));