/* jslint browser: true */

define([
	'underscore',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/nwisData'
], function(_, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var DATE_FORMAT = 'YYYY-MM-DD';

	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'NWIS Data Overview',
		panelBodyId : 'nwis-data-overview-panel-body',

		additionalEvents : {
			'click input:checkbox' : 'toggleCollectedDataVariable'
		},

		initialize : function(options) {
			var formatDates = function (parameter) {
				var result = _.clone(parameter);
				result.startDate = parameter.startDate.format(DATE_FORMAT);
				result.endDate = parameter.endDate.format(DATE_FORMAT);
				return result;
			};

			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.context.parameters = _.map(this.model.get('parameters'), formatDates);
		},

		toggleCollectedDataVariable : function(ev) {
			var id = $(ev.target).attr('id');
			var indexToUpdate = id[id.length - 1];
			var parameters = _.clone(this.model.get('parameters'));

			parameters[indexToUpdate].selected = !parameters[indexToUpdate].selected;
			this.model.set('parameters', parameters);
		}

	});

	return view;
});


