/* jslint browser: true */
/* global expect, spyOn, jasmine */

define([
	'squire',
	'jquery',
	'backbone',
	'models/AOIModel',
	'views/BaseCollapsiblePanelView'
], function(Squire, $, Backbone, AOIModel, BaseCollapsiblePanelView) {
	"use strict";

	describe('Tests for views/AOIBoxView', function() {
		var AOIBoxView;
		var testView;
		var $testDiv;
		var testModel;
		var setElShapefileUploadViewSpy, renderShapefileUploadViewSpy, removeShapefileUploadViewSpy;
		var injector;

		beforeEach(function(done) {
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

			setElShapefileUploadViewSpy = jasmine.createSpy('setElShapefileUploadViewSpy');
			renderShapefileUploadViewSpy = jasmine.createSpy('renderShapefileUploadViewSpy');
			removeShapefileUploadViewSpy = jasmine.createSpy('removeShapefileUploadViewSpy');

			injector = new Squire();

			injector.mock('views/BaseCollapsiblePanelView', BaseCollapsiblePanelView);
			spyOn(BaseCollapsiblePanelView.prototype, 'initialize').and.callThrough();
			spyOn(BaseCollapsiblePanelView.prototype, 'render').and.callThrough();
			spyOn(BaseCollapsiblePanelView.prototype, 'remove').and.callThrough();

			injector.mock('views/ShapefileUploadView', Backbone.View.extend({
				setElement : setElShapefileUploadViewSpy.and.returnValue({
					render : renderShapefileUploadViewSpy
				}),
				render : renderShapefileUploadViewSpy,
				remove : removeShapefileUploadViewSpy
			}));

			injector.require(['views/AOIBoxView'], function(View) {
				AOIBoxView = View;
				testView = new AOIBoxView({
					model : testModel,
					el : $testDiv,
					opened : true
				});
				done();
			});
		});

		afterEach(function() {
			injector.remove();
			if (testView) {
				testView.remove();
			}

			$testDiv.remove();
		});

		it('Expects that a shapefileUploadView is created', function() {
			expect(setElShapefileUploadViewSpy).toHaveBeenCalled();
		});

		it('Expects that the model attributes are passed to the context when rendering the view', function() {
			spyOn(testView, 'template').and.callThrough();
			testView.render();

			expect(testView.template).toHaveBeenCalledWith(testModel.get('aoi').attributes.aoiBox);
		});

		it('Expects that the shapefile upload view is rendered when the view is rendered', function() {
			renderShapefileUploadViewSpy.calls.reset();
			testView.render();

			expect(renderShapefileUploadViewSpy).toHaveBeenCalled();
		});

		it('Expects that the template is re rendered whenever the model is updated', function() {
			var aoiModel = testModel.get('aoi');
						spyOn(testView, 'template').and.callThrough();

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

		it('Expects that when the view is removed the shapefile upload view is removed and the parent class\'s remove is called', function() {
			testView.remove();

			expect(removeShapefileUploadViewSpy).toHaveBeenCalled();
			expect(BaseCollapsiblePanelView.prototype.remove).toHaveBeenCalled();
		});
	});
});