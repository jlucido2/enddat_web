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

	var ENDPOINT = 'http://data.rcc-acis.org/StnMeta';
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

		url : ENDPOINT + '?meta=name,valid_daterange,ll,sid&elems=' + _.pluck(ELEMS, 'code').join(','),

		parse : function(response) {
			var sites = response.meta;
			var result = _.map(sites, function(site) {
				var variables = _.map(site.valid_daterange, function(dateRange, varIndex) {
					var result = ELEMS[varIndex];
					result.startDate = moment(dateRange[0], Config.DATE_FORMAT);
					result.endDate = moment(dateRange[1], Config.DATE_FORMAT);
					result.variableParameter = new VariableParameter({
						name : 'ACIS',
						value : site.sid[0] + ':' +  ELEMS[varIndex].code,
						colName : ELEMS[varIndex].description
					});
					return result;
				});

				return {
					lon : site.ll[0],
					lat : site.ll[1],
					name : site.name,
					sid : site.sid[0],
					variables : new BaseVariableCollection(variables)
				};
			});

			return result;
		},

		fetch : function(boundingBox) {
			var localOptions = {
				reset : true,
				data : {
					boundingBox : [boundingBox.west,boundingBox.south, boundingBox.east, boundingBox.north].join(',')
				}
			};

			BaseDatasetCollection.prototype.fetch.call(this, localOptions);
		}

	});

	return collection;
});


