/* jslint browser: true */

define([
	'underscore',
	'select2',
	'utils/VariableDatasetMapping',
	'views/BaseCollapsiblePanelView',
	'views/DataDateFilterView',
	'hbs!hb_templates/chooseByVariable'
], function(_, select2, VariableDatasetMapping, BaseCollapsiblePanelView, DataDateFilterView, hbTemplate) {
	"use strict";

	/*
	 * @constructs
	 * @param {Object} options
	 *		@prop {Jquery selector} el
	 *		@prop {WorkflowStateModel} model
	 */
	var view = BaseCollapsiblePanelView.extend({

		template : hbTemplate,

		panelHeading : 'Choose Data',
		panelBodyId : 'choose-by-variable-panel-body',

		additionalEvents : {
			'select2:select #variable-select' : 'selectVariable',
			'select2:unselect #variable-select' : 'resetVariable'
		},

		initialize : function(options) {
			BaseCollapsiblePanelView.prototype.initialize.apply(this, arguments);

			this.dateFilterView = new DataDateFilterView({
				el : this.$('.date-filter-container'),
				model : this.model
			});
		},

		render : function() {
			this.context = VariableDatasetMapping.getMapping();
			BaseCollapsiblePanelView.prototype.render.apply(this, arguments);
			this.dateFilterView.setElement(this.$('.date-filter-container')).render();

			this.$('#variable-select').select2({
				allowClear : true,
				theme : 'bootstrap'
			});
			this.updateVariables();

			this.listenTo(this.model, 'change:variableKinds', this.updateVariables);
			return this;
		},

		remove : function() {
			this.dateFilterView.remove();
			BaseCollapsiblePanelView.prototype.remove.apply(this, arguments);
		},

		/*
		 * Model event handlers
		 */

		updateVariables : function() {
			var chosenVariables = (this.model.has('variableKinds')) ? this.model.get('variableKinds') : [];
			this.$('#variable-select').val(chosenVariables).trigger('change');
		},

		/*
		 * DOM event handlers
		 */

		selectVariable : function(ev) {
			var chosenVariables = _.clone((this.model.has('variableKinds')) ? this.model.get('variableKinds') : []);
			chosenVariables.push(ev.params.data.id);
			this.model.set('variableKinds', chosenVariables);
		},

		resetVariable : function(ev) {
			var chosenVariables = (this.model.has('variableKinds')) ? this.model.get('variableKindss') : [];
			chosenVariables = _.reject(chosenVariables, function(variableKind) {
				return (ev.params.data.id === variableKind);
			});
			this.model.set('variableKinds', chosenVariables);
		}
	});

	return view;
});


