/* jslint browser: true */
/* global expect, spyOn */

define([
	'jquery',
	'backbone',
	'models/AOIModel',
	'views/AOIBoxView'
], function($, Backbone, AOIModel, AOIBoxView) {
	"use strict";

	describe('Tests for views/AOIBoxView', function() {
		var testView;
		var $testDiv;
		var testModel;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new Backbone.Model({
				aoi : new AOIModel({
					aoiBox : {
						south : 43.0,
						west : -101.0,
						north : 44.0,
						east : -100.0
					}
				})
			});

			testView = new AOIBoxView({
				model : testModel,
				el : $testDiv,
				opened : true
			});

			spyOn(testView, 'template').and.callThrough();
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}

			$testDiv.remove();
		});

		it('Expects that the model attributes are passed to the context when rendering the view', function() {
			testView.render();
			expect(testView.template).toHaveBeenCalledWith(testModel.get('aoi').attributes.aoiBox);
		});

		it('Expects that the template is re rendered whenevr the model is updated', function() {
			var aoiModel = testModel.get('aoi');
			testView.render();
			testView.template.calls.reset();
			aoiModel.set('aoiBox', {
				south : 43.0,
				west : -102.0,
				north : 44.0,
				east : -100.0
			});

			expect(testView.template).toHaveBeenCalledWith(aoiModel.attributes.aoiBox);

			testView.template.calls.reset();
			aoiModel.set('aoiBox', {});

			expect(testView.template).toHaveBeenCalledWith({});
		});
	});
});