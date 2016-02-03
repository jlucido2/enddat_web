/*jslint browser: true */
/*global Backbone*/

var ENDDAT = ENDDAT || {};

$(document).ready(function() {
	"use strict";
	// Preload all templates and partials
	var TEMPLATES = [
		'home'
	];

	var PARTIALS = [
		'warningModal'
	];

	ENDDAT.templates = ENDDAT.util.templateLoader();

	var loadTemplates = ENDDAT.templates.loadTemplates(TEMPLATES);
	var loadPartials = ENDDAT.templates.registerPartials(PARTIALS);

	$.when(loadTemplates, loadPartials).always(function() {
		ENDDAT.router = new ENDDAT.controller.ENDDATRouter();
		Backbone.history.start();
	});
});


