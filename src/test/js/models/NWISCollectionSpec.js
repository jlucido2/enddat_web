/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */

define([
	'jquery',
	'models/NWISCollection'
], function($, NWISCollection) {
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
	});
});