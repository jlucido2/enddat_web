/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */

define([
	'jquery',
	'leaflet',
	'views/BaseView',
	'views/MapView'
], function($, L, BaseView, MapView) {
	describe('views/MapView', function() {
		var testView;
		var $testDiv;
		var fakeServer;
		var addControlSpy, removeMapSpy;

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();

			$('body').append('<div id="test-div"><div id="test-map-div"></div></div>');
			$testDiv = $('#test-div');

			addControlSpy = jasmine.createSpy('addControlSpy');
			removeMapSpy = jasmine.createSpy('removeMapSpy');
			spyOn(L, 'map').and.returnValue({
				addControl : addControlSpy,
				remove : removeMapSpy
			});
			spyOn(L.control, 'layers').and.callThrough();

			spyOn(BaseView.prototype, 'initialize').and.callThrough();
			spyOn(BaseView.prototype, 'remove').and.callThrough();

			testView = new MapView({
				el : '#test-div',
				mapDivId : 'test-map-div'
			});
		});

		afterEach(function() {
			fakeServer.restore();
			$testDiv.remove();
		});

		it('Expects that the BaseView initialize is called', function() {
			expect(BaseView.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects that the layer switcher control is created', function() {
			expect(L.control.layers).toHaveBeenCalled();
			expect(testView.controls.length).toBe(1);
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that the map is created in the mapDiv with a single base layer', function() {
				expect(L.map).toHaveBeenCalled();
			});

			it('Expects the layer switch control to be added to the map', function() {
				expect(addControlSpy).toHaveBeenCalledWith(testView.controls[0]);
			});
		});

		describe('Tests for remove', function() {

			it('Expects the BaseView.prototype.remove to be called but not the map if the view hasn\'t been rendered', function() {
				testView.remove();
				expect(BaseView.prototype.remove).toHaveBeenCalled();
				expect(removeMapSpy).not.toHaveBeenCalled();
			});

			it('Expects the map remove to be called when the view is removed if the view has been rendered', function() {
				testView.render();
				testView.remove();
				expect(BaseView.prototype.remove).toHaveBeenCalled();
				expect(removeMapSpy).toHaveBeenCalled();
			});
		});

	});
});