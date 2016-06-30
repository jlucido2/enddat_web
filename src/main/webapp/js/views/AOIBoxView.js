/* jslint browser: true */

define([
	'views/BaseCollapsiblePanelView',
	'views/ShapefileUploadView',
	'hbs!hb_templates/aoiBox'
], function(BaseCollapsiblePanelView, ShapefileUploadView, hbTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {WorkflowStateModel} model
	 *		@prop {Jquery el or select} el
	 *		@prop {Boolean} opened - Set to true if the panel should initially be open
	 */
	var view = BaseCollapsiblePanelView.extend({
		template : hbTemplate,

		panelHeading : 'Specify AOI Box',
		panelBodyId : 'specify-aoi-box-panel-body',

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model.get('aoi'), 'change', this.updatePanelContents);

			this.shapefileUploadView = new ShapefileUploadView({
				el : '.shapefile-upload-div',
				model : this.model
			});
		},

		render : function() {
			this.context = this.model.get('aoi').attributes.aoiBox;
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.shapefileUploadView.setElement(this.$('.shapefile-upload-div')).render();

			return this;
		},

		remove : function() {
			this.shapefileUploadView.remove();
			BaseCollapsiblePanelView.prototype.remove.apply(this, arguments);
		},

		updatePanelContents : function() {
			//Don't want to re-render the whole panel just the contents
			this.$('.panel-body').html(this.template(this.model.get('aoi').attributes.aoiBox));
		}
	});

	return view;
});


