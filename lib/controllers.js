'use strict';

var Controllers = module.exports;

Controllers.renderAdminPage = function (req, res, next) {
	var quill = module.parent.exports;

	quill.checkCompatibility(function (err, checks) {
		if (err) {
			return next(err);
		}

		res.render('admin/plugins/composer-quill', {
			title: 'Quill Composer',
			checks: checks,
		});
	});
};
