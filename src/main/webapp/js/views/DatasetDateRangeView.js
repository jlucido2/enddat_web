/* jslint browser: true */

define([
	'moment',
	'bootstrap-datetimepicker',
	'views/BaseView',
	'hbs!hb_templates/dateRange.hbs'
], function(moment, datetimepicker, BaseView, hbTemplate) {

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Backbone.Model} model
	 *		@prop {Jquery selector} el - This is where the view will be rendered.
	 */
	var dateRangeView = BaseView.extend({

		template : hbTemplate,

		events : {
			// To set the model value from a datetimepicker, handle the event of the input's div
			'dp.change #start-date-div' : 'changeStartDate',
			'dp.change #end-date-div' : 'changeEndDate'
		},

		render : function() {
			BaseView.prototype.render(this, arguments);


			return this;
		}
	});

	return dateRangeView;
});


