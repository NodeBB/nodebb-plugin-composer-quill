'use strict';

const MarkdownIt = require('markdown-it');

const markdown = new MarkdownIt();
const { QuillDeltaToHtmlConverter } = require('quill-delta-to-html');
const { TableParser } = require('quill-v1-table/TableDeltaToHtml');
const isHtml = require('is-html');

const Migrator = module.exports;

Migrator.resolveNbb = id => require.main.require(id);

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

function registerEmojiOnConverter(converter) {
	converter.renderCustomWith((customOp) => {
		if (customOp.insert.type === 'emoji') {
			return `<img src="${customOp.insert.value.src}" alt="${customOp.attributes.alt}" class="${customOp.attributes.class}" />`;
		}
	});
}

function segmentDeltaOps(ops) {
	const segments = [];
	let i = 0;
	while (i < ops.length) {
		const op = ops[i];
		const next = ops[i + 1];
		const opTd = !!(op.attributes && op.attributes.td);
		const nextTd = !!(next && next.attributes && next.attributes.td);

		if (opTd || nextTd) {
			const tableOps = [];
			while (i < ops.length) {
				const o = ops[i];
				const n = ops[i + 1];
				const oTd = !!(o.attributes && o.attributes.td);
				const nTd = !!(n && n.attributes && n.attributes.td);
				if (oTd || nTd) {
					tableOps.push(o);
					i += 1;
				} else {
					break;
				}
			}
			segments.push({ type: 'table', ops: tableOps });
		} else {
			const textOps = [];
			while (i < ops.length) {
				const o = ops[i];
				const n = ops[i + 1];
				const oTd = !!(o.attributes && o.attributes.td);
				const nTd = !!(n && n.attributes && n.attributes.td);
				if (oTd || nTd) {
					break;
				}
				textOps.push(o);
				i += 1;
			}
			segments.push({ type: 'text', ops: textOps });
		}
	}
	return segments;
}

Migrator.convertMixedDeltaToHtml = (delta) => {
	const {ops} = delta;
	if (!Array.isArray(ops)) {
		return '';
	}
	const parts = [];
	const segments = segmentDeltaOps(ops);
	for (let s = 0; s < segments.length; s += 1) {
		const seg = segments[s];
		if (seg.type === 'table') {
			const parser = new TableParser(seg.ops);
			parser.parse();
			parts.push(parser.toHTML());
		} else if (seg.ops.length > 0) {
			const converter = new QuillDeltaToHtmlConverter(seg.ops, {});
			registerEmojiOnConverter(converter);
			parts.push(converter.convert());
		}
	}
	return parts.join('');
};

Migrator.toHtml = (content) => {
	const posts = Migrator.resolveNbb('./src/posts');
	const winston = Migrator.resolveNbb('winston');
	try {
		const delta = JSON.parse(content);
		if (!delta || !Array.isArray(delta.ops)) {
			winston.verbose('[plugin/composer-quill (toHtml)] Input not in expected format, skipping.');
			return false;
		}
		const html = Migrator.convertMixedDeltaToHtml(delta);
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
