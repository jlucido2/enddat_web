/* jslint browser: true */
/* global jasmine, expect, sinon, spyOn */

define([
	'squire',
	'jquery',
	'backbone',
	'backbone.stickit',
	'models/AOIModel',
	'views/BaseCollapsiblePanelView',
], function(Squire, $, Backbone, stickit, AOIModel, BaseCollapsiblePanelView) {
	"use strict";

	describe('views/LocationView', function() {
		var LocationView;
		var testView;
		var testModel;
		var $testDiv;
		var setElShapefileUploadViewSpy, renderShapefileUploadViewSpy, removeShapefileUploadViewSpy;
		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testModel = new Backbone.Model({
				aoi : new AOIModel({
					latitude : '',
					longitude : '',
					radius : ''
				})
			});
			testModel.set('step', testModel.SPECIFY_AOI_STEP);

			setElShapefileUploadViewSpy = jasmine.createSpy('setElShapefileUploadViewSpy');
			renderShapefileUploadViewSpy = jasmine.createSpy('renderShapefileUploadViewSpy');
			removeShapefileUploadViewSpy = jasmine.createSpy('removeShapefileUploadViewSpy');

			injector = new Squire();

			injector.mock('views/BaseCollapsiblePanelView', BaseCollapsiblePanelView);
			spyOn(BaseCollapsiblePanelView.prototype, 'initialize').and.callThrough();
			spyOn(BaseCollapsiblePanelView.prototype, 'render').and.callThrough();
			spyOn(BaseCollapsiblePanelView.prototype, 'remove').and.callThrough();

			injector.mock('backbone.stickit', stickit);

			injector.mock('views/ShapefileUploadView', Backbone.View.extend({
				setElement : setElShapefileUploadViewSpy.and.returnValue({
					render : renderShapefileUploadViewSpy
				}),
				render : renderShapefileUploadViewSpy,
				remove : removeShapefileUploadViewSpy
			}));

			injector.require(['views/LocationView'], function(View) {
				LocationView = View;

				testView = new LocationView({
					el : $testDiv,
					model : testModel,
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

		it('Expects that when the view is removed the shapefile upload view is removed and the parent class\'s remove is called', function() {
			testView.remove();

			expect(removeShapefileUploadViewSpy).toHaveBeenCalled();
			expect(BaseCollapsiblePanelView.prototype.remove).toHaveBeenCalled();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects a collapsible panel to be rendered', function() {
				var $panel = $testDiv.find('.collapsible-panel');
				expect($panel.length).toBe(1);
				expect($panel.find('.panel-heading').html()).toContain('Specify Project Location');
			});

			it('Expects that the shapefile upload view is rendered', function() {
				expect(renderShapefileUploadViewSpy).toHaveBeenCalled();
			});
		});

		describe('DOM event handler tests', function() {
			var $lat, $lng, $radius, $useLocBtn, aoiModel;
			beforeEach(function() {
				testView.render();
				$lat = $testDiv.find('#latitude');
				$lng = $testDiv.find('#longitude');
				$radius = $testDiv.find('#radius');
				$useLocBtn = $testDiv.find('.use-location-btn');
				aoiModel = testModel.get('aoi');

				spyOn(navigator.geolocation, 'getCurrentPosition');
			});

			it('Expects that changing the latitude updates the model\'s latitude property', function() {
				$lat.val('43.0').trigger('change');

				expect(aoiModel.get('latitude')).toEqual('43.0')

				$lat.val('42.0').trigger('change');

				expect(aoiModel.get('latitude')).toEqual('42.0');

				$lat.val('').trigger('change');

				expect(aoiModel.get('latitude')).toEqual('');
			});

			it('Expects that changing the longitude updates the model\'s longitude property', function() {
				$lng.val('-100.0').trigger('change');

				expect(aoiModel.get('longitude')).toEqual('-100.0');

				$lng.val('-101.0').trigger('change');

				expect(aoiModel.get('longitude')).toEqual('-101.0');

				$lng.val('').trigger('change');

				expect(aoiModel.get('longitude')).toEqual('');
			});

			it('Expects that geolocation is called if the use my location button is clicked', function() {
				$useLocBtn.trigger('click');
				expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
			});

			it('Expect that when the location button is clicked and the getCurrentPosition succeeds the model\'s location property is updated', function() {
				$useLocBtn.trigger('click');
				var successFnc = navigator.geolocation.getCurrentPosition.calls.argsFor(0)[0];
				successFnc({
					coords : {
						latitude : '43.0',
						longitude : '-100.0'
					}
				});

				expect(aoiModel.get('latitude')).toEqual('43.0');
				expect(aoiModel.get('longitude')).toEqual('-100.0');
			});

			it('Expects that changing the radius updates the model\'s radius property', function() {
				$radius.val('5').trigger('change');

				expect(aoiModel.get('radius')).toEqual('5');

				$radius.val('4').trigger('change');

				expect(aoiModel.get('radius')).toEqual('4');

				$radius.val('').trigger('change');

				expect(aoiModel.get('radius')).toEqual('');
			});
		});

		describe('Model event handlers', function() {
			var $lat, $lng, $radius, aoiModel;
			beforeEach(function() {
				testView.render();
				$lat = $testDiv.find('#latitude');
				$lng = $testDiv.find('#longitude');
				$radius = $testDiv.find('#radius');
				aoiModel = testModel.get('aoi');
			});

			it('Expects that when the model\'s latitude property is updated, the DOM is update', function() {
				aoiModel.set('latitude', '43.0');
				expect($lat.val()).toEqual('43.0');

				aoiModel.set('latitude', '44.0');
				expect($lat.val()).toEqual('44.0');

				aoiModel.set('latitude', '');
				expect($lat.val()).toEqual('');
			});

			it('Expects that when the model\'s longitude property is updated, the DOM is updated', function() {
				aoiModel.set('longitude', '-100.0');
				expect($lng.val()).toEqual('-100.0');

				aoiModel.set('longitude', '-101.0');
				expect($lng.val()).toEqual('-101.0');

				aoiModel.set('longitude', '');
				expect($lng.val()).toEqual('');
			});

			it('Expects that when then model\'s radius property is updated, the DOM is updated', function() {
				aoiModel.set('radius', '4');
				expect($radius.val()).toEqual('4');

				aoiModel.set('radius', '5');
				expect($radius.val()).toEqual('5');

				aoiModel.set('radius', '');
				expect($radius.val()).toEqual('');
			});
		});
	});
});