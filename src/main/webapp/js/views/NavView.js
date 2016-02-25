define([
	'views/BaseView',
	'hbs!hb_templates/workflowNav'
], function(BaseView, hb_template) {
	"use strict";

	var view = BaseView.extend({
		template : hb_template
	});

	return view;
});


