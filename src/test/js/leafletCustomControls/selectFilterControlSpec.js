/* jslint browser */
/* global expect, jasmine */

define([
	'jquery',
	'underscore',
	'leaflet',
	'leafletCustomControls/selectFilterControl'
], function($, _, L, selectFilterControl) {
	"use strict";
	describe('leafletCustomControls/selectFilterControl', function() {
		var $testDiv;
		var testMap;
		var testControl;
		var testOptions;

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');
			testMap = L.map('test-div', {
				center : [43.0, -100.0],
				zoom : 13
			});

			testOptions = [
				{id : 'id1', text : 'Option 1'},
				{id : 'id2', text : 'Option 2'},
				{id : 'id3', text : 'Option 3'}
			];
		});

		afterEach(function() {
			testMap.remove();
			$testDiv.remove();
		});

		it('Expects that creating a selectFilter and adding to the map adds a select widget with options', function() {
			var $options;
			testControl = selectFilterControl({
				filterOptions : testOptions
			});
			testMap.addControl(testControl);

			expect($testDiv.find('select').length).toBe(1);
			$options = $testDiv.find('select option');
			_.each(testOptions, function(opt, index) {
				expect($($options[index]).val()).toEqual(opt.id);
				expect($($options[index]).html()).toEqual(opt.text);
			});
		});

		it('Expects that if a selectFilter is created with a tooltip option that it has this tooltip', function() {
			testControl = selectFilterControl({
				filterOptions : testOptions,
				tooltip : 'This is a tooltip'
			});
			testMap.addControl(testControl);

			expect($testDiv.find('select').attr('title')).toEqual('This is a tooltip');
		});

		it('Expects that a selectFilter created with an initialValue option has this as its value', function() {
			testControl = selectFilterControl({
				filterOptions : testOptions,
				initialValue : 'id2'
			});
			testMap.addControl(testControl);

			expect($testDiv.find('select').val()).toEqual('id2');
		});

		it('Expects that a selectFilter that is removed is no longer on the map', function() {
			testControl = selectFilterControl({
				filterOptions : testOptions
			});
			testMap.addControl(testControl);
			testMap.removeControl(testControl);

			expect($testDiv.find('select').length).toBe(0);
		});

		it('Expects that a call to getValue returns the value of the select', function() {
			testControl = selectFilterControl({
				filterOptions : testOptions,
				initialValue : 'id2'
			});
			testMap.addControl(testControl);

			expect(testControl.getValue()).toEqual('id2');
		});

		it('Expects that a call to setValue changes the value of the select', function() {
			testControl = selectFilterControl({
				filterOptions : testOptions,
				initialValue : 'id2'
			});
			testMap.addControl(testControl);
			testControl.setValue('id3');

			expect($testDiv.find('select').val()).toEqual('id3');
		});

		it('Expects that a call to updateFilterOptions updates the control\'s options', function() {
			var newOptions = [
				{id : 'id4', text : 'Text 4'},
				{id : 'id5', text : 'Text 5'}
			];
			var $options;

			testControl = selectFilterControl({
				filterOptions : testOptions
			});
			testMap.addControl(testControl);
			testControl.updateFilterOptions(newOptions);
			$options = $testDiv.find('select option');

			_.each(newOptions, function(opt, index) {
				expect($($options[index]).val()).toEqual(opt.id);
				expect($($options[index]).html()).toEqual(opt.text);
			});
		});

		it('Expects that changing the select value calls the changeHandler', function() {
			var event = document.createEvent('HTMLEvents');
			var controlHeader;
			var changeHandlerSpy = jasmine.createSpy('changeHandlerSpy');
			testControl = selectFilterControl({
				filterOptions : testOptions,
				changeHandler : changeHandlerSpy
			});
			testMap.addControl(testControl);

			controlHeader = document.getElementsByClassName('leaflet-filter-picker')[0];
			event.initEvent('change', true, false);
			controlHeader.dispatchEvent(event);

			expect(changeHandlerSpy).toHaveBeenCalled();
		});
	});

});