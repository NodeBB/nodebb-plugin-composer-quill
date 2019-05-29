'use strict';

/* globals app, $, socket, define, bootbox */

define('admin/plugins/composer-quill', ['benchpress'], function (Benchpress) {
	var ACP = {};

	ACP.init = function () {
		$('button[data-action="migrate/in"]').on('click', ACP.migrateIn);
		$('button[data-action="migrate/out"]').on('click', ACP.migrateOut);
	};

	ACP.migrateIn = function () {
		Benchpress.parse('plugins/composer-quill/modals/migrate-in', {}, function (html) {
			var start = function () {
				var modal = this;
				var progressEl = modal.find('.progress .progress-bar');
				var current = 0;
				$(modal).find('.modal-footer button').prop('disabled', true);

				socket.emit('admin.plugins.composer-quill.migrateIn', function (err, ok) {
					if (err) {
						return app.alertError(err.message);
					}

					if (ok) {
						// Close modal on migration completion
						modal.modal('hide');
					}
				});

				// Update progress bar on server notice
				socket.on('event:composer-quill.migrateUpdate', function (payload) {
					var percentage = Math.floor((payload.current / payload.total) * 100);
					if (percentage > current) {
						progressEl.css('width', percentage + '%');
						progressEl.attr('aria-valuenow', percentage);
						current = percentage;
					}
				});

				return false;
			};

			bootbox.dialog({
				title: 'Migrate Content to Quill',
				message: html,
				buttons: {
					submit: {
						label: 'Begin Migration',
						className: 'btn-primary',
						callback: start,
					},
				},
			});
		});
	};

	ACP.migrateOut = function () {
		Benchpress.parse('plugins/composer-quill/modals/migrate-out', {}, function (html) {
			var start = function () {
				var modal = this;
				var progressEl = modal.find('.progress .progress-bar');
				var current = 0;
				$(modal).find('.modal-footer button').prop('disabled', true);

				socket.emit('admin.plugins.composer-quill.migrateOut', function (err, ok) {
					if (err) {
						return app.alertError(err.message);
					}

					if (ok) {
						// Close modal on migration completion
						modal.modal('hide');
					}
				});

				// Update progress bar on server notice
				socket.on('event:composer-quill.migrateUpdate', function (payload) {
					var percentage = Math.floor((payload.current / payload.total) * 100);
					if (percentage > current) {
						progressEl.css('width', percentage + '%');
						progressEl.attr('aria-valuenow', percentage);
						current = percentage;
					}
				});

				return false;
			};

			bootbox.dialog({
				title: 'Reverse previous Quill Migration',
				message: html,
				buttons: {
					submit: {
						label: 'Begin Migration',
						className: 'btn-primary',
						callback: start,
					},
				},
			});
		});
	};

	return ACP;
});
