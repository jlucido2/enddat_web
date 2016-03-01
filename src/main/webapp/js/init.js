/* jslint browser: true */

define([
	'backbone',
	'controller/AppRouter',
	'module',
	'loglevel'
], function (Backbone, Router, module, log) {
	"use strict";
	var config = module.config();

	if (config.development) {
		log.setLevel('debug', false);
	}
	else {
		log.setLevel('warn', false);
	}

	var router = new Router();

	Backbone.history.start({root: config.contextPath});

	return router;
});


