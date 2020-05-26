'use strict';

const MarkdownIt = require('markdown-it');
const markdown = new MarkdownIt();
const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter;
const isHtml = require('is-html');

const sanitize = require('sanitize-html');
const winston = require.main.require('winston');

const Migrator = module.exports;

Migrator.sanitizeConfig = {
	allowedTags: ['span', 'a', 'pre', 'blockquote', 'small', 'em', 'strong',
		'code', 'kbd', 'mark', 'address', 'cite', 'var', 'samp', 'dfn',
		'sup', 'sub', 'b', 'i', 'u', 'del', 'ol', 'ul', 'li', 'dl',
		'dt', 'dd', 'p', 'br', 'video', 'audio', 'source', 'iframe', 'embed',
		'param', 'img', 'table', 'tbody', 'tfoot', 'thead', 'tr', 'td', 'th',
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
	],
	allowedAttributes: {
		a: ['href', 'hreflang', 'media', 'rel', 'target', 'type'],
		img: ['alt', 'height', 'ismap', 'src', 'usemap', 'width'],
		iframe: ['height', 'name', 'src', 'width'],
		span: [],
		video: ['autoplay', 'controls', 'height', 'loop', 'muted', 'poster', 'preload', 'src', 'width'],
		audio: ['autoplay', 'controls', 'loop', 'muted', 'preload', 'src'],
		embed: ['height', 'src', 'type', 'width'],
		param: ['name', 'value'],
		source: ['media', 'src', 'type'],
	},
	globalAttributes: ['accesskey', 'class', 'contenteditable', 'dir',
		'draggable', 'dropzone', 'hidden', 'id', 'lang', 'spellcheck', 'style',
		'tabindex', 'title', 'translate',
	],
};

// Finish setup of sanitizehtml config
for (var i = 0; i < Migrator.sanitizeConfig.allowedTags.length; i++) {
	if (!Migrator.sanitizeConfig.allowedAttributes[Migrator.sanitizeConfig.allowedTags[i]]) {
		Migrator.sanitizeConfig.allowedAttributes[Migrator.sanitizeConfig.allowedTags[i]] = [];
	}

	for (var j = 0; j < Migrator.sanitizeConfig.globalAttributes.length; j++) {
		Migrator.sanitizeConfig.allowedAttributes[Migrator.sanitizeConfig.allowedTags[i]].push(Migrator.sanitizeConfig.globalAttributes[j]);
	}
}

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
		var converter = new QuillDeltaToHtmlConverter(content.ops, {});

		// Quill plugin should fire a hook here, passing converter.renderCustomWith
		// Emoji plugin should take that method and register a listener.
		// Also toHtml is probably going to end up being asynchronous, then... awaited?
		converter.renderCustomWith(function (customOp) {
			if (customOp.insert.type === 'emoji') {
				return '<img src="' + customOp.insert.value + '" alt="' + customOp.attributes.alt + '" class="' + customOp.attributes.class + '" />';
			}
		});

		return sanitize(converter.convert(), {
			allowedTags: Migrator.sanitizeConfig.allowedTags, allowedAttributes: Migrator.sanitizeConfig.allowedAttributes,
		});
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
