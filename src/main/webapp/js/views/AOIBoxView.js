/* jslint browser: true */

define([
	'underscore',
	'views/BaseCollapsiblePanelView',
	'views/ShapefileUploadView',
	'hbs!hb_templates/aoiBox'
], function(_, BaseCollapsiblePanelView, ShapefileUploadView, hbTemplate) {
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

		panelHeading : 'Specify Area of Interest by Bounding Box',
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
			var aoiBox = this.model.get('aoi').get('aoiBox');
			var $southwest = this.$('.southwest-input');
			var $northeast = this.$('.northeast-input');
			if (_.has(aoiBox, 'south') && _.has(aoiBox, 'west')) {
				$southwest.val(aoiBox.south + ', ' + aoiBox.west);
			}
			else {
				$southwest.val('');
			}
			if (_.has(aoiBox, 'north') && _.has(aoiBox, 'east')) {
				$northeast.val(aoiBox.north + ', ' + aoiBox.east);
			}
			else {
				$northeast.val('');
			}
		}
	});

	return view;
});


