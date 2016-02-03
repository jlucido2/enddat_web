var ENDDAT = ENDDAT || {};

ENDDAT.controller = ENDDAT.controller || {};



ENDDAT.controller.ENDDATRouter = Backbone.Router.extend({

	applicationContextDiv : '#site_content',

	routes: {
		'' : 'home',
		'!home' : 'home',
	},

	home : function() {
		this.showView(ENDDAT.view.HomeView);
	},

	showView : function(view, opts) {
		var newEl = $('<div>');

		this.removeCurrentView();
		$(this.applicationContextDiv).append(newEl);
		this.currentView = new view($.extend({
			el: newEl,
			router: this
		}, opts));
	},
	removeCurrentView : function() {
		if (this.currentView) {
			this.currentView.remove();
		}
	}
});

