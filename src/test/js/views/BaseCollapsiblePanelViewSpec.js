/* jslint browser: true */
/* global jasmine, expect */

define([
	'jquery',
	'handlebars',
	'views/BaseCollapsiblePanelView'
], function ($, Handlebars, BaseCollapsiblePanelView) {
	"use strict";

	var TestPanelView, testView;
	var $testDiv;
	var testButtonClickSpy;

	describe('BaseCollapsiblePanelView', function() {

		beforeEach(function() {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			testButtonClickSpy = jasmine.createSpy('testButtonClick');
			TestPanelView = BaseCollapsiblePanelView.extend({
				additionalEvents : {
					'click .test-button' : 'testButtonClick'
				},
				template : Handlebars.compile('<button class="test-button">{{buttonName}}</button>'),

				panelHeading : 'Test Panel Heading',
				panelBodyId : 'test-panel-body',

				testButtonClick : testButtonClickSpy
			});

			testView = new TestPanelView({
				el : $testDiv,
				context : {
					buttonName : 'Test Button Name'
				}
			});
		});

		afterEach(function() {
			if (testView) {
				testView.remove();
			}
			$testDiv.remove();
		});

		describe('Tests for render', function() {
			beforeEach(function() {
				testView.render();
			});

			it('Expects that a collapsible bootstrap panel is created within the view\'s el', function() {
				expect($testDiv.find('.panel').length).toBe(1);
				expect($testDiv.find('.panel .panel-heading').length).toBe(1);
				expect($testDiv.find('.panel .panel-body').length).toBe(1);
				expect($testDiv.find('.panel-body').hasClass('collapse')).toBe(true);
			});

			it('Expects that the panel heading contains the panelHeading attribute', function() {
				expect($testDiv.find('.panel-heading').html()).toContain(testView.panelHeading);
			});

			it('Expects that the view\'s template property is used to generate the markup for the panel body, using the context passed into the instantiation function', function() {
				expect($testDiv.find('.panel-body').html()).toEqual('<button class="test-button">Test Button Name</button>');
			});
		});

		describe('Tests for toggling the collapse icon', function() {
			var $toggle, $collapseBtn, $expandBtn;
			beforeEach(function() {
				testView.render();
				$toggle = $testDiv.find('.collapse-btn');
				$collapseBtn = $testDiv.find('.collapse-icon');
				$expandBtn = $testDiv.find('.expand-icon');
			});
			it('Expects that clicking the collapse/expand toggle toggles the icon that is visible', function() {
				$collapseBtn.hide();
				$toggle.trigger('click');
				expect($collapseBtn.is(':visible')).toBe(true);
				expect($expandBtn.is(':visible')).toBe(false);

				$toggle.trigger('click');
				expect($collapseBtn.is(':visible')).toBe(false);
				expect($expandBtn.is(':visible')).toBe(true);
			});
		});

		describe('Tests for adding additionalEvents to the view', function() {
			it('Expects that if the button is clicked that its event handler is called', function() {
				testView.render();
				$testDiv.find('.test-button').trigger('click');
				expect(testButtonClickSpy).toHaveBeenCalled();
			});
		});
	});
});