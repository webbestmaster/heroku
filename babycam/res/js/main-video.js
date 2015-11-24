/*jslint white: true, nomen: true */
(function (win) {

	'use strict';
	/*global window */
	/*global */

	win.addEventListener('load', function () {

		// Not showing vendor prefixes.
		win.navigator.webkitGetUserMedia({video: true, audio: true},
			function (localMediaStream) {
				var video = document.querySelector('video');
				video.src = win.URL.createObjectURL(localMediaStream);

				function capture(video, scaleFactor) {
					if (scaleFactor == null) {
						scaleFactor = 1;
					}
					var w = video.videoWidth * scaleFactor;
					var h = video.videoHeight * scaleFactor;
					var canvas = document.createElement('canvas');
					canvas.width = w;
					canvas.height = h;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(video, 0, 0, w, h);
					return canvas;
				}

				setInterval(function () {
					console.log(capture(video, 1).toDataURL());
				}, 1000);

			},
			function () {
				console.log('Rejected!');
			}
		);

	}, false);


}(window));