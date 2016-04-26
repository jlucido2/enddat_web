/* jslint browser: true */

define([
	'underscore',
	'Config',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/nwisData'
], function(_, Config, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector or element} $el
	 *		@prop {Backbone.Model} model - represents an NWIS site
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'NWIS Data Overview',
		panelBodyId : 'nwis-data-overview-panel-body',

		additionalEvents : {
			'click input:checkbox' : 'toggleCollectedDataVariable'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.distanceToProjectLocation = options.distanceToProjectLocation;
		},

		render : function() {
			var formatDates = function (parameter) {
				var result = _.clone(parameter);
				result.startDate = parameter.startDate.format(Config.DATE_FORMAT);
				result.endDate = parameter.endDate.format(Config.DATE_FORMAT);
				return result;
			};

			this.context.name = this.model.get('name');
			this.context.siteNo = this.model.get('siteNo');
			this.context.distance = this.distanceToProjectLocation;
			this.context.parameters = _.map(this.model.get('parameters'), formatDates);
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);

			return this;
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


