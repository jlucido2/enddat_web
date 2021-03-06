/* jslint browser: true */

define([
	'backbone',
	'controller/AppRouter',
	'utils/VariableDatasetMapping',
	'module',
	'loglevel'
], function (Backbone, Router, VariableDatasetMapping, module, log) {
	"use strict";
	var config = module.config();

	if (config.development) {
		log.setLevel('debug', false);
	}
	else {
		log.setLevel('warn', false);
	}

	var router = new Router();

	var origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
	var root  = config.baseUrl.replace(origin, '');
	VariableDatasetMapping.getMappingLoadedPromise().done(function() {
		Backbone.history.start({root: root});
	});

	return router;
});


