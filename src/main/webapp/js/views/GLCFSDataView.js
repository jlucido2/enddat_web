/* jslint browser: true */

define([
	'underscore',
	'Config',
	'views/BaseDataView',
	'hbs!hb_templates/glcfsData'
], function(_, Config, BaseDataView, hbTemplate) {

	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector element} $el
	 *		@prop {Backbone.Model} model - represents a single GLCFS site
	 *		@prop {String} distanceToProjectLocation
	 */
	var view = BaseDataView.extend({
		template : hbTemplate,

		panelHeading : 'GLCFS Data Overview',
		panelBodyId : 'glcfs-data-overview-panel-body',

		render : function() {

			var getContextForVariable = function(variableModel) {
				var result = _.clone(variableModel.attributes);
				result.startDate = variableModel.attributes.startDate.format(Config.DATE_FORMAT);
				result.endDate = variableModel.attributes.endDate.format(Config.DATE_FORMAT);
				result.id = variableModel.cid;
				return result;
			};

			this.context.lat = this.model.get('lat');
			this.context.lon = this.model.get('lon');
			this.context.distance = this.distanceToProjectLocation;
			this.context.variables = this.model.get('variables').map(getContextForVariable);

			BaseDataView.prototype.render.apply(this, arguments);

			return this;
		}
	});

	return view;
});