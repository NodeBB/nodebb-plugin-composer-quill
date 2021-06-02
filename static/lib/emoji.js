'use strict';

/* globals define, socket, app, config */

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
 *
 * 2 June 2011 -- core now has client-side hooks, which will allow this to happen.
 */

define('quill-emoji', ['quill'], (quill) => {
	const Emoji = {
		table: {},
	};

	// Emoji Blot
	const imageBlot = quill.import('formats/image');
	const emojiAttributes = ['alt', 'class'];

	class EmojiBlot extends imageBlot {
		static create(value) {
			const node = super.create(value.src);
			node.setAttribute('class', value.class);
			return node;
		}

		static formats(domNode) {
			return emojiAttributes.reduce((formats, attribute) => {
				if (domNode.hasAttribute(attribute)) {
					formats[attribute] = domNode.getAttribute(attribute);
				}
				return formats;
			}, {});
		}

		static format(name, value) {
			if (emojiAttributes.includes(name)) {
				if (value) {
					this.domNode.setAttribute(name, value);
				} else {
					this.domNode.removeAttribute(name);
				}
			} else {
				super.format(name, value);
			}
		}
	}
	EmojiBlot.blotName = 'emoji';
	quill.register(EmojiBlot);

	Emoji.enable = function (quill) {
		if (!Object.keys(Emoji.table).length) {
			socket.emit('plugins.composer-quill.getEmojiTable', {}, (err, table) => {
				if (err) {
					app.alertError(err.message);
				}

				if (table !== null) {
					Emoji.table = table;
					quill.on('text-change', Emoji.convert.bind(quill));
				}
			});
		}
	};

	Emoji.convert = function (delta) {
		const quill = this;
		const contents = quill.getContents();
		const emojiRegex = /:([\w+-]+):/g;

		// Special handling for emoji plugin
		if (!delta || delta.ops.some(command => command.insert && (command.insert === ':' || String(command.insert).endsWith(':') || String(command.insert).endsWith(': \n')))) {
			// Check all nodes for emoji shorthand and replace with image
			contents.reduce((retain, cur) => {
				let match = emojiRegex.exec(cur.insert);
				let contents;
				let emojiObj;
				while (match !== null) {
					emojiObj = Emoji.table[match[1]];
					if (emojiObj) {
						contents = [{
							insert: {
								emoji: {
									url: `${config.relative_path}/plugins/nodebb-plugin-emoji/emoji/${emojiObj.pack}/${emojiObj.image}?${app.cacheBuster}`,
									class: `not-responsive emoji emoji-${emojiObj.pack} emoji--${emojiObj.name}`,
								},
							},
							attributes: {
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
