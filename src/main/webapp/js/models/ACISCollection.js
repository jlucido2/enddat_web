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

	var ENDPOINT = module.config().acisStnMetaUrl;
	var ELEMS = [
			{code : 'maxt', description : 'Maximum temperature (F)'},
			{code : 'mint', description : 'Minimum temperature (F)'},
			{code : 'avgt', description : 'Average temperature (F)'},
			{code : 'obst', description : 'Obs time temperature (F)'},
			{code : 'pcpn', description : 'Precipitation (inches)'},
			{code : 'snow', description : 'Snowfall (inches)'},
			{code : 'snwd', description : 'Snow depth (inches)'},
			{code : '13', description : 'Water equivalent of snow depth (inches)'},
			{code : '7', description : 'Pan evaporation (inches)'},
			{code : 'cdd', description : 'Cooling Degree Days (default base 65)'},
			{code : 'hdd', description : 'Degree days below base (default base 65)'},
			{code : 'gdd', description : 'Degree days above base (default base 50)'}
	];

	var collection = BaseDatasetCollection.extend({

		url : ENDPOINT + '?meta=name,valid_daterange,ll,sids&elems=' + _.pluck(ELEMS, 'code').join(','),

		parse : function(response) {
			var sites = response.meta;
			var result = _.map(sites, function(site) {
				var variables = _.chain(site.valid_daterange)
					.map(function(dateRange, varIndex) {
						var result = _.clone(ELEMS[varIndex]);
						if (dateRange.length > 0) {
							result.startDate = moment(dateRange[0], Config.DATE_FORMAT);
							result.endDate = moment(dateRange[1], Config.DATE_FORMAT);
							result.variableParameter = new VariableParameter({
								name : 'ACIS',
								value : site.sids[0] + ':' +  result.code,
								colName : result.description
							});
						}
						return result;
					})
					.filter(function(dataVar) {
						return (_.has(dataVar, 'startDate') && _.has(dataVar, 'endDate'));
					})
					.value();

				return {
					lon : site.ll[0],
					lat : site.ll[1],
					name : site.name,
					sid : site.sids[0],
					variables : new BaseVariableCollection(variables)
				};
			});

			return result;
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


