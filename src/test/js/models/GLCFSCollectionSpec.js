/* jslint browser: true */

/* global sinon, expect, jasmine */

define([
	'models/GLCFSCollection'
], function(GLCFSCollection) {
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
			var SITE_RESPONSE = '<?xml version="1.0" encoding="UTF-8"?>' +
				'<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" ' + 
				'xmlns:sb="http://sciencebase.gov/catalog" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
				'numberMatched="1" numberReturned="1" timeStamp="2016-06-13T22:34:11.213Z" ' +
				'xsi:schemaLocation="http://sciencebase.gov/catalog ' + 
				'https://www.sciencebase.gov:443/catalogMaps/mapping/ows/57507405e4b033c61ac3d5f4?service=WFS&amp;version=2.0.0&amp;request=DescribeFeatureType&amp;typeName=sb%3Amichigan ' +
				'http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd ' +
				'http://www.opengis.net/gml/3.2 http://schemas.opengis.net/gml/3.2.1/gml.xsd">' +
				'<wfs:boundedBy><gml:Envelope srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269">' +
				'<gml:lowerCorner>-87.60063934326172 41.95234298706055</gml:lowerCorner>' +
				'<gml:upperCorner>-87.52787017822266 41.98894500732422</gml:upperCorner></gml:Envelope></wfs:boundedBy>' +
				'<wfs:member><sb:michigan gml:id="michigan.4036"><gml:boundedBy><gml:Envelope srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269">' +
				'<gml:lowerCorner>-87.5999984741211 41.95234298706055</gml:lowerCorner><gml:upperCorner>-87.5999984741211 41.95234298706055</gml:upperCorner></gml:Envelope></gml:boundedBy>' +
				'<sb:the_geom><gml:Point srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#4269"><gml:pos>-87.5999984741211 41.95234298706055</gml:pos></gml:Point></sb:the_geom>' +
				'<sb:nx>16.0</sb:nx><sb:ny>19.0</sb:ny><sb:X1>-87</sb:X1><sb:X2>42</sb:X2></sb:michigan></wfs:member></wfs:FeatureCollection>';
			
			var DDS_RESPONSE = 'Dataset {\n' +
				'Float32 air_u[time = 91248][ny = 87][nx = 193];\n' +
				'Float32 air_v[time = 91248][ny = 87][nx = 193];\n' +
				'Float32 at[time = 91248][ny = 87][nx = 193];\n' +
				'Float32 cl[time = 91248][ny = 87][nx = 193];\n' +
				'Float32 dp[time = 91248][ny = 87][nx = 193];\n' +
				'Float64 time_offset[time = 91248];\n' +
				'Float32 depth[ny = 87][nx = 193];\n' +
				'Float32 lat[ny = 87][nx = 193];\n' +
				'Float32 lon[ny = 87][nx = 193];\n' +
				'Float32 sigma[nsigma = 20];\n' +
				'Float64 time[time = 91248];\n' +
				'Float64 time_run[time = 91248];\n' +
				'} glos/glcfs/archiveall/erie/nowcast-forcing-fmrc-2d/Lake_Erie_-_Nowcast_Forcing_-_2D_-_All_Years_best.ncd;';
			var fetchPromise;
			var successSpy, failSpy;
			
			beforeEach(function() {
				successSpy = jasmine.createSpy('successSpy');
				failSpy = jasmine.createSpy('failSpy');

				testCollection.reset([
					{lat : '42', lon : '-87', variables : new Backbone.Collection([{dataset : 0, code : 'testCode', description : 'testDescription'}])},
					{lat : '43', lon : '-87', variables : new Backbone.Collection([{dataset : 0, code : 'testCode', description : 'testDescription'}])}
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
				fakeServer.respondWith(/http:dummyservice\/wfs\//, [200, {'Content-Type' : 'text/xml'}, SITE_RESPONSE]);
				fakeServer.respondWith('glosthredds/dodsC/fakedata.dds', [200, {'Content-Type' : 'text'}, DDS_RESPONSE]);
				fakeServer.respond();

				expect(failSpy).not.toHaveBeenCalled();
				expect(successSpy).toHaveBeenCalled();
				expect(testCollection.length).toBe(1);
				
				var variableCollection0 = testCollection.at(0);
				expect(variableCollection0.attributes.lat).toEqual('42');
				expect(variableCollection0.attributes.lon).toEqual('-87');
				
				var variable0 = variableCollection0.get('variables').at(0);
				expect(variable0.attributes.x).toEqual('16');
				expect(variable0.attributes.y).toEqual('19');
				expect(variable0.attributes.variableParameter.name).toEqual('GRID');
				expect(variable0.attributes.variableParameter.value).toEqual('19:16:0:ci');
				expect(variable0.attributes.variableParameter.colName).toEqual('Ice Concentration (fraction)');
			});
		});
	});
});