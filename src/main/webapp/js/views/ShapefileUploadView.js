/* jslint browswer: true */

define([
    'views/BaseCollapsiblePanelView',
    'hbs!hb_templates/shpfileUpload'
], function(BaseCollapsiblePanelView, hbTemplate){
	"use strict";
   var view = BaseCollapsiblePanelView.extend({
	   template: hbTemplate,
	   panelHeading: 'Upload a Shapefile',
	   panelBodyId: 'upload-shapefile-panel-body',
	   initialize: function() {
		   alert("Init alert...")
	   },
	   
	   render: function() {
		   this.context = template;
		   return this;
	   }
   });
});