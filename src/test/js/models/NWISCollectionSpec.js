/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */

define([
	'jquery',
	'backbone',
	'models/NWISCollection'
], function($, Backbone, NWISCollection) {
	describe('models/NWISCollection', function() {
		var testCollection;

		beforeEach(function() {
			sinon.stub($, "ajax");
			testCollection = new NWISCollection();
		});

		afterEach(function() {
			$.ajax.restore();
		});

		it('Expects that two ajax calls were made', function() {
			expect($.ajax.calledTwice);
		});

		it('Expects that the collection initially empty', function() {
			expect(testCollection.length).toBe(0);
		});

		it('Expects that an ajax call is made for waterService with the correct url', function() {
			testCollection.fetch({north : 42.26833, west : -92.426775, south : 42.123607, east : -92.231428});
			expect($.ajax.calledWithMatch({url: "waterService/?format=rdb&bBox=-92.426775,42.123607,-92.231428,42.268330&outputDataTypeCd=iv,dv&hasDataTypeCd=iv,dv&siteType=OC,LK,ST,SP,AS,AT"}));
		});

		describe('Tests for hasSelectedVariables', function() {
			var variables1, variables2, variables3;

			beforeEach(function() {
				variables1 = new Backbone.Collection([{name : 'V1'}, {name : 'V2'}]);
				variables2 = new Backbone.Collection([{name : 'V3'}]);
				variables3 = new Backbone.Collection([{name : 'V4'}, {name : '5'}, {name : '6'}]);

				testCollection.reset([
					{siteNo : 'S1', variables : variables1},
					{siteNo : 'S2', variables : variables2},
					{siteNo : 'S3', variables : variables3}
				]);
			});

			it('Expects that if no selected properties are set that false is returned', function() {
				expect(testCollection.hasSelectedVariables()).toBe(false);
			});

			it('Expects that if some selected properties are defined but set to false, that false is returned', function() {
				variables1.at(1).set('selected', false);
				variables3.at(0).set('selected', false);
				variables3.at(2).set('selected', false);

				expect(testCollection.hasSelectedVariables()).toBe(false);
			});

			it('Expects that if one of the selected properties is true, that true is returned', function() {
				variables1.at(1).set('selected', false);
				variables3.at(0).set('selected', false);
				variables3.at(2).set('selected', true);

				expect(testCollection.hasSelectedVariables()).toBe(true);
			});
		});

	});
});