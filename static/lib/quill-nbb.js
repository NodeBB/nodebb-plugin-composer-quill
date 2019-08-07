'use strict';

/* globals $, window, define, socket, app, ajaxify, utils, config */

define('quill-nbb', [
	'quill',
	'quill-emoji',
	'composer',
	'composer/autocomplete',
	'composer/resize',
	'composer/formatting',
	'components',
], function (Quill, Emoji, composer, autocomplete, resize, formatting, components) {
	var quillNbb = {
		uploads: {},
	};

	function init(targetEl, data, callback) {
		var textDirection = $('html').attr('data-dir');
		var textareaEl = targetEl.siblings('textarea');
		var toolbarOptions = {
			container: [
				[{ header: [1, 2, 3, 4, 5, 6, false] }], // h1..h6
				['bold', 'italic', 'underline', 'strike'], // toggled buttons
				['link', 'blockquote', 'code-block'],
				[{ list: 'ordered' }, { list: 'bullet' }],
				[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
				[{ color: [] }, { background: [] }], // dropdown with defaults from theme
				[{ align: [] }],
				['clean'],
			],
			handlers: {},
		};

		// Configure toolbar
		var toolbarHandlers = formatting.getDispatchTable();
		var group = [];
		data.formatting.forEach(function (option) {
			group.push(option.name);
			if (toolbarHandlers[option.name]) {
				toolbarOptions.handlers[option.name] = function () {
					// Chicken-wrapper to pass additional values to handlers (to match composer-default behaviour)
					var quill = targetEl.data('quill');
					var selection = quill.getSelection(true);
					toolbarHandlers[option.name].apply(quill, [textareaEl, selection.index, selection.index + selection.length]);
				};
			}
		});
		// -- upload privileges
		['upload:post:file', 'upload:post:image'].forEach(function (privilege) {
			if (app.user.privileges[privilege]) {
				var name = privilege === 'upload:post:image' ? 'picture' : 'upload';
				group.unshift(name);
				toolbarOptions.handlers[name] = toolbarHandlers[name].bind($('.formatting-bar'));
			}
		});
		toolbarOptions.container.push(group);

		// Quill...
		var quill = new Quill(targetEl.get(0), {
			theme: data.theme || 'snow',
			modules: {
				toolbar: toolbarOptions,
			},
		});
		targetEl.data('quill', quill);
		targetEl.find('.ql-editor').addClass('write');

		// Configure toolbar icons (must be done after quill itself is instantiated)
		var toolbarEl = targetEl.siblings('.ql-toolbar').length ? targetEl.siblings('.ql-toolbar') : targetEl.find('.ql-toolbar');
		data.formatting.forEach(function (option) {
			var buttonEl = toolbarEl.find('.ql-' + option.name);
			buttonEl.html('<i class="' + option.className + '"></i>');
			if (option.mobile) {
				buttonEl.addClass('visible-xs');
			}
		});
		['upload:post:image', 'upload:post:file'].forEach(function (privilege) {
			if (app.user.privileges[privilege]) {
				var className = privilege === 'upload:post:image' ? 'picture' : 'upload';
				var buttonEl = toolbarEl.find('.ql-' + className);
				if (className === 'picture') {
					buttonEl.html('<i class="fa fa-file-image-o"></i>');
				} else {
					buttonEl.html('<span class="fa-stack"><i class="fa fa-file-o fa-stack-1x"></i><i class="fa fa-arrow-up fa-stack-1x"></i></span>');
				}
			}
		});

		$(window).trigger('action:quill.load', quill);
		$(window).off('action:quill.load');

		// Restore text if contained in composerData
		if (data.composerData && data.composerData.body) {
			try {
				var unescaped = data.composerData.body.replace(/&quot;/g, '"');
				var delta = JSON.parse(unescaped);
				delta.ops.push({
					insert: '\n',
					attributes: {
						direction: textDirection,
						align: textDirection === 'rtl' ? 'right' : 'left',
					},
				});
				quill.setContents(delta, 'api');
			} catch (e) {
				quill.setContents({ ops: [{
					insert: data.composerData.body.toString(),
					attributes: {
						direction: textDirection,
						align: textDirection === 'rtl' ? 'right' : 'left',
					},
				}] }, 'api');
			}

			// Move cursor to the very end
			var length = quill.getLength();
			quill.setSelection(length);
		}

		// Automatic RTL support
		quill.format('direction', textDirection);
		quill.format('align', textDirection === 'rtl' ? 'right' : 'left');

		Emoji.enable(quill);

		// Update textarea on text-change event. This allows compatibility with
		// how NodeBB handles things like drafts, etc.
		quill.on('text-change', function () {
			if (isEmpty(quill)) {
				quill.deleteText(0, quill.getLength());
				textareaEl.val('');
				return;
			}

			textareaEl.val(JSON.stringify(quill.getContents()));
			textareaEl.trigger('change');
		});

		// Handle tab/enter for autocomplete
		var doAutocomplete = function () {
			setTimeout(Emoji.convert.bind(quill), 0);
			return !$('.composer-autocomplete-dropdown-' + data.post_uuid + ':visible').length;
		};
		[9, 13].forEach(function (keyCode) {
			quill.keyboard.addBinding({
				key: keyCode,
			}, doAutocomplete);
			quill.keyboard.bindings[keyCode].unshift(quill.keyboard.bindings[keyCode].pop());
		});

		if (!data.composerData || data.composerData.action !== 'topics.post') {
			// Oddly, a 0ms timeout is required here otherwise .focus() does not work
			setTimeout(quill.focus.bind(quill), 0);
		}

		if (typeof callback === 'function') {
			callback();
		}
	}

	function isEmpty(quill) {
		return quill.getContents().ops[0].insert === '\n' && quill.getLength() < 2;
	}

	$(window).on('action:composer.loaded', function (ev, data) {
		var postContainer = $('.composer[data-uuid="' + data.post_uuid + '"]');
		var targetEl = postContainer.find('.write-container div');

		init(targetEl, data);

		var cidEl = postContainer.find('.category-list');
		if (cidEl.length) {
			cidEl.attr('id', 'cmp-cid-' + data.post_uuid);
		} else {
			postContainer.append('<input id="cmp-cid-' + data.post_uuid + '" type="hidden" value="' + ajaxify.data.cid + '"/>');
		}

		// if (config.allowTopicsThumbnail && data.composerData.isMain) {
		//   var thumbToggleBtnEl = postContainer.find('.re-topic_thumb');
		//   var url = data.composerData.topic_thumb || '';

		//   postContainer.find('input#topic-thumb-url').val(url);
		//   postContainer.find('img.topic-thumb-preview').attr('src', url);

		//   if (url) {
		//     postContainer.find('.topic-thumb-clear-btn').removeClass('hide');
		//   }
		//   thumbToggleBtnEl.addClass('show');
		//   thumbToggleBtnEl.off('click').on('click', function() {
		//     var container = postContainer.find('.topic-thumb-container');
		//     container.toggleClass('hide', !container.hasClass('hide'));
		//   });
		// }

		autocomplete.init(postContainer, data.post_uuid);
		resize.reposition(postContainer);
	});

	$(window).on('action:chat.loaded', function (evt, containerEl) {
		// Create div element for composer
		var targetEl = $('<div></div>').insertBefore(components.get('chat/input'));

		var onInit = function () {
			autocomplete.init($(containerEl));
		};

		// Load formatting options into DOM on-demand
		if (composer.formatting) {
			init(targetEl, {
				formatting: composer.formatting,
				theme: 'bubble',
			}, onInit);
		} else {
			socket.emit('plugins.composer.getFormattingOptions', function (err, options) {
				if (err) {
					app.alertError(err.message);
				}

				composer.formatting = options;
				init(targetEl, {
					formatting: composer.formatting,
					theme: 'bubble',
				}, onInit);
			});
		}
	});

	$(window).on('action:chat.sent', function (evt, data) {
		// Empty chat input
		var quill = $('.chat-modal[data-roomid="' + data.roomId + '"] .ql-container, .expanded-chat[data-roomid="' + data.roomId + '"] .ql-container').data('quill');
		quill.deleteText(0, quill.getLength());

		// Reset text direction
		var textDirection = $('html').attr('data-dir');
		quill.format('direction', textDirection);
		quill.format('align', textDirection === 'rtl' ? 'right' : 'left');
	});

	$(window).on('action:composer.uploadUpdate', function (evt, data) {
		var quill = components.get('composer').filter('[data-uuid="' + data.post_uuid + '"]').find('.ql-container').data('quill');
		var filename = data.filename.replace(/^\d+_\d+_/, '');
		var alertId = utils.slugify([data.post_uuid, filename].join('-'));

		if (!quillNbb.uploads[filename]) {
			console.warn('[quill/uploads] Unable to find file (' + filename + ').');
			return;
		}

		if (data.text.startsWith('/')) {
			app.removeAlert(alertId);

			// Image vs. file upload
			if (quillNbb.uploads[filename].isImage) {
				quill.insertEmbed(quill.getSelection().index, 'image', window.location.origin + data.text);
			} else {
				var selection = quill.getSelection();

				if (selection.length) {
					var linkText = quill.getText(selection.index, selection.length);
					quill.deleteText(selection.index, selection.length);
					quill.insertText(selection.index, linkText, {
						link: data.text,
					});
				} else {
					quill.insertText(selection.index, filename, {
						link: data.text,
					});
				}
			}

			delete quillNbb.uploads[filename];
		} else {
			app.alert({
				alert_id: alertId,
				title: data.filename.replace(/\d_\d+_/, ''),
				message: data.text,
				timeout: 1000,
			});
		}
	});

	$(window).on('action:composer.uploadStart', function (evt, data) {
		data.files.forEach(function (file) {
			app.alert({
				alert_id: utils.slugify([data.post_uuid, file.filename].join('-')),
				title: file.filename.replace(/\d_\d+_/, ''),
				message: data.text,
			});
			quillNbb.uploads[file.filename] = {
				isImage: file.isImage,
			};
		});
	});

	$(window).on('action:composer.insertIntoTextarea', function (evt, data) {
		var selection = data.context.getSelection(true);
		data.context.insertText(selection.index, data.value);
		data.preventDefault = true;
	});

	$(window).on('action:composer.updateTextareaSelection', function (evt, data) {
		data.context.setSelection(data.start, data.end - data.start);
		data.preventDefault = true;
	});

	$(window).on('action:chat.updateRemainingLength', function (evt, data) {
		var quill = data.parent.find('.ql-container').data('quill');
		var length = quill.getText().length;
		data.parent.find('[component="chat/message/length"]').text(length);
		data.parent.find('[component="chat/message/remaining"]').text(config.maximumChatMessageLength - length);
	});
});
