/* jslint browser: true */

/* global sinon, expect, jasmine */

define([
	'models/GLCFSCollection',
	'models/BaseVariableCollection'
], function(GLCFSCollection, BaseVariableCollection) {
	describe('models/GLCFSCollection', function() {
		var fakeServer;
		var testCollection;

		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();
			testCollection = new GLCFSCollection([],{lake:'Erie'});
		});

		afterEach(function() {
			fakeServer.restore();
		});

		describe('Tests for fetch', function() {
			var bbox = {
				west : '-100',
				east : '-99',
				north : '43',
				south : '42'
			};
			var SITE_RESPONSE = '<?xml version="1.0" encoding="UTF-8"?><wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" ' +
						'xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:sb="http://sciencebase.gov/catalog">' +
						'<wfs:boundedBy><gml:Envelope srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269">' +
						'<gml:lowerCorner>-89.53 43.09</gml:lowerCorner>' +
						'<gml:upperCorner>-89.48 43.10</gml:upperCorner></gml:Envelope>' +
						'</wfs:boundedBy><wfs:member><sb:ncep_stiv_cell_points gml:id="ncep_stiv_cell_points.606685"><gml:boundedBy>' +
						'<gml:Envelope srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269">' +
						'<gml:lowerCorner>-89.53 43.10</gml:lowerCorner>' +
						'<gml:upperCorner>-89.53 43.10</gml:upperCorner></gml:Envelope></gml:boundedBy>' +
						'<sb:the_geom><gml:Point srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269">' +
						'<gml:pos>-89.53 43.10</gml:pos></gml:Point></sb:the_geom>' +
						'<sb:x>689.0</sb:x><sb:y>557.0</sb:y><sb:X1>-89.53</sb:X1><sb:X2>43.10</sb:X2></sb:ncep_stiv_cell_points>' +
						'</wfs:member><wfs:member><sb:ncep_stiv_cell_points gml:id="ncep_stiv_cell_points.607566">' +
						'<gml:boundedBy><gml:Envelope srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269">' +
						'<gml:lowerCorner>-89.48 43.09</gml:lowerCorner><gml:upperCorner>-89.48 43.09</gml:upperCorner></gml:Envelope>' +
						'</gml:boundedBy><sb:the_geom><gml:Point srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269">' +
						'<gml:pos>-89.48 43.09</gml:pos></gml:Point></sb:the_geom>' +
						'<sb:x>690.0</sb:x><sb:y>557.0</sb:y><sb:X1>-89.48</sb:X1><sb:X2>43.09</sb:X2></sb:ncep_stiv_cell_points>' +
						'</wfs:member></wfs:FeatureCollection>';
			var DDS_RESPONSE = 'Dataset {\n' +
					'Float32 Total_precipitation_surface_1_Hour_Accumulation[time = 125225][y = 881][x = 1121]; \n' +
					'Float64 time_bounds[time = 125225][time_bounds_1 = 2];\n' +
					'Float32 lon[x = 1121][y = 881]; \n' +
					'Float32 lat[x = 1121][y = 881];\n' +
					'Float64 time[time = 125225];\n' +
					'} stageiv_combined;';
			var fetchPromise;
			var successSpy, failSpy;
			beforeEach(function() {
				successSpy = jasmine.createSpy('successSpy');
				failSpy = jasmine.createSpy('failSpy');

				testCollection.reset([
					{variables : new BaseVariableCollection([{x : '1', y: '2'}]), lon : '-100', lat : '43.0'},
					{variables : new BaseVariableCollection([{x : '1', y: '3'}]), lon : '-100', lat : '44.0'}
				]);

				fetchPromise = testCollection.fetch(bbox).done(successSpy).fail(failSpy);
			});

			it('Expects that the url used in the site service call is retrieved from the module configuration', function() {
				expect(fakeServer.requests[0].url).toContain('http:dummyservice/wfs/?service=wfs&amp;version=2.0.0');
			});

			it('Expects the url used in the dds service call is retrieved from the module configuration', function() {
				expect(fakeServer.requests[1].url).toContain('glosthredds/dodsC/fakedata');
			});

			it('Expects that the site url will contain the urlencoded bbox parameter', function() {
				expect(fakeServer.requests[0].url).toContain('bbox=' + encodeURIComponent(bbox.south + ',' + bbox.west + ',' + bbox.north + ',' + bbox.east));
			});

			it('Expects that failed ajax response for the site service causes the promise to be rejected and the collection cleared', function() {
				fakeServer.respondWith(/http:dummyservice\/wfs\//, [500, {'Content-Type' : 'text'}, 'Internal server error']);
				fakeServer.respondWith('glosthredds/dodsC/fakedata.dds', [200, {'Content-Type' : 'text'}, DDS_RESPONSE]);
				fakeServer.respond();

				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
				expect(testCollection.length).toBe(0);
			});

			it('Expects that failed ajax response for the dds service causes the promise to be rejected and the collection cleared', function() {
				fakeServer.respondWith(/http:dummyservice\/wfs\//, [200, {'Content-Type' : 'text/xml'}, SITE_RESPONSE]);
				fakeServer.respondWith('glosthredds/dodsC/fakedata.dds', [500, {'Content-Type' : 'text'}, 'Internal server error']);
				fakeServer.respond();

				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
				expect(testCollection.length).toBe(0);
			});

			it('Expects that a successfully ajax response with an exception report causes the promise to be rejected and the collection cleared', function() {
				fakeServer.respondWith(/http:dummyservice\/wfs\//, [200, {'Content-Type' : 'text/xml'}, '<ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.0" xsi:schemaLocation="http://www.opengis.net/ows/1.1 https://www.sciencebase.gov:443/catalogMaps/schemas/ows/1.1.0/owsAll.xsd">' +
					'<ows:Exception exceptionCode="NoApplicableCode">' +
					'<ows:ExceptionText>java.lang.NullPointerException' +
					'null</ows:ExceptionText>' +
					'</ows:Exception>' +
					'</ows:ExceptionReport>']);
				fakeServer.respondWith('glosthredds/dodsC/fakedata.dds', [200, {'Content-Type' : 'text'}, DDS_RESPONSE]);
				fakeServer.respond();

				expect(successSpy).not.toHaveBeenCalled();
				expect(failSpy).toHaveBeenCalled();
				expect(testCollection.length).toBe(0);
			});

			it('Expects that a successful respond for the site and dds services causes the promise to be resolved and the collection to be updated with the contents of the response', function() {
				var variable0;
				fakeServer.respondWith(/http:dummyservice\/wfs\//, [200, {'Content-Type' : 'text/xml'}, SITE_RESPONSE]);
				fakeServer.respondWith('glosthredds/dodsC/fakedata.dds', [200, {'Content-Type' : 'text'}, DDS_RESPONSE]);
				fakeServer.respond();

				variable0 = testCollection.at(0).attributes.variables.at(0).attributes;
				expect(successSpy).toHaveBeenCalled();
				expect(failSpy).not.toHaveBeenCalled();
				expect(testCollection.length).toBe(2);
				expect(testCollection.at(0).attributes.lat).toEqual('43.10');
				expect(testCollection.at(0).attributes.lon).toEqual('-89.53');
				expect(variable0.x).toEqual('689');
				expect(variable0.y).toEqual('557');
				expect(variable0.variableParameter.name).toEqual('Precip');
				expect(variable0.variableParameter.value).toEqual('557:689:125225:precip3');
				expect(variable0.variableParameter.colName).toEqual('Total precip - 1 hr [557,689]');
			});
		});
	});
});