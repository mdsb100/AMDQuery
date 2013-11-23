aQuery.define( "ui/tabview", [
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "module/Widget",
    "ui/tabbar",
    "ui/tabbutton"
  ],
	function( $, query, cls, event, css, position, dom, attr, Widget, tabbar, tabbutton ) {
		"use strict"; //启用严格模式

		// Widget.fetchCSS( "ui/css/tabview" );

		var tabview = Widget.extend( "ui.tabview", {
			container: null,
			event: function() {},
			_initHandler: function() {
				var self = this,
					opt = this.options;
				this.tabviewEvent = function( e ) {
					switch ( e.type ) {
						case "widget.detect":
							self.detect();
							self.$tabBar.uiTabbar( "detect" );
							break;
						case "tabbar.click":
							self.selectView( e.index );
							break;
					}

				};
				return this;
			},
			enable: function() {
				this.disable();
				this.$tabBar.on( "tabbar.click", this.tabviewEvent );
				this.target.on( "widget.detect", this.tabviewEvent );
				this.options.disabled = false;
				return this;
			},
			disable: function() {
				this.$tabBar.off( "tabbar.click", this.tabviewEvent );
				this.target.off( "widget.detect", this.tabviewEvent );
				this.options.disabled = true;
				return this;
			},
			render: function() {
				var opt = this.options;

				this.selectView( opt.index );

				this.selectTabbutton( opt.index );
			},
			selectTabbutton: function( index ) {
				this.$tabBar.uiTabbar( index );

				this.options.index = index;
			},
			selectView: function( index ) {
				var originIndex = this.options.index;
				this.$view.hide().eq( index ).show();
				this.options.index = index;

				if ( index !== originIndex ) {
					var activeView = this.$view.eq( index ),
						deactiveView = this.$view.eq( originIndex );

					deactiveView.trigger( "deactive", deactiveView[ 0 ], {
						type: "deactive"
					} );

					activeView.trigger( "active", activeView[ 0 ], {
						type: "active"
					} );

					var eventName = this.getEventName( "select" );

					this.target.trigger( eventName, this.target[ 0 ], {
						type: eventName,
						index: index
					} );
				}
			},
			init: function( opt, target ) {
				this._super( opt, target );

				this._initHandler();

				this.detect();

				return this;
			},
			destroy: function() {
				this.$tabBar.destroyTabbar();
				Widget.invoke( "destroy", this );
			},
			detect: function() {
				var $tabBar = this.target.children( "div[amdquery-widget*='ui.tabbar']" );

				this.$tabBar = $tabBar;

				$tabBar.uiTabbar();

				this.$view = this.target.children().filter( function() {
					return this === $tabBar[ 0 ];
				} );

				this.options.index = $tabBar.uiTabbar( "option", "index" );

				return this.able().render();
			},
			customEventName: [ "select" ],
			options: {
				index: 0
			},
			getter: {

			},
			setter: {

			},
			publics: {

			},
			target: null,
			toString: function() {
				return "ui.tabview";
			},
			widgetEventPrefix: "tabview"
		} );

		return tabview;
	} );