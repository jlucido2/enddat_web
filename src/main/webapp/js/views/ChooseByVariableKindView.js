/* jslint browser: true */

define([
	'underscore',
	'select2',
	'utils/VariableDatasetMapping',
	'views/BaseCollapsiblePanelView',
	'hbs!hb_templates/chooseByVariable'
], function(_, select2, VariableDatasetMapping, BaseCollapsiblePanelView, hbTemplate) {
	"use strict";

	var view = BaseCollapsiblePanelView.extend({

		template : hbTemplate,

		panelHeading : 'Choose Data',
		panelBodyId : 'choose-by-variable-panel-body',

		additionalEvents : {
			'select2:select #variable-select' : 'selectVariable',
			'select2:unselect #variable-select' : 'resetVariable'
		},

		render : function() {
			this.context = VariableDatasetMapping.getMapping();
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);

			this.$('#variable-select').select2({
				allowClear : true,
				theme : 'bootstrap'
			});
			this.updateVariables();

			this.listenTo(this.model, 'change:variables', this.updateVariables);
			return this;
		},

		/*
		 * Model event handlers
		 */

		updateVariables : function() {
			var chosenVariables = (this.model.has('variables')) ? this.model.get('variables') : [];
			this.$('#variable-select').val(chosenVariables).trigger('change');
		},

		/*
		 * DOM event handlers
		 */

		selectVariable : function(ev) {
			var variables = _.clone((this.model.has('variables')) ? this.model.get('variables') : []);
			variables.push(ev.params.data.id);
			this.model.set('variables', variables);
		},

		resetVariable : function(ev) {
			var variables = (this.model.has('variables')) ? this.model.get('variables') : [];
			variables = _.reject(variables, function(variableKind) {
				return (ev.params.data.id === variableKind);
			});
			this.model.set('variables', variables);
		}
	});

	return view;
});


