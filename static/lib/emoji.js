'use strict';

/* globals define, socket, app, config */

define('quill-emoji', function () {
	var Emoji = {
		table: {},
	};

	Emoji.enable = function (quill) {
		if (!Object.keys(Emoji.table).length) {
			socket.emit('plugins.composer-quill.getEmojiTable', {}, function (err, table) {
				if (err) {
					app.alertError(err.message);
				}

				Emoji.table = table;
			});
		}

		quill.on('text-change', Emoji.convert.bind(quill));
	};

	Emoji.convert = function (delta) {
		var quill = this;
		var contents = quill.getContents();
		var emojiRegex = /:(\w+):/g;

		// Special handling for emoji plugin
		if (!delta || delta.ops.some(command => command.insert && (command.insert === ':' || String(command.insert).endsWith(':')))) {
			// Check all nodes for emoji shorthand and replace with image
			contents.reduce(function (retain, cur) {
				var match = emojiRegex.exec(cur.insert);
				var contents;
				var emojiObj;
				while (match !== null) {
					emojiObj = Emoji.table[match[1]];
					if (emojiObj) {
						contents = [{
							insert: 1,
							attributes: {
								image: config.relative_path + '/plugins/nodebb-plugin-emoji/emoji/' + emojiObj.pack + '/' + emojiObj.image + '?' + app.cacheBuster,
								alt: emojiObj.character,
							},
						}];
						if (match[0].length) {
							contents.unshift({ delete: match[0].length });
						}
						if (retain + match.index) {
							contents.unshift({ retain: retain + match.index });
						}

						quill.updateContents({
							ops: contents,
						});
					}

					// Reset search and continue
					emojiRegex.lastIndex = retain + match.index + 1;
					match = emojiRegex.exec(cur.insert);
				}

				retain += cur.insert.length || 1;
				return retain;
			}, 0);
		}
	};

	return Emoji;
});
