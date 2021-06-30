'use strict';

const posts = require.main.require('./src/posts');

const MarkdownIt = require('markdown-it');

const markdown = new MarkdownIt();
const { QuillDeltaToHtmlConverter } = require('quill-delta-to-html');
const isHtml = require('is-html');

const winston = require.main.require('winston');

const Migrator = module.exports;

Migrator.detect = (postObj) => {
	const isHtml = Migrator.isHtml(postObj);

	return Object.freeze({
		quill: Migrator.isQuill(postObj),
		html: isHtml,
		markdown: !isHtml,
	});
};

Migrator.isQuill = postObj => postObj.hasOwnProperty('quillDelta');

Migrator.isDelta = (content) => {
	try {
		content = JSON.parse(content);
		return content.hasOwnProperty('ops') && Array.isArray(content.ops);
	} catch (e) {
		return false;
	}
};

Migrator.isHtml = postObj => isHtml(postObj.content);

Migrator.isMarkdown = postObj => !Migrator.isHTML(postObj);

Migrator.toHtml = (content) => {
	try {
		content = JSON.parse(content);
		const converter = new QuillDeltaToHtmlConverter(content.ops, {});

		// Quill plugin should fire a hook here, passing converter.renderCustomWith
		// Emoji plugin should take that method and register a listener.
		// Also toHtml is probably going to end up being asynchronous, then... awaited?
		converter.renderCustomWith((customOp) => {
			if (customOp.insert.type === 'emoji') {
				return '<img src="' + customOp.insert.value + '" alt="' + customOp.attributes.alt + '" class="' + customOp.attributes.class + '" />';
			}
		});

		return posts.sanitize(converter.convert());
	} catch (e) {
		// Do nothing
		winston.verbose('[plugin/composer-quill (toHtml)] Input not in expected format, skipping.');
		return false;
	}
};

Migrator.toQuill = (postObj) => {
	const currently = Migrator.detect(postObj);

	if (currently.quill) {
		// Delta already available, no action needed
		return postObj;
	}

	// Preserve existing content for backup purposes
	postObj.quillBackup = postObj.content;

	if (currently.markdown) {
		// Convert to HTML
		postObj.content = markdown.render(postObj.content);
	}

	// Finally, convert to delta
	postObj.quillDelta = JSON.stringify(require('node-quill-converter').convertHtmlToDelta(postObj.content));

	return postObj;
};
