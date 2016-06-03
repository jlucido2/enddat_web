/* jslint browser: true */

define([
	'underscore',
	'Config',
	'views/BaseDataView',
	'hbs!hb_templates/nwisData'
], function(_, Config, BaseDataView, hbTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector or element} $el
	 *		@prop {Backbone.Model} model - represents an NWIS site
	 *		@prop {String} distanceToProjectLocation
	 */
	var view = BaseDataView.extend({
		template : hbTemplate,

		panelHeading : 'NWIS Data Overview',
		panelBodyId : 'nwis-data-overview-panel-body',

		render : function() {
			var getContextForVariable = function (variableModel) {
				var result = _.clone(variableModel.attributes);
				result.startDate = variableModel.attributes.startDate.format(Config.DATE_FORMAT);
				result.endDate = variableModel.attributes.endDate.format(Config.DATE_FORMAT);
				result.id = variableModel.cid;
				return result;
			};

			this.context.name = this.model.get('name');
			this.context.siteNo = this.model.get('siteNo');
			this.context.distance = this.distanceToProjectLocation;
			this.context.variables = this.model.get('variables').map(getContextForVariable);

			BaseDataView.prototype.render.apply(this, arguments);

			return this;
		}
	});

	return view;
});


