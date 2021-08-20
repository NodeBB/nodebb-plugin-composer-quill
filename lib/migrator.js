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
		const converter = new QuillDeltaToHtmlConverter(content.ops, {
			customCssClasses: (op) => {
				const classes = [];
				if (op.attributes.mbq) {
					classes.push('ql-mbq-true');
				}

				return classes;
			},
		});
		const fixOps = ops => ops.map((op) => {
			if (op.insert && op.insert.type === 'text') {
				op.insert = op.insert.value;
			}

			return op;
		});

		converter.beforeRender((groupType, data) => {
			switch (groupType) {
				case 'inline-group': {
					const ops = fixOps(data.ops);
					console.log(ops);
					const isMbq = ops.some(op => op.attributes && op.attributes.mbq === true);

					if (isMbq) {
						const converter = new QuillDeltaToHtmlConverter(ops, {
							multiLineParagraph: false,
							customTag: () => 'p',
							customTagAttributes: () => ({
								class: 'ql-mbq-true',
							}),
						});
						const html = converter.convert();
						return html.replace(/><span|<\/span>/g, '').replace(/<p><br\/><\/p>/g, '');
					}

					return false;
				}

				default:
					return false;
			}
		});

		converter.afterRender((groupType, html) => {
			if (groupType === 'list') {
				const mbqTest = /li.+ql-mbq-true.+>/;
				if (mbqTest.test(html)) {
					return html.replace('<ul>', '<ul class="ql-mbq-true">');
				}
			} else {
				return html;
			}
		});

		// Quill plugin should fire a hook here, passing converter.renderCustomWith
		// Emoji plugin should take that method and register a listener.
		// Also toHtml is probably going to end up being asynchronous, then... awaited?
		converter.renderCustomWith((customOp) => {
			if (customOp.insert.type === 'emoji') {
				return `<img src="${customOp.insert.value.src}" alt="${customOp.attributes.alt}" class="${customOp.attributes.class}" />`;
			}
		});

		let html = converter.convert();

		// Convert ql-mbq-true classes to a wrapper blockquote
		let mbqOn = false;
		html = html.replace(/><([^/])/g, '>\n<$1').split('\n').reduce((memo, cur) => {
			// console.log(mbqOn, cur);
			if (!mbqOn && cur.indexOf('ql-mbq-true') !== -1) {
				// console.log('MBQ ON');
				mbqOn = true;
				return `${memo}<blockquote>${cur}`;
			} else if (mbqOn && cur.indexOf('ql-mbq-true') === -1) {
				// console.log('MBQ OFF');
				mbqOn = false;
				return `${memo}</blockquote>${cur}`;
			}

			return `${memo}${cur}`;
		}, '');

		console.log(html);
		return posts.sanitize(html);
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
