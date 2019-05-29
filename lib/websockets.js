'use strict';

var Sockets = module.exports;

Sockets.getEmojiTable = function (socket, data, callback) {
	const table = require.main.require('nodebb-plugin-emoji/build/emoji/table.json');
	callback(null, table);
};
