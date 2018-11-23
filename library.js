'use strict';

const SocketPlugins = require.main.require('./src/socket.io/plugins');
const defaultComposer = require.main.require('nodebb-plugin-composer-default');
const plugins = module.parent.exports;
const meta = require.main.require('./src/meta');
const posts = require.main.require('./src/posts').async;
const helpers = require.main.require('./src/controllers/helpers');

const async = require('async');
const winston = require.main.require('winston');
const nconf = require.main.require('nconf');

const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter;
const controllers = require('./lib/controllers');

const plugin = {};

plugin.init = function (data, callback) {
	const router = data.router;
	const hostMiddleware = data.middleware;

	router.get('/admin/plugins/composer-quill', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/composer-quill', controllers.renderAdminPage);

	// Expose the default composer's socket method calls for this composer as well
	plugin.checkCompatibility(function (err, checks) {
		if (err) {
			return winston.error('[plugin/composer-quill] Error initialising plugin: ' + err.message);
		}

		if (checks.composer) {
			SocketPlugins.composer = defaultComposer.socketMethods;
		} else {
			winston.warn('[plugin/composer-quill] Another composer plugin is active! Please disable all other composers.');
		}
	});

	callback();
};

plugin.checkCompatibility = function (callback) {
	async.parallel({
		active: async.apply(plugins.getActive),
		markdown: async.apply(meta.settings.get, 'markdown'),
	}, function (err, data) {
		callback(err, {
			markdown: data.active.indexOf('nodebb-plugin-markdown') === -1,	// plugin disabled
			composer: data.active.filter(function (plugin) {
				return plugin.startsWith('nodebb-plugin-composer-') && plugin !== 'nodebb-plugin-composer-quill';
			}).length === 0,
		});
	});
};

plugin.addAdminNavigation = function (header, callback) {
	header.plugins.push({
		route: '/plugins/composer-quill',
		icon: 'fa-edit',
		name: 'Quill (Composer)',
	});

	callback(null, header);
};

plugin.build = function (data, callback) {
	// No plans for a standalone composer route, so handle redirection on f5
	var req = data.req;
	var res = data.res;

	if (req.query.p) {
		if (!res.locals.isAPI) {
			if (req.query.p.startsWith(nconf.get('relative_path'))) {
				req.query.p = req.query.p.replace(nconf.get('relative_path'), '');
			}

			return helpers.redirect(res, req.query.p);
		}
		return res.render('', {});
	} else if (!req.query.pid && !req.query.tid && !req.query.cid) {
		return helpers.redirect(res, '/');
	}

	callback(null, data);
};

plugin.savePost = (data, callback) => {
	try {
		var content = JSON.parse(data.post.content);
		var converter = new QuillDeltaToHtmlConverter(content.ops, {});

		data.post.quillDelta = data.post.content;
		data.post.content = converter.convert();
	} catch (e) {
		// Do nothing
		winston.verbose('[plugin/composer-quill (post)] Input not in expected format, skipping.');
	}

	callback(null, data);
};

plugin.saveChat = (data, callback) => {
	try {
		var content = JSON.parse(data.content);
		var converter = new QuillDeltaToHtmlConverter(content.ops, {});

		data.quillDelta = data.content;
		data.content = converter.convert();
	} catch (e) {
		// Do nothing
		winston.verbose('[plugin/composer-quill (chat)] Input not in expected format, skipping.');
	}

	callback(null, data);
};

plugin.append = async (data, callback) => {
	const delta = await posts.getPostField(data.pid, 'quillDelta');
	if (delta) {
		data.body = delta;
	}

	callback(null, data);
};

module.exports = plugin;
