'use strict';

const SocketPlugins = require.main.require('./src/socket.io/plugins');
const SocketAdmin = require.main.require('./src/socket.io/admin').plugins;
SocketAdmin['composer-quill'] = require('./lib/adminsockets.js');
const defaultComposer = require.main.require('nodebb-plugin-composer-default');
const plugins = module.parent.exports;
const meta = require.main.require('./src/meta');
const posts = require.main.require('./src/posts');
const helpers = require.main.require('./src/controllers/helpers');

const async = require('async');
const winston = require.main.require('winston');
const nconf = require.main.require('nconf');

const controllers = require('./lib/controllers');
const migrator = require('./lib/migrator');

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
			SocketPlugins['composer-quill'] = require('./lib/websockets');
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

plugin.savePost = async (data) => {
	if (migrator.isDelta(data.post.content)) {
		// Optimistic case: regular post via quill composer
		data.post.quillDelta = data.post.content;
		data.post.content = migrator.toHtml(data.post.content);
	} else {
		// Fallback to handle write-api and such
		data.post = migrator.toQuill(data.post);
	}

	return data;
};

plugin.saveChat = (data, callback) => {
	if (data.system) {
		return setImmediate(callback, null, data);
	}

	data.quillDelta = data.content;
	data.content = migrator.toHtml(data.content);
	callback(null, data);
};

plugin.append = async (data) => {
	const delta = await posts.getPostField(data.pid, 'quillDelta');
	if (delta) {
		data.body = delta;
	}
	return data;
};

plugin.handleRawPost = async (data) => {
	data.content = await posts.getPostField(data.pid, 'quillDelta');
	return data;
};

module.exports = plugin;
