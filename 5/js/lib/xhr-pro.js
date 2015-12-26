/*jslint white: true, nomen: true */
(function (win) {

	'use strict';
	/*global window */
	/*global */

	function xhrPro(data) {

		return new Promise(function (resolve, reject) {

			var xhr = new XMLHttpRequest();
			xhr.open(data.type || 'GET', data.url, true);
			xhr.send(data.data || null);

			xhr.onreadystatechange = function () {
				if (this.readyState != 4) return;
				return this.status == 200 ? resolve(this.responseText) : reject();
			}

		});

	}

	win.xhrPro = xhrPro;

}(window));