/* jslint browser: true */
/* global spyOn, jasmine, expect, sinon */

define([
	'underscore',
	'Config',
	'models/NWISCollection'
], function(_, Config, NWISCollection) {
	describe('models/NWISCollection', function() {
		var fakeServer;
		var testCollection;

		var PM_CODES = '# Date Retrieved: 2016-05-31 14:19:19 EDT\n' +
			'#\n' +
			'parameter_cd\tparameter_nm\n' +
			'5s\t170s\n' +
			'00004\tStream width, feet\n' +
			'00010\tTemperature, water, degrees Celsius\n' +
			'00011\tTemperature, water, degrees Fahrenheit';

		var STAT_CODES = '# Date Retrieved: USGS Water Data for the Nation Help System\n' +
			'#\n' +
			'stat_CD\tstat_NM\tstat_DS\n' +
			'5s\t19s\t34s\n' +
			'00001\tMAXIMUM\tMAXIMUM VALUES\n' +
			'00002\tMINIMUM\tMINIMUM VALUES\n' +
			'00012\tEQUIVALENT MEAN\tEQUIVALENT MEAN VALUES';

		var SITE_INFO = '#\n' +
			'agency_cd\tsite_no\tstation_nm\tsite_tp_cd\tdec_lat_va\tdec_long_va\tcoord_acy_cd\tdec_coord_datum_cd\talt_va\talt_acy_va\talt_datum_cd\thuc_cd\tdata_type_cd\tparm_cd\tstat_cd\tdd_nu\tloc_web_ds\tmedium_grp_cd\tparm_grp_cd\tsrs_id\taccess_cd\tbegin_date\tend_date\tcount_nu\n' +
			'5s\t19s\t34s\n' +
			'USGS\t05427945\tS FK PHEASANT BRANCH AT HWY 14 NEAR MIDDLETON, WI\tST\t43.0966617\t-89.5284545\tS\tNAD83\t\t\t\t\tdv\t80154\t00003\t2\t\twat\t\t17164666\t0t1977-10-01\t1981-09-30\t1409\n' +
			'USGS\t05427945\tS FK PHEASANT BRANCH AT HWY 14 NEAR MIDDLETON, WI\tST\t43.0966617\t-89.5284545\tS\tNAD83\t\t\t\t\tdv\t80155\t00003\t3\t\twat\t\t17164591\t0\t1977-10-01\t1991-09-30\t1409\n' +
			'USGS\t05427946\tESSER\'S POND AT MIDDLETON, WI\tLK\t43.09277297\t-89.52289889\tS\tNAD83\t925.48\t.01\tNGVD29\t07090001\tdv\t00065\t00003\t1\t\twat\t\t17164583\t0\t1981-10-20\t1982-11-05\t30';

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			testCollection = new NWISCollection([
				{siteNo : '12345'}
			]);
		});

		afterEach(function() {
			fakeServer.restore();
		});

		it('Expects that the parameter codes and statistic codes are fetched at initialization', function() {
			expect(fakeServer.requests.length).toBe(2);
			expect(_.find(fakeServer.requests, function(request) {
				return request.url.includes('http:dummyservice/nwis/info/pmcodes');
			})).toBeDefined();
			expect(_.find(fakeServer.requests, function(request) {
				return request.url.includes('stcodes/?fmt=rdb');
			})).toBeDefined();
		});

		it('Expects that a successful parameter codes call sets the parameterCodes object values', function() {
			fakeServer.respondWith(/http:dummyservice\/nwis\/info\/pmcodes/, [200, {'Content-Type' : 'text'}, PM_CODES]);
			fakeServer.respond();

			expect(testCollection.parameterCodes).toBeDefined();
			expect(testCollection.parameterCodes['00004']).toEqual('Stream width, feet');
			expect(testCollection.parameterCodes['00010']).toEqual('Temperature, water, degrees Celsius');
			expect(testCollection.parameterCodes['00011']).toEqual('Temperature, water, degrees Fahrenheit');
		});

		it('Expects that a failed parameter codes call sets the parameterCodes to be undefined', function() {
			fakeServer.respondWith(/http:dummyservice\/nwis\/info\/pmcodes/, [500, {'Content-Type' : 'text'}, 'Internal servier error']);
			fakeServer.respond();

			expect(testCollection.parameterCodes).toBeUndefined();
		});

		it('Expects that a successful statistics codes call set the statisticCodes object values', function() {
			fakeServer.respondWith('stcodes/?fmt=rdb', [200, {'Content-Type' : 'text'}, STAT_CODES]);
			fakeServer.respond();

			expect(testCollection.statisticCodes).toBeDefined();
			expect(testCollection.statisticCodes['00001']).toEqual('Maximum');
			expect(testCollection.statisticCodes['00002']).toEqual('Minimum');
			expect(testCollection.statisticCodes['00012']).toEqual('Equivalent Mean');
		});

		it('Expects that a failed statistic codes ste the statisticCOdes to undefined', function() {
			fakeServer.respondWith('stcodes/?fmt=rdb', [500, {'Content-Type' :'text'}, 'Internal server error']);
			fakeServer.respond();

			expect(testCollection.parameterCodes).toBeUndefined();
		});

		describe('Tests for fetch', function() {

			var successSpy, failSpy;

			beforeEach(function() {
				successSpy = jasmine.createSpy('successSpy');
				failSpy = jasmine.createSpy('failSpy');

				fakeServer.respondWith(/http:dummyservice\/nwis\/info\/pmcodes/, [200, {'Content-Type' : 'text'}, PM_CODES]);
				fakeServer.respondWith('stcodes/?fmt=rdb', [200, {'Content-Type' : 'text'}, STAT_CODES]);
				fakeServer.respond();

				testCollection.fetch({
					north : 42.2,
					west : -92.4,
					south : 42.1,
					east : -92.2
				}).done(successSpy).fail(failSpy);
			});

			it('Expects that a service call is made to waterService with the bounding box specified', function() {
				expect(fakeServer.requests.length).toBe(3);
				expect(fakeServer.requests[2].url).toContain('waterService');
				expect(fakeServer.requests[2].url).toContain('bBox=-92.400000,42.100000,-92.200000,42.200000');
			});

			it('Expects that the returned deferred is neither resolved or rejected until the service request returns', function() {
				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects that a failed response clears the collection and reects the promise', function() {
				expect(testCollection.length).toBe(1);

				fakeServer.respondWith(/waterService/, [500, {'Content-Type' : 'text'}, 'Internal server error']);
				fakeServer.respond();

				expect(testCollection.length).toBe(0);
				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
			});

			it('Expects that a 404 response clears the collection and resolves the promise', function() {
				fakeServer.respondWith(/waterService/, [404, {'Content-Type' : 'text'}, '']);
				fakeServer.respond();

				expect(testCollection.length).toBe(0);
				expect(successSpy).toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
			});

			it('Expects a successful response to create a model in the collection for each unique site', function() {
				fakeServer.respondWith(/waterService/, [200, {'Content-Type' : 'text'}, SITE_INFO]);
				fakeServer.respond();

				expect(testCollection.length).toBe(2);
				expect(testCollection.find(function(model) {
					return model.attributes.siteNo === '05427945';
				})).toBeDefined();
				expect(testCollection.find(function(model) {
					return model.attributes.siteNo === '05427946';
				})).toBeDefined();
			});

			it('Expects a successful response to parse the sites values', function() {
				var result;
				fakeServer.respondWith(/waterService/, [200, {'Content-Type' : 'text'}, SITE_INFO]);
				fakeServer.respond();
				result = testCollection.find(function(model) {
					return model.attributes.siteNo === '05427945';
				});

				expect(result.attributes.name).toEqual('S FK PHEASANT BRANCH AT HWY 14 NEAR MIDDLETON, WI');
				expect(result.attributes.lat).toEqual('43.0966617');
				expect(result.attributes.lon).toEqual('-89.5284545');
			});

			it('Expects the start and end date properties to be the union of the variables start and end date', function() {
				var result;
				fakeServer.respondWith(/waterService/, [200, {'Content-Type' : 'text'}, SITE_INFO]);
				fakeServer.respond();
				result = testCollection.find(function(model) {
					return model.attributes.siteNo === '05427945';
				});

				expect(result.attributes.startDate.format(Config.DATE_FORMAT)).toEqual('1977-10-01');
				expect(result.attributes.endDate.format(Config.DATE_FORMAT)).toEqual('1991-09-30');
			});

			it('Expects that the correct number of variable models are added to each site model', function() {
				var result1, result2;
				fakeServer.respondWith(/waterService/, [200, {'Content-Type' : 'text'}, SITE_INFO]);
				fakeServer.respond();
				result1 = testCollection.find(function(model) {
					return model.attributes.siteNo === '05427945';
				});
				result2 = testCollection.find(function(model) {
					return model.attributes.siteNo === '05427946';
				});

				expect(result1.attributes.variables.length).toBe(2);
				expect(result2.attributes.variables.length).toBe(1);
			});

			it('Expects that a successful fetch resolves the returned promise', function() {
				fakeServer.respondWith(/waterService/, [200, {'Content-Type' : 'text'}, SITE_INFO]);
				fakeServer.respond();

				expect(successSpy).toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
			})
		});
	});
});