"use strict";

var controllers = require('./lib/controllers');
var SocketPlugins = require.main.require('./src/socket.io/plugins');
var defaultComposer = module.parent.require('nodebb-plugin-composer-default');
var plugins = module.parent.exports;
var meta = module.parent.require('./meta');
var helpers = module.parent.require('./controllers/helpers');
var async = module.parent.require('async');
var winston = module.parent.require('winston');
var nconf = module.parent.require('nconf');

var QuillDeltaToHtmlConverter = require('quill-delta-to-html');

var plugin = {};

plugin.init = function(data, callback) {
	var router = data.router;
	var hostMiddleware = data.middleware;
	var hostControllers = data.controllers;

	router.get('/admin/plugins/composer-quill', hostMiddleware.admin.buildHeader, controllers.renderAdminPage);
	router.get('/api/admin/plugins/composer-quill', controllers.renderAdminPage);

	// Expose the default composer's socket method calls for this composer as well
	plugin.checkCompatibility(function(err, checks) {
		if (checks.composer) {
			SocketPlugins.composer = defaultComposer.socketMethods;
		} else {
			winston.warn('[plugin/composer-quill] Another composer plugin is active! Please disable all other composers.');
		}
	});

	callback();
};

plugin.checkCompatibility = function(callback) {
	async.parallel({
		active: async.apply(plugins.getActive),
		markdown: async.apply(meta.settings.get, 'markdown')
	}, function(err, data) {
		callback(null, {
			markdown: data.active.indexOf('nodebb-plugin-markdown') === -1,	// plugin disabled
			composer: data.active.filter(function(plugin) {
				return plugin.startsWith('nodebb-plugin-composer-') && plugin !== 'nodebb-plugin-composer-quill';
			}).length === 0
		})
	});
};

plugin.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/composer-quill',
		icon: 'fa-edit',
		name: 'Quill (Composer)'
	});

	callback(null, header);
};

plugin.parsePost = function (data, callback) {
	plugin.parseRaw(data.postData.content, function (err, parsed) {
		data.postData.content = parsed;
		callback(null, data);
	});
};

plugin.parseRaw = function (raw, callback) {
	try {
		var unescaped = raw.replace(/&quot;/g, '"');
		var content = JSON.parse(unescaped);
		var converter = new QuillDeltaToHtmlConverter(content.ops, {});
		
		raw = converter.convert();
	} catch (e) {
		// Do nothing
		winston.verbose('[composer-quill] Input not in expected format, skipping.');
	}

	callback(null, raw);
};

plugin.build = function(data, callback) {
	// No plans for a standalone composer route, so handle redirection on f5
	var req = data.req;
	var res = data.res;

	if (req.query.p) {
		if (!res.locals.isAPI) {
			if (req.query.p.startsWith(nconf.get('relative_path'))) {
				req.query.p = req.query.p.replace(nconf.get('relative_path'), '');
			}

			return helpers.redirect(res, req.query.p);
		} else {
			return res.render('', {});
		}
	} else if (!req.query.pid && !req.query.tid && !req.query.cid) {
		return helpers.redirect(res, '/');
	}

	callback(null, data);
}

module.exports = plugin;
