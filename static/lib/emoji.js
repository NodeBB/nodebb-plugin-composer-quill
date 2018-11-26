'use strict';

/* globals $, define, socket, app, config */

/**
 * DEVELOPER NOTE
 *
 * It isn't particularly scalable to have a separate file for integration with
 * each individual plugin. Eventually, it is expected that Quill will fire off
 * hooks that plugins can listen for and invoke, therefore the code contained
 * here would be better located in the emoji plugin instead.
 *
 * .enable() is called from quill-nbb.js but it could very well be listening
 * for action:quill.load
 *
 * .convert() is called during composer autocomplete, which could be listening
 * for a hook to be fired by autocomplete, of which there is none right now.
 */

define('quill-emoji', ['quill'], function (quill) {
	var Emoji = {
		table: {},
		blots: {},
	};

	// Emoji Blot
	var imageBlot = quill.import('formats/image');
	var emojiAttributes = ['alt', 'class'];
	Emoji.blots.emoji = $.extend(true, imageBlot, {
		blotName: 'emoji',
		formats: function (domNode) {
			return emojiAttributes.reduce((formats, attribute) => {
				if (domNode.hasAttribute(attribute)) {
					formats[attribute] = domNode.getAttribute(attribute);
				}
				return formats;
			}, {});
		},
		format: function (name, value) {
			// this is not called :(
			console.log(name, value);
			if (emojiAttributes.indexOf(name) > -1) {
				if (value) {
					this.domNode.setAttribute(name, value);
				} else {
					this.domNode.removeAttribute(name);
				}
			} else {
				imageBlot.format(name, value);
			}
		},
	});
	quill.register(Emoji.blots.emoji);

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
		var emojiRegex = /:([\w+-]+):/g;

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
							insert: {
								emoji: config.relative_path + '/plugins/nodebb-plugin-emoji/emoji/' + emojiObj.pack + '/' + emojiObj.image + '?' + app.cacheBuster,
							},
							attributes: {
								alt: emojiObj.character + 'test',
								class: 'not-responsive emoji emoji-' + emojiObj.pack + ' emoji--' + emojiObj.name,
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
