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
			this._createFileUploader(this.$('#shpFileInput'), this.$('.upload-msg'));
			return this;
		},

		_createFileUploader : function($fileUploaderInput, $msg) {
			var self = this;
			var params = {
					'maxfilesize': 167772160,
					'response.encoding': 'xml',
					'filename.param': 'qqfile',
					'use.crs.failover': 'true',
					'projection.policy': 'reproject'
			};
			var filename;

			$fileUploaderInput.fileupload({
				url : 'uploadhandler?' +  $.param(params),
				type: 'POST',
				dataType: 'xml',
				send : function(e, data) {
					filename = data.files[0].name;
					data.url = data.url + '&qqfile=' + filename;
					$msg.addClass('text-info').html('Upload of ' + filename + ' is in progress.');
				},
				progress : function(e, data) {
					log.debug('Upload is in progress')
				},
				done : function(e, data) {
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

						$msg.removeClass('text-info').addClass('text-success').html('Shapefile ' + filename + ' is now visible on map.')
						self.model.set('uploadedFeatureName', layerName);

					}
					else {
						var error = $resp.find('error').first().text();
						var exception = $resp.find('exception').first().text();
						$msg.removeClass('text-info').addClass('text-danger').html('Unable to upload shapefile selected with error ' + error + '. ' + exception)
					}
				},
				fail : function(e, data) {
					$msg.removeClass('text-info').addClass('text-danger').html('Upload failed');
				}
			});
		}
   });
   return view;
});