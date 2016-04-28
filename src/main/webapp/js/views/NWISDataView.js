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
	 *		@prop {String} distanceToProjectLocation
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
			this.model.get('variables').each(function(variableModel) {
				this.listenTo(variableModel, 'change:selected', this.updateSelectedCheckbox);
			}, this);
		},

		render : function() {
			var formatDates = function (variableModel) {
				var result = _.clone(variableModel.attributes);
				result.startDate = variableModel.attributes.startDate.format(Config.DATE_FORMAT);
				result.endDate = variableModel.attributes.endDate.format(Config.DATE_FORMAT);
				result.id = variableModel.cid;
				return result;
			};

			this.context.name = this.model.get('name');
			this.context.siteNo = this.model.get('siteNo');
			this.context.distance = this.distanceToProjectLocation;
			this.context.variables = this.model.get('variables').map(formatDates);

			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);

			return this;
		},

		toggleCollectedDataVariable : function(ev) {
			var id = $(ev.target).data('id');
			var variableModelToUpdate = this.model.get('variables').get(id);

			variableModelToUpdate.set('selected', !variableModelToUpdate.attributes.selected);
		},

		updateSelectedCheckbox : function(variableModel) {
			var $checkbox = this.$('input[data-id="' + variableModel.cid + '"]');
			$checkbox.prop('checked', variableModel.has('selected') && variableModel.get('selected'));
		}

	});

	return view;
});


