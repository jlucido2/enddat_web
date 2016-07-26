/* jslint browser: true */

define([
	'loglevel',
	'module',
	'underscore',
	'moment',
	'Config',
	'utils/VariableParameter',
	'models/BaseDatasetCollection',
	'models/BaseVariableCollection'
], function(log, module, _, moment, Config, VariableParameter, BaseDatasetCollection, BaseVariableCollection) {
	"use strict";

	var ENDPOINT = module.config().acisStnMetaUrl;
	var ELEMS = [
			{code : 'maxt', description : 'Maximum temperature (F)', unit : 'F'},
			{code : 'mint', description : 'Minimum temperature (F)', unit : 'F'},
			{code : 'avgt', description : 'Average temperature (F)', unit : 'F'},
			{code : 'obst', description : 'Obs time temperature (F)', unit : 'F'},
			{code : 'pcpn', description : 'Precipitation (inches)', unit : 'inches'},
			{code : 'snow', description : 'Snowfall (inches)', unit : 'inches'},
			{code : 'snwd', description : 'Snow depth (inches)', unit : 'inches'},
			{code : '13', description : 'Water equivalent of snow depth (inches)', unit : 'inches'},
			{code : '7', description : 'Pan evaporation (inches)', unit : 'inches'},
			{code : 'cdd', description : 'Cooling Degree Days (default base 65)', unit : 'days'},
			{code : 'hdd', description : 'Degree days below base (default base 65)', unit : 'days'},
			{code : 'gdd', description : 'Degree days above base (default base 50)', unit : 'days'}
	];
	var NETWORKS = [
		{code : '1', name : 'WBAN'},
		{code : '2', name : 'COOP'},
		{code : '3', name : 'FAA'},
		{code : '4', name : 'WMO'},
		{code : '5', name : 'ICAO'},
		{code : '6', name : 'GHCN'},
		{code : '7', name : 'NWSLI'},
		{code : '8', name : 'RCC'},
		{code : '9', name : 'ThreadEx'},
		{code : '10', name : 'CoCoRaHS'}
	];

	var collection = BaseDatasetCollection.extend({

		url : 'acis/StnMeta?meta=name,valid_daterange,ll,elev,sids&elems=' + _.pluck(ELEMS, 'code').join(','),

		parse : function(response) {
			var sites = response.meta;
			log.debug('ACIS sites received: ' + sites.length);
			return _.map(sites, function(site) {
				// Use first sid when retrieving information.
				//console.log(site);
				var sid = site.sids[0].split(' ')[0];
				var variables = _.chain(site.valid_daterange)
					.map(function(dateRange, varIndex) {
						var result = _.clone(ELEMS[varIndex]);
						if (dateRange.length > 0) {
							result.startDate = moment(dateRange[0], Config.DATE_FORMAT);
							result.endDate = moment(dateRange[1], Config.DATE_FORMAT);
							result.variableParameter = new VariableParameter({
								name : 'ACIS',
								siteNo : sid,
								siteName : site.name,
								value : sid + ':' +  result.code,
								colName : result.description + ':' + sid,
								latitude : site.ll[1],
								longitude : site.ll[0],
								elevation : site.elev,
								elevationUnit : 'feet',
								variableUnit : result.unit
							});
						}
						return result;
					})
					.filter(function(dataVar) {
						return (_.has(dataVar, 'startDate') && _.has(dataVar, 'endDate'));
					})
					.value();
				var getNetwork = function(sid) {
					var parsedSid = sid.split(' ');
					return {
						id : parsedSid[0],
						code : parsedSid[1],
						name : _.find(NETWORKS, function(n) { return n.code === parsedSid[1]; }).name
					};
				};

				return {
					lon : site.ll[0],
					lat : site.ll[1],
					name : site.name,
					sid : sid,
					networks : _.map(site.sids, getNetwork),
					variables : new BaseVariableCollection(variables)
				};
			});
		},

		fetch : function(boundingBox) {
			var localOptions = {
				reset : true,
				data : {
					bbox : [boundingBox.west, boundingBox.south, boundingBox.east, boundingBox.north].join(',')
				},
				error : function(collection) {
					log.debug('Unable to fetch the ACISCollection data');
					collection.reset([]);
				}
			};

			return BaseDatasetCollection.prototype.fetch.call(this, localOptions);
		}

	});

	return collection;
});


