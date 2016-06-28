/* jslint browser: true */


define([
    'underscore',
    'jquery',
    'jquery-ui',
    'blueimp-file-upload',
    'module',
    'loglevel',
    'views/BaseView',
    'hbs!hb_templates/shpfileUpload'
], function(_, $, ju, bfu, module, log, BaseView, hbTemplate){
	"use strict";

   var view = BaseView.extend({
	   template: hbTemplate,

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.listenTo(this.model, 'change', this.updatePanelContents);
		},

		render : function() {
			BaseView.prototype.render.apply(this, arguments);
			this._createFileUploader(this.$('#shpFileInput'), this.$('.file-uploader-indicator'), this.$('.upload-msg'));
			return this;
		},

		_createFileUploader : function($fileUploaderInput, $uploadIndicator, $msg) {
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
					$uploadIndicator.show();
				},
				done : function(e, data) {
					$uploadIndicator.hide();
					var $resp = $(data.result);
					// Determine if the response indicated an error
					var success = $resp.find('success').first().text();
					if (success === 'true') {
						var warning = $resp.find('warning').first().text();
						var layerName = $resp.find('name').first().text();
						if (warning) {
							log.debug('Upload succeeded with warning: ' + warning);
						}
						else {
							log.debug('Upload Successful!');
						}

						self.model.set('uploadedFeatureName', layerName);

					}
					else {
						var error = $resp.find('error').first().text();
						var exception = $resp.find('exception').first().text();
						$msg.html('Unable to upload shapefile selected with error ' + error + '. ' + exception)
					}

				},
				fail : function(e, data) {
					$uploadIndicator.hide();
					$msg.html('Upload failed');
				}
			});
		}
   });
   return view;
});