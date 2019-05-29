'use strict';

const async = require('async');
const util = require('util');

const batch = require.main.require('./src/batch');
const db = require.main.require('./src/database').async;

const migrator = require('./migrator');
var Sockets = module.exports;

Sockets.migrateIn = async function (socket) {
	const process = util.promisify(batch.processSortedSet);
	const numPosts = await db.sortedSetCard('posts:pid');
	let current = 0;
	await process('posts:pid', function (ids, next) {
		async.eachSeries(ids, async function (id) {
			let postData = await db.getObjectFields('post:' + id, ['content', 'quillDelta']);
			if (!postData || postData.quillDelta !== null) {
				socket.emit('event:composer-quill.migrateUpdate', {
					current: current += 1,
					total: numPosts,
				});

				return;
			}

			delete postData.quillDelta;
			postData = await migrator.toQuill(postData);
			await db.setObject('post:' + id, postData);
			socket.emit('event:composer-quill.migrateUpdate', {
				current: current += 1,
				total: numPosts,
			});
		}, next);
	}, {});

	return true;
};

Sockets.migrateOut = async function (socket) {
	const process = util.promisify(batch.processSortedSet);
	const numPosts = await db.sortedSetCard('posts:pid');
	let current = 0;
	await process('posts:pid', function (ids, next) {
		async.eachSeries(ids, async function (id) {
			let postData = await db.getObjectFields('post:' + id, ['quillBackup']);
			if (!postData || postData.quillBackup === null) {
				socket.emit('event:composer-quill.migrateUpdate', {
					current: current += 1,
					total: numPosts,
				});
				return;
			}

			postData = {
				content: postData.quillBackup,
			};
			await db.setObject('post:' + id, postData);
			await db.deleteObjectFields('post:' + id, ['quillDelta', 'quillBackup']);
			socket.emit('event:composer-quill.migrateUpdate', {
				current: current += 1,
				total: numPosts,
			});
		}, next);
	}, {});

	return true;
};
