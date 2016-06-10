/* jslint browswer: true */

define([
    'underscore',
    'views/BaseCollapsiblePanelView',
    'hbs!hb_templates/shpfileUpload'
], function(_, BaseCollapsiblePanelView, hbTemplate){
	"use strict";
   var view = BaseCollapsiblePanelView.extend({
	   template: hbTemplate,
	   panelHeading: 'Upload a Shapefile',
	   panelBodyId: 'upload-shapefile-panel-body',
	   
		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change', this.updatePanelContents);
		},

		render : function() {
			this.context = this.model.attributes.aoiBox;
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			return this;
		},

		updatePanelContents : function() {
			//Don't want to re-render the whole panel just the contents
			this.$('.panel-body').html(this.template(this.model.attributes.aoiBox));
		}
   });
   return view;
});