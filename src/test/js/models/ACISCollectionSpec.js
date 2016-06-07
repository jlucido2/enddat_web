/* jslint browser: true */
/* global sinon, jasmine, spyOn, expect */

define([
	'Config',
	'models/ACISCollection'
], function(Config, ACISCollection) {
	"use strict";

	describe('models/ACISCollection', function() {
		var testCollection;
		var fakeServer;

		var ACIS_RESPONSE = JSON.stringify({
			meta : [{
				valid_daterange : [[], ['2000-01-04', '2005-01-30'], ['2002-04-06', '2005-03-30'], [], [], [], [], [], [], [], [], []],
				ll : [-89.51722, 43.08528],
				sids : ['475471 2', 'USC00475471 6', 'MDDW3 7'],
				name : 'MIDDLETON'
			}, {
				valid_daterange : [['2000-01-04', '2006-01-30'], [], [], [], [], [], [], [], [], [], [], []],
				ll : [-89.4961, 43.1022],
				sids : ['US1WIDA0002 6'],
				name : 'MIDDLETON 0.5 E'
			}]
		});

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			testCollection = new ACISCollection([
				{sid : '1234'}
			]);
		});

		afterEach(function() {
			fakeServer.restore();
		});

		it('Expects that the collection is initialized using the array passed into the constructor', function() {
			expect(testCollection.length).toBe(1);
		});

		describe('Tests for fetch', function() {
			var successSpy, failSpy;

			beforeEach(function() {
				successSpy = jasmine.createSpy('successSpy');
				failSpy = jasmine.createSpy('failSpy');

				testCollection.fetch({
					north : 42.2,
					west : -92.4,
					south : 42.1,
					east : -92.2
				}).done(successSpy).fail(failSpy);
			});

			it('Expects that a service call to retrieve the ACIS meta data for the bounding box is made', function() {
				var serviceUrl;
				expect(fakeServer.requests.length).toBe(1);
				serviceUrl = decodeURIComponent(fakeServer.requests[0].url);
				expect(serviceUrl).toContain('http:dummyservice/acis/StnMeta');
				expect(serviceUrl).toContain('bbox=-92.4,42.1,-92.2,42.2');
				expect(serviceUrl).toContain('meta=');
				expect(serviceUrl).toContain('elems=');
			});

			it('Expects that the returned deferred is neither resolved or rejected until the service request returns', function() {
				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects that a failed response clears the collection and rejects the promise', function() {
				fakeServer.respondWith([500, {'Content-Type' : 'text'}, 'Internal server error']);
				fakeServer.respond();

				expect(testCollection.length).toBe(0);
				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
			});

			it('Expects that a successful response creates a model for each station in the response', function() {
				fakeServer.respondWith([200, {'Content-Type' : 'application/json'}, ACIS_RESPONSE]);
				fakeServer.respond();

				expect(testCollection.length).toBe(2);
				expect(testCollection.find(function(model) {
					return (model.attributes.sid === '475471') &&
						(model.attributes.lat === 43.08528) &&
						(model.attributes.lon === -89.51722) &&
						(model.attributes.name === 'MIDDLETON');
				})).toBeDefined();
				expect(testCollection.find(function(model) {
					return (model.attributes.sid === 'US1WIDA0002') &&
						(model.attributes.lat === 43.1022) &&
						(model.attributes.lon === -89.4961) &&
						(model.attributes.name === 'MIDDLETON 0.5 E');
				})).toBeDefined();
			});

			it('Expects that the variables are parsed for each model created', function() {
				var vars1, vars2;
				fakeServer.respondWith([200, {'Content-Type' : 'application/json'}, ACIS_RESPONSE]);
				fakeServer.respond();

				vars1 = testCollection.find(function(model) {
					 return (model.attributes.sid === '475471');
				}).attributes.variables;
				vars2 = testCollection.find(function(model) {
					return (model.attributes.sid === 'US1WIDA0002');
				}).attributes.variables;

				expect(vars1.length).toBe(2);
				expect(vars1.find(function(model) {
					return (model.attributes.code === 'mint') &&
						(model.attributes.startDate.format(Config.DATE_FORMAT) === '2000-01-04') &&
						(model.attributes.endDate.format(Config.DATE_FORMAT) === '2005-01-30');
				})).toBeDefined();
				expect(vars1.find(function(model) {
					return (model.attributes.code === 'avgt') &&
						(model.attributes.startDate.format(Config.DATE_FORMAT) === '2002-04-06') &&
						(model.attributes.endDate.format(Config.DATE_FORMAT) === '2005-03-30');
				})).toBeDefined();
				expect(vars2.length).toBe(1);
				expect(vars2.find(function(model) {
					return (model.attributes.code === 'maxt') &&
						(model.attributes.startDate.format(Config.DATE_FORMAT) === '2000-01-04') &&
						(model.attributes.endDate.format(Config.DATE_FORMAT) === '2006-01-30');
				})).toBeDefined();
			});

			it('Expects a successful response to resolve the fetch', function() {
				fakeServer.respondWith([200, {'Content-Type' : 'application/json'}, ACIS_RESPONSE]);
				fakeServer.respond();

				expect(successSpy).toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
			});
		});
	});
});

