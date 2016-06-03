/* jslint browser: true */

define([

	'views/BaseCollapsiblePanelView'
], function(BaseCollapsiblePanelView) {

	"use strict";

	/*
	 * The template specified should contain a list of the variables with a checkbox. The checkbox
	 * input should have a data-id attribute whose value is the variableModel's cid.
	 *
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector element} $el
	 *		@prop {Backbone.Model} model - represents a single ACIS site
	 *		@prop {String} distanceToProjectLocation
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : function() {
			return function(context) {
				'Replace with the template function for the panel body';
			};
		},

		panelHeading : 'Data Overview',
		panelBodyId : 'data-overview-panel-body',

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




