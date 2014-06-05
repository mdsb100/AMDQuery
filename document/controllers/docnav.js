aQuery.define( "@app/controllers/docnav", [ "main/attr", "module/history", "app/Controller", "@app/views/docnav" ], function( $, attr, history, SuperController, NavmenuView ) {
	"use strict"; //启用严格模式
	var ROUTER_MARK = "_",
		DOCNAVMENUKEY = "docNavmenuKey";

	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new NavmenuView( contollerElement ), models );
			this.hash = {};
			this.navitem = null;
			this.DOCNAVMENUKEY = DOCNAVMENUKEY;

			var controller = this;
			this.$nav = $( this.view.topElement ).find( "#docnav" );

			this.$nav.on( "navmenu.select", function( e ) {
				controller._changeHistory( e.navitem );
				controller.triggerPath( e.navitem );
			} ).on( "dblclick", function( e ) {
				controller.trigger( "navmenu.dblclick", controller, {
					type: "navmenu.dblclick",
					event: e
				} );
			} );

			history.on( DOCNAVMENUKEY + ".change", function( e ) {
				controller.selectDefaultNavmenu( e.token );
			} );

		},
		activate: function() {
			SuperController.invoke( "activate", this );
		},
		deactivate: function() {
			SuperController.invoke( "deactivate", this );
		},
		_changeHistory: function( target ) {
			var $target = $( target );

			if ( $target.isWidget( "ui.navitem" ) ) {
				var path = $target.navitem( "getOptionToRoot" ).reverse().join( ROUTER_MARK ),
					result = {};
				result[ DOCNAVMENUKEY ] = path;

				// if ( this._modified ) {
				// 	result[ SCROLLTO ] = '';
				// 	result[ SWAPINDEX ] = '';
				// }
				history.addByKeyValue( result, path );
			}
			this._modified = true;
		},
		triggerPath: function( navitem ) {
			this.navitem = navitem;

			var path = this._getPath( navitem );

			if ( path != null ) {
				this.trigger( "navmenu.select", this, {
					type: "navmenu.select",
					path: path
				} );
			}

		},
		_getPath: function( navitem ) {
			var target = $( navitem ),
				ret = target.uiNavitem( "getOptionToRoot" ),
				path = null;
			if ( ret.length > 1 ) {
				ret.push( "source", "assets" );
        path = $.pagePath + ret.reverse().join( "/" ) + ".html#";
			}
			return path;
		},
		selectDefaultNavmenu: function( target ) {
			target = target || "guide_AMDQuery";
			var ret = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", target.split( ROUTER_MARK ) );
			if ( ret.length ) {
				this.$nav.uiNavmenu( "selectNavItem", ret[ 0 ] );
			}

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