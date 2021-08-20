'use strict';

/* globals $, document, window */

$(document).ready(() => {
	const wrapWithBlockquote = function (delta) {
		// Validate the delta
		try {
			const parsed = JSON.parse(delta);
			parsed.ops = parsed.ops.map((op) => {
				// eslint-disable-next-line prefer-object-spread
				op.attributes = Object.assign({ mbq: true }, op.attributes || {});
				return op;
			});
			return JSON.stringify(parsed);
		} catch (e) {
			// Do nothing
			return delta;
		}
	};
	$(window).on('action:app.load', () => {
		require(['composer', 'quill-nbb'], (composer) => {
			$(window).on('action:composer.topic.new', (ev, data) => {
				composer.newTopic({
					cid: data.cid,
					title: data.title,
					body: data.body,
				});
			});

			$(window).on('action:composer.post.edit', (ev, data) => {
				composer.editPost(data.pid);
			});

			$(window).on('action:composer.post.new', (ev, data) => {
				composer.newReply(data.tid, data.pid, data.topicName, data.text);
			});

			$(window).on('action:composer.addQuote', (ev, data) => {
				composer.newReply(data.tid, data.pid, data.topicName, wrapWithBlockquote(data.text));
			});
		});
	});
});
