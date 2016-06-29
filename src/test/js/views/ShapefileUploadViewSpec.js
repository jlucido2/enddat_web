/* jslint browser */
/* global spyOn, expect */

define([
	'squire',
	'jquery',
	'blueimp-file-upload',
	'backbone',
	'views/BaseView'
], function(Squire, $, fileupload, Backbone, BaseView) {
	"use strict";

	describe('views/ShapefileUploadView', function() {
		var ShapefileUploadView;
		var testView;
		var $testDiv;
		var testModel;
		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new Backbone.Model();

			injector = new Squire();
			injector.mock('jquery', $);
			injector.mock('blueimp-file-upload', fileupload);
			injector.mock('views/BaseView', BaseView);
			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'render').and.callThrough();

			injector.require(['views/ShapefileUploadView'], function(View) {
				ShapefileUploadView = View;
				testView = new ShapefileUploadView({
					el : $testDiv,
					model : testModel
				});

				done();
			});
		});

		afterEach(function() {
			injector.remove();
			testView.remove();
			$testDiv.remove();
		});

		it('Expects that the BaseView prototype initialize is called', function() {
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects that when the view is rendered the BaseView prototype render is called', function() {
			testView.render();

			expect(BaseView.prototype.render).toHaveBeenCalled();
		});

		describe('Tests for the file uploader set up', function() {
			beforeEach(function() {
				spyOn($.fn, 'fileupload');
				testView.render();
			});

			it('Expects that the file uploader is initialized', function() {
				expect($.fn.fileupload).toHaveBeenCalled();
			});

			it('Expects that the send procedure updates the url with the file name to be uploaded', function() {
				var sendCallback = $.fn.fileupload.calls.argsFor(0)[0].send;
				var data = {
					url : 'uploadhandler?parm1=1',
					files : [{name: 'testFile.zip'}]
				};
				sendCallback({}, data);
				expect(data.url).toEqual('uploadhandler?parm1=1&qqfile=testFile.zip');
			});

			it('Expects a successful fileupload to update the uploadedFeatureName property in the model', function() {
				var SUCCESS_RESPONSE = '<Response><store>test_layer</store><workspace>upload</workspace><name>upload:test_layer</name><success>true</success></Response>';
				var doneCallback = $.fn.fileupload.calls.argsFor(0)[0].done;
				doneCallback({}, {result : SUCCESS_RESPONSE});

				expect(testModel.get('uploadedFeatureName')).toEqual('upload:test_layer');
			});
		});
	});
});