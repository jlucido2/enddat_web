/* jslint browser: true */


define([
    'underscore',
    'jquery',
    'jquery-ui',
    'jquery.ui.widget',
    'blueimp-file-upload',
    'module',
    'loglevel',
    'views/BaseCollapsiblePanelView',
    'hbs!hb_templates/shpfileUpload'
], function(_, $, ju, juw, bfu, module, log, BaseCollapsiblePanelView, hbTemplate){
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
			log.info($('#shpFileInput'));
			this._createFileUploader($('#shpFileInput'));
			return this;
		},

		updatePanelContents : function() {
			//Don't want to re-render the whole panel just the contents
			this.$('.panel-body').html(this.template(this.model.attributes.aoiBox));
		},
		
		_createFileUploader : function($fileUploaderInput
				//$uploadIndicator
				) {
			log.info('in create file uploader');
			var self = this;
			var params = {
					'maxfilesize': 167772160,
					'response.encoding': 'xml',
					'filename.param': 'qqfile',
					'use.crs.failover': 'true',
					'projection.policy': 'reproject'
			};
			$fileUploaderInput.fileupload({
				url : 'uploadhandler?' +  $.param(params),
				type: 'POST',
				dataType: 'xml',
				send : function(e, data) {
					data.url = data.url + '&qqfile=' + data.files[0].name;
					log.info('Data URL: ' + data.url);
				},
				done : function(e, data) {
					//$uploadIndicator.hide();
					var $resp = $(data.result);
					log.info($resp);
					// Determine if the response indicated an error
					var success = $resp.find('success').first().text();
					if (success === 'true') {
						log.info('Upload Successful!')

					}
					else {
						var error = $resp.find('error').first().text();
						var exception = $resp.find('exception').first().text();
						log.info('Success reported as false with this message: ' + exception);
					}

				},
				fail : function(e, data) {
					//$uploadIndicator.hide();
					log.warn('Upload failed');
				}
			});
		}
   });
   return view;
});