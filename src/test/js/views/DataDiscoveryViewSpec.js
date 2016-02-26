/* jslint browser: true */
/* global jasmine, expect */

define([
	'squire',
	'jquery',
	'views/BaseView'
], function(Squire, $, BaseView) {
	"use strict";

	describe("DataDiscoveryView", function() {

		var DataDiscoveryView;
		var testView;
		var $testDiv;

		var setElNavViewSpy, renderNavViewSpy, removeNavViewSpy;

		var injector;

		beforeEach(function(done) {
			$('body').append('<div id="test-div"></div>');
			$testDiv = $('#test-div');

			setElNavViewSpy = jasmine.createSpy('setElNavViewSpy');
			renderNavViewSpy = jasmine.createSpy('renderNavViewSpy');
			removeNavViewSpy = jasmine.createSpy('removeNavViewSpy');

			injector = new Squire();
			injector.mock('views/NavView', BaseView.extend({
				setElement : setElNavViewSpy.and.returnValue({
					render : renderNavViewSpy
				}),
				render : renderNavViewSpy,
				remove : removeNavViewSpy
			}));
			injector.require(['views/DataDiscoveryView'], function(view) {
				DataDiscoveryView = view;
				done();
			});
		});

		afterEach(function() {
			injector.remove();
			if (testView.remove) {
				testView.remove();
			}
			$testDiv.remove();
		});


		describe('Tests for render', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv
				});
				testView.render();
			});

			it('Expects that the children views are rendered', function() {
				expect(setElNavViewSpy.calls.count()).toBe(2);
				expect(renderNavViewSpy.calls.count()).toBe(1);
			});
		});

		describe('Tests for remove', function() {
			beforeEach(function() {
				testView = new DataDiscoveryView({
					el : $testDiv
				});
				testView.remove();
			});

			it('Expects that the children views are removed', function() {
				expect(removeNavViewSpy.calls.count()).toBe(1);
			});
		});
	});
});