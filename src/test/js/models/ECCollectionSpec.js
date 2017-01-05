/* jslint browser: true */
/* global sinon, jasmine, spyOn, expect */

define([
	'models/ECCollection'
], function(ECCollection) {
	"use strict";

	describe('models/ECCollection', function() {
		var testCollection;
		var fakeServer;

		var RESPONSE = 'ID,Name / Nom,Latitude,Longitude,Prov/Terr,Timezone / Fuseau horaire\n' +
			'01AD003,"ST. FRANCIS RIVER AT OUTLET OF GLASIER LAKE",47.206610,-68.956940,NB,UTC-04:00\n' +
			'02CC010,"LITTLE WHITE RIVER BELOW BOLAND RIVER",46.581110,-82.967780,ON,UTC-05:00\n' +
			'01AD004,"SAINT JOHN RIVER AT EDMUNDSTON",47.360780,-68.324890,NB,UTC-04:00';

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			testCollection = new ECCollection([{siteId : '01A2303'}, {siteId : '02A1230'}]);
		});

		afterEach(function() {
			fakeServer.restore();
		});

		it('Expects that the collection is initialized using the array passed into the constructor', function() {
			expect(testCollection.length).toBe(2);
		});

		describe('Tests for fetch', function() {
			var successSpy, failSpy;

			beforeEach(function() {
				successSpy = jasmine.createSpy('successSpy');
				failSpy = jasmine.createSpy('failSpy');

				testCollection.fetch({
					north: 47.5,
					west: -69.0,
					south: 46.5,
					east: -68.0
				}).done(successSpy).fail(failSpy);
			});

			it('Expects that a service call is made to retrieve the EC meta data', function() {
				expect(fakeServer.requests.length).toBe(1);
				expect(fakeServer.requests[0].url).toContain('ecan');
			});

			it('Expects that the returned deferred is neither resolved or rejected until the server request returns', function() {
				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects that a failed response clears the collections and rejects the promise', function() {
				fakeServer.respondWith([500, {'Content-Type' : 'text'}, 'Internal server error']);
				fakeServer.respond();

				expect(testCollection.length).toBe(0);
				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
			});

			it('Expects that a successful response creates a model for each site within the bounding box and calls the successSpy', function() {
				var siteModel;
				fakeServer.respondWith(RESPONSE);
				fakeServer.respond();

				expect(testCollection.length).toBe(2);
				expect(successSpy).toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();

				siteModel = testCollection.find(function(model) {
					return (model.attributes.siteId === '01AD003');
				});
				expect(siteModel.attributes.lat).toEqual('47.206610');
				expect(siteModel.attributes.lon).toEqual('-68.956940');
				expect(siteModel.attributes.name).toEqual('ST. FRANCIS RIVER AT OUTLET OF GLASIER LAKE');
				expect(siteModel.attributes.prov).toEqual('NB');

				siteModel = testCollection.find(function(model) {
					return (model.attributes.siteId === '01AD004');
				});
				expect(siteModel.attributes.lat).toEqual('47.360780');
				expect(siteModel.attributes.lon).toEqual('-68.324890');
				expect(siteModel.attributes.name).toEqual('SAINT JOHN RIVER AT EDMUNDSTON');
				expect(siteModel.attributes.prov).toEqual('NB');
			});

			it('Expects that each site in the collection will contain four variables', function() {
				fakeServer.respondWith(RESPONSE);
				fakeServer.respond();

				expect(testCollection.at(0).get('variables').length).toBe(4);
				expect(testCollection.at(1).get('variables').length).toBe(4);
			});

			it('Expects that a second call to fetch with a different bounding box returns the sites in that bounding box', function() {
				var siteModel;
				fakeServer.respondWith(RESPONSE);
				fakeServer.respond();

				testCollection.fetch({
					north: 47.5,
					west: -83,
					south: 46.5,
					east: -82
				});

				expect(testCollection.length).toBe(1);
				siteModel = testCollection.at(0);
				expect(siteModel.attributes.siteId).toEqual('02CC010');
				expect(siteModel.attributes.name).toEqual('LITTLE WHITE RIVER BELOW BOLAND RIVER');
				expect(siteModel.attributes.lat).toEqual('46.581110');
				expect(siteModel.attributes.lon).toEqual('-82.967780');
				expect(siteModel.attributes.prov).toEqual('ON');
			});

			it('Expects that if no sites are in the bounding box that the collection is cleared', function() {
				fakeServer.respondWith(RESPONSE);
				fakeServer.respond();

				testCollection.fetch({
					north: 46.5,
					west: -83,
					south: 45.5,
					east: -82
				});
				expect(testCollection.length).toBe(0);
			});
		});
	});
});