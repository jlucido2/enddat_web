/* jslint browser */
/* global expect, sinon */

define([
	'jquery',
	'underscore',
	'leaflet',
	'Config',
	'leafletCustomControls/legendControl'
], function($, _, L, Config, legendControl) {
	describe('leafletCustomControls/legendControl', function() {
		var $testDiv;
		var testMap;
		var testControl;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			testMap = L.map('test-div', {
				center : [43.0, -100.0],
				zoom : 13
			});

		});

		afterEach(function() {
			$testDiv.remove();
		});

		it('Expects that when the control is added to the map, the control is created containing the project\'s icons', function() {
			testControl = legendControl({opened : true});
			testMap.addControl(testControl);

			expect($testDiv.find('.leaflet-legend-div').length).toBe(1);
			expect($testDiv.find('.leaflet-legend-body .proj-location-icon').attr('src')).toEqual(Config.PROJ_LOC_ICON_URL);
			_.each(Config.DATASET_ICON, function(value, key) {
				expect($testDiv.find('.leaflet-legend-body .' + key + '-icon').attr('src')).toEqual(value.iconUrl);
			});
		});

		it('Expects that when the control has been created with opened set to true the control will be fully visible', function() {
			testControl = legendControl({opened : true});
			testMap.addControl(testControl);

			expect($testDiv.find('.leaflet-legend-body').is(':visible')).toBe(true);
		});

		it('Expects that when the control has been created with opened set to false the control \'s body will not be visible', function() {
			testControl = legendControl({opened : false});
			testMap.addControl(testControl);

			expect($testDiv.find('.leaflet-legend-body').is(':visible')).toBe(false);
		});

		it('Expects that calling setVisibility with expanded set to true when the panel is collapsed will show the full control', function() {
			testControl = legendControl({opened : false});
			testMap.addControl(testControl);
			testControl.setVisibility(true);

			expect($testDiv.find('.leaflet-legend-body').is(':visible')).toBe(true);
		});

		it('Expects that calling setVisibility with expanded set to false when the panel is expanded will hide the control\'s body', function() {
			testControl = legendControl({opened : true});
			testMap.addControl(testControl);
			testControl.setVisibility(false);

			expect($testDiv.find('.leaflet-legend-body').is(':visible')).toBe(false);
		});

		it('Expects that clicking on the control\'s header toggles the control\s visibility', function() {
			var event = document.createEvent('HTMLEvents');
			var controlHeader;
			testControl = legendControl({opened : true});
			testMap.addControl(testControl);
			controlHeader = document.getElementsByClassName('leaflet-legend-panel-header')[0];
			event.initEvent('click', true, false);
			controlHeader.dispatchEvent(event);

			expect($testDiv.find('.leaflet-legend-body').is(':visible')).toBe(false);

			controlHeader.dispatchEvent(event);
			expect($testDiv.find('.leaflet-legend-body').is(':visible')).toBe(true);
		});
	});
});