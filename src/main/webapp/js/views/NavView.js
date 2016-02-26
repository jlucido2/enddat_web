define([
	'bootstrap', // Needed by the bootstrap navbar
	'views/BaseView',
	'hbs!hb_templates/workflowNav'
], function(bootstrap, BaseView, hb_template) {
	"use strict";

	var view = BaseView.extend({
		template : hb_template
	});

	return view;
});


