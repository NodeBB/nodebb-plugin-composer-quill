'use strict';

/* globals document, $, window, define, socket, app, ajaxify, config */

window.quill = {
	uploads: {},
};

define('quill-nbb', [
	'quill',
	'composer/resize',
	'components',
	'slugify',
], (Quill, resize, components, slugify) => {
	$(window).on('action:composer.loaded', (ev, data) => {
		const postContainer = $(`.composer[data-uuid="${data.post_uuid}"]`);
		const targetEl = postContainer.find('.write-container div');

		window.quill.init(targetEl, data);

		const cidEl = postContainer.find('.category-list');
		if (cidEl.length) {
			cidEl.attr('id', `cmp-cid-${data.post_uuid}`);
		} else {
			postContainer.append(`<input id="cmp-cid-${data.post_uuid}" type="hidden" value="${ajaxify.data.cid}"/>`);
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

		resize.reposition(postContainer);
	});

	$(window).on('action:composer.check', (ev, data) => {
		// Update bodyLen for length checking purposes
		const quill = components.get('composer').filter(`[data-uuid="${data.post_uuid}"]`).find('.ql-container').data('quill');
		data.bodyLen = quill.getLength() - 1;
	});

	$(window).on('action:chat.sent', (evt, data) => {
		// Empty chat input
		const quill = $(`.chat-modal[data-roomid="${data.roomId}"] .ql-container, .expanded-chat[data-roomid="${data.roomId}"] .ql-container`).data('quill');
		quill.deleteText(0, quill.getLength());

		// Reset text direction
		const textDirection = $('html').attr('data-dir');
		quill.format('direction', textDirection);
		quill.format('align', textDirection === 'rtl' ? 'right' : 'left');
	});

	$(window).on('action:chat.prepEdit', (evt, data) => {
		let value = data.inputEl.val();
		const quill = data.inputEl.siblings('.ql-container').data('quill');

		try {
			value = JSON.parse(value);
			quill.setContents(value, 'user');
		} catch (e) {
			app.alertError('[[error:invalid-json]]');
		}
	});

	$(window).on('action:composer.uploadUpdate', (evt, data) => {
		const filename = data.filename.replace(/^\d+_\d+_/, '');
		const alertId = generateAlertId(data.post_uuid, filename);
		if (!window.quill.uploads[filename]) {
			console.warn(`[quill/uploads] Unable to find file (${filename}).`);
			app.removeAlert(alertId);
			return;
		}

		if (!data.text.startsWith('/')) {
			app.alert({
				alert_id: alertId,
				title: data.filename.replace(/\d_\d+_/, ''),
				message: data.text,
				timeout: 1000,
			});
		}
	});

	$(window).on('action:composer.upload', (evt, data) => {
		const quill = components.get('composer').filter(`[data-uuid="${data.post_uuid}"]`).find('.ql-container').data('quill');
		data.files.forEach((file) => {
			const alertId = generateAlertId(data.post_uuid, file.filename);
			app.removeAlert(alertId);

			// Image vs. file upload
			if (file.isImage) {
				quill.insertEmbed(quill.getSelection().index, 'image', file.url);
			} else {
				const selection = quill.getSelection();

				if (selection.length) {
					const linkText = quill.getText(selection.index, selection.length);
					quill.deleteText(selection.index, selection.length);
					quill.insertText(selection.index, linkText, {
						link: file.url,
					});
				} else {
					quill.insertText(selection.index, file.filename, {
						link: file.url,
					});
				}
			}
		});
	});

	$(window).on('action:composer.uploadError', (evt, data) => {
		const quill = components.get('composer').filter(`[data-uuid="${data.post_uuid}"]`).find('.ql-container').data('quill');
		const textareaEl = components.get('composer').filter(`[data-uuid="${data.post_uuid}"]`).find('textarea');
		textareaEl.val(!window.quill.isEmpty(quill) ? JSON.stringify(quill.getContents()) : '');
		textareaEl.trigger('change');
		textareaEl.trigger('keyup');
	});

	$(window).on('action:composer.uploadStart', (evt, data) => {
		data.files.forEach((file) => {
			app.alert({
				alert_id: generateAlertId(data.post_uuid, file.filename),
				title: file.filename.replace(/\d_\d+_/, ''),
				message: data.text,
			});
		});
	});

	$(window).on('action:composer.insertIntoTextarea', (evt, data) => {
		const quill = $(data.textarea).siblings('.ql-container').data('quill');
		const selection = quill.getSelection(true);
		quill.insertText(selection.index, data.value);
		data.preventDefault = true;

		// hack to convert emoji's inserted text into... an emoji
		require(['quill-emoji'], (Emoji) => {
			Emoji.convert.call(quill);
		});
	});

	$(window).on('action:composer.updateTextareaSelection', (evt, data) => {
		const quill = $(data.textarea).siblings('.ql-container').data('quill');
		quill.setSelection(data.start, data.end - data.start);
		data.preventDefault = true;
	});

	$(window).on('action:composer.wrapSelectionInTextareaWith', (evt, data) => {
		const Delta = Quill.import('delta');
		const quill = $(data.textarea).siblings('.ql-container').data('quill');

		const range = quill.getSelection();
		let insertionDelta;

		if (range.length) {
			insertionDelta = quill.getContents(range.index, range.length);
		} else {
			insertionDelta = new Delta();
		}

		// Wrap selection in spoiler tags
		quill.updateContents(new Delta()
			.retain(range.index)
			.delete(range.length)
			.insert(data.leading)
			.concat(insertionDelta)
			.insert(data.trailing));

		if (range.length) {
			// Update selection
			quill.setSelection(range.index + (data.leading.length), range.length);
		}

		data.preventDefault = true;
	});

	$(window).on('action:chat.updateRemainingLength', (evt, data) => {
		const quill = data.parent.find('.ql-container').data('quill');
		const length = quill.getText().length - 1;
		data.parent.find('[component="chat/message/length"]').text(length);
		data.parent.find('[component="chat/message/remaining"]').text(config.maximumChatMessageLength - length);
	});

	function generateAlertId(uuid, filename) {
		return slugify([uuid, filename].join('-'));
	}
});

// Window events that must be attached immediately

$(window).on('action:chat.loaded', (evt, containerEl) => {
	require([
		'composer',
		'composer/autocomplete',
		'components',
	], (composer, autocomplete, components) => {
		// Create div element for composer
		const targetEl = $('<div></div>').insertBefore(components.get('chat/input'));

		const onInit = function () {
			autocomplete.init($(containerEl));
		};

		// Load formatting options into DOM on-demand
		if (composer.formatting) {
			window.quill.init(targetEl, {
				formatting: composer.formatting,
				theme: 'bubble',
				bounds: containerEl,
			}, onInit);
		} else {
			socket.emit('plugins.composer.getFormattingOptions', (err, options) => {
				if (err) {
					app.alertError(err.message);
				}

				composer.formatting = options;
				window.quill.init(targetEl, {
					formatting: composer.formatting,
					theme: 'bubble',
					bounds: containerEl,
				}, onInit);
			});
		}
	});
});

// Internal methods

window.quill.init = function (targetEl, data, callback) {
	require([
		'quill', 'quill-magic-url', 'quill-emoji',
		'composer/autocomplete', 'composer/drafts',
	], (Quill, MagicUrl, Emoji, autocomplete, drafts) => {
		const textDirection = $('html').attr('data-dir');
		const textareaEl = targetEl.siblings('textarea');

		window.quill.configureToolbar(targetEl, data).then(({ toolbar }) => {
			// Quill...
			Quill.register('modules/magicUrl', MagicUrl.default);
			const quill = new Quill(targetEl.get(0), {
				theme: data.theme || 'snow',
				modules: {
					toolbar,
					magicUrl: {
						normalizeUrlOptions: {
							sortQueryParameters: false,
							defaultProtocol: 'https:',
						},
					},
				},
				bounds: data.bounds || document.body,
			});
			targetEl.data('quill', quill);
			targetEl.find('.ql-editor').addClass('write');

			// Configure toolbar icons (must be done after quill itself is instantiated)
			const toolbarEl = targetEl.siblings('.ql-toolbar').length ? targetEl.siblings('.ql-toolbar') : targetEl.find('.ql-toolbar');
			data.formatting.forEach((option) => {
				const buttonEl = toolbarEl.find(`.ql-${option.name}`);
				buttonEl.html(`<i class="${option.className}"></i>`);
				if (option.mobile) {
					buttonEl.addClass('visible-xs');
				}
			});
			['upload:post:image', 'upload:post:file'].forEach((privilege) => {
				if (app.user.privileges[privilege]) {
					const className = privilege === 'upload:post:image' ? 'picture' : 'upload';
					const buttonEl = toolbarEl.find(`.ql-${className}`);
					if (className === 'picture') {
						buttonEl.html('<i class="fa fa-file-image-o"></i>');
					} else {
						buttonEl.html('<i class="fa fa-file-o"></i>');
					}
				}
			});

			$(window).trigger('action:quill.load', quill);

			// Restore text if contained in composerData or drafts
			const draft = data.composerData && drafts.get(data.composerData.save_id);
			if (data.composerData && data.composerData.body) {
				try {
					const unescaped = data.composerData.body.replace(/&quot;/g, '"');
					const delta = JSON.parse(unescaped);
					delta.ops.push({
						insert: '\n',
						attributes: {
							direction: textDirection,
							align: textDirection === 'rtl' ? 'right' : 'left',
						},
					});
					quill.setContents(delta, 'api');
				} catch (e) {
					quill.setContents({
						ops: [{
							insert: data.composerData.body.toString(),
							attributes: {
								direction: textDirection,
								align: textDirection === 'rtl' ? 'right' : 'left',
							},
						}],
					}, 'api');
				}

				// Move cursor to the very end
				const length = quill.getLength();
				quill.setSelection(length);
			} else if (draft && draft.text) {
				// Set title
				targetEl.parents('.composer').find('.title').val(draft.title);
				const delta = JSON.parse(draft.text);
				delta.ops.push({
					insert: '\n',
					attributes: {
						direction: textDirection,
						align: textDirection === 'rtl' ? 'right' : 'left',
					},
				});
				quill.setContents(delta, 'api');
			}

			// Automatic RTL support
			quill.format('direction', textDirection);
			quill.format('align', textDirection === 'rtl' ? 'right' : 'left');

			autocomplete.init(targetEl, data.post_uuid);
			Emoji.enable(quill);

			// Update textarea on editor-change event. This allows compatibility with
			// how NodeBB handles things like drafts, etc.
			quill.on('editor-change', () => {
				textareaEl.val(JSON.stringify(quill.getContents()));
				textareaEl.trigger('change');
				textareaEl.trigger('keyup');
			});

			// Special handling on text-change
			quill.on('text-change', () => {
				if (window.quill.isEmpty(quill)) {
					quill.deleteText(0, quill.getLength());
					textareaEl.val('');
				}
			});

			// Handle tab/enter for autocomplete
			const doAutocomplete = function () {
				setTimeout(Emoji.convert.bind(quill), 0);
				return !$(`.composer-autocomplete-dropdown-${data.post_uuid}:visible`).length;
			};
			[9, 13].forEach((keyCode) => {
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
		});
	});

	return window.quill;
};

window.quill.configureToolbar = async (targetEl, data) => {
	const textareaEl = targetEl.siblings('textarea');
	const [formatting, hooks] = await new Promise((resolve) => {
		require(['composer/formatting', 'hooks'], (...libs) => resolve(libs));
	});
	const toolbar = {
		container: [
			[{ header: [1, 2, 3, 4, 5, 6, false] }], // h1..h6
			[{ font: [] }],
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
	const toolbarHandlers = formatting.getDispatchTable();
	const group = [];
	data.formatting.forEach((option) => {
		group.push(option.name);
		toolbar.handlers[option.name] = function () {
			// Chicken-wrapper to pass additional values to handlers (to match composer-default behaviour)
			const quill = targetEl.data('quill');
			const selection = quill.getSelection(true);
			toolbarHandlers[option.name].apply(
				data.postContainer,
				[textareaEl.get(0), selection.index, selection.index + selection.length]
			);
		};
	});
	// -- upload privileges
	['upload:post:file', 'upload:post:image'].forEach((privilege) => {
		if (app.user.privileges[privilege]) {
			const name = privilege === 'upload:post:image' ? 'picture' : 'upload';
			group.unshift(name);
			toolbar.handlers[name] = toolbarHandlers[name].bind($('.formatting-bar'));
		}
	});
	toolbar.container.push(group);

	// Allow plugins to modify toolbar
	return await hooks.fire('filter:quill.toolbar', { toolbar });
};

window.quill.isEmpty = function (quill) {
	const contents = quill.getContents();

	if (contents.ops.length === 1) {
		const value = contents.ops[0].insert.replace(/[\s\n]/g, '');
		return value === '';
	}

	return false;
};
