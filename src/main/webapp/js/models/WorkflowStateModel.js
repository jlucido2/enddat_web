/* jslint browser: true */

define([
	'backbone'
], function(Backbone) {
	"use strict";

	var PROJ_LOC_STEP = 'specifyProjectLocation';
	var CHOOSE_DATA_STEP = 'chooseData';
	var PROCESS_DATA_STEP = 'processData';

	var model = Backbone.Model.extend({
		defaults : function() {
			return {
				step : 'unknown'
			};
		},

		isSpecifyProjectLocationStep : function() {
			return (this.attributes.step === PROJ_LOC_STEP);
		},
		isChooseDataStep : function() {
			return (this.attributes.step === CHOOSE_DATA_STEP);
		},
		isProcessDataStep : function() {
			return (this.attributes.step === PROCESS_DATA_STEP);
		},
		setSpecifyProjectLocationStep : function() {
			this.set('step', PROJ_LOC_STEP);
		},
		setChooseDataStep : function() {
			this.set('step', CHOOSE_DATA_STEP);
		},
		setProcessDataStep : function() {
			this.set('step', PROCESS_DATA_STEP);
		}
	});

	return model;
});


