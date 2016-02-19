/* jslint browser: true */

define([
	'backbone',
	'controller/AppRouter',
	'module'
], function (Backbone, Router, module) {
	"use strict";

	var router = new Router();

	Backbone.history.start({root: module.config().contextPath});

	return router;
});


