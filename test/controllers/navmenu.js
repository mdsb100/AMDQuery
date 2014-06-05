aQuery.define( "@app/controllers/navmenu", [ "main/query", "module/history", "app/Controller", "@app/views/navmenu" ], function( $, query, history, SuperController, NavmenuView ) {
	"use strict"; //启用严格模式
	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new NavmenuView( contollerElement ), models );

			var controller = this;
			this.$nav = $( this.view.topElement ).find( "#nav" );

			history.on( 'change', function( e ) {
				controller.selectDefaultNavmenu( e.token );
			} );

			var li = $( $.createEle( "li" ) ).uiNavitem( {
				html: "destroyWidget",
				img: "class"
			} );
			var parentNode = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", [ "ui" ] );
			this.$nav.uiNavmenu( "addNavItem", li, parentNode );

			this.$nav.on( "navmenu.select", function( e ) {
				var target = $( e.navitem ),
					ret = target.uiNavitem( "getOptionToRoot" ),
					path;

				if ( target.children( "ul" ).length === 0 ) {
					history.add( ret.concat().reverse().join( "_" ) );
					ret.push( "assets" );
					path = ret.reverse().join( "/" ) + ".html";
					controller.trigger( "navmenu.select", controller, {
						type: "navmenu.select",
						path: path
					} );
				}
			} );

			this.$nav.on( "dblclick", function( e ) {
				controller.trigger( "navmenu.dblclick", controller, {
					type: "navmenu.dblclick",
					event: e
				} );
			} );

		},
		selectDefaultNavmenu: function( target ) {
			var ret = $( "#index-navitem" );
			if ( target ) {
				var navItem = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", target.split( "_" ) )[ 0 ];
				ret = navItem || ret;
			}
			this.$nav.uiNavmenu( "selectNavItem", ret );
		},
		destroy: function() {
			this.$nav.clearHandlers();
			this.$nav = null;
			SuperController.invoke( "destroy" );
		}
	}, {

	} );

	return Controller;
} );