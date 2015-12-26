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

			var formData = new FormData();

			files.forEach(function (file) {
				console.log(file.name);
				formData.append('file.' + file.name, file, file.name);
			});


/*
			$.ajax({
				url: '/api/convert-photo',
				type: 'POST',
				data: formData   // tell jQuery not to set contentType
			});
*/

			var xhr = new XMLHttpRequest();

			xhr.open('POST', '/api/convert-photo', true);

			xhr.send(formData);


		}

	};

}(window));