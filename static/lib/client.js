'use strict';

/* globals $, document, window */

$(document).ready(function () {
	var wrapWithBlockquote = function (delta) {
		// Validate the delta
		try {
			var parsed = JSON.parse(delta);
			parsed.ops = parsed.ops.map(function (op) {
				op.attributes = Object.assign({ blockquote: true }, op.attributes || {});
				return op;
			});
			return JSON.stringify(parsed);
		} catch (e) {
			// Do nothing
			return delta;
		}
	};
	$(window).on('action:app.load', function () {
		require(['composer', 'quill-nbb'], function (composer) {
			$(window).on('action:composer.topic.new', function (ev, data) {
				composer.newTopic({
					cid: data.cid,
					title: data.title,
					body: data.body,
				});
			});

			$(window).on('action:composer.post.edit', function (ev, data) {
				composer.editPost(data.pid);
			});

			$(window).on('action:composer.post.new', function (ev, data) {
				composer.newReply(data.tid, data.pid, data.topicName, data.text);
			});

			$(window).on('action:composer.addQuote', function (ev, data) {
				composer.newReply(data.tid, data.pid, data.topicName, wrapWithBlockquote(data.text));
			});
		});
	});
});
