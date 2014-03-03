aQuery.define( "@app/controllers/apinav", [ "main/attr", "module/location", "app/Controller", "@app/views/apinav" ], function( $, attr, location, SuperController, NavmenuView ) {
	"use strict"; //启用严格模式
	var ROUTER_MARK = "_",
		SCROLLTO = "scrollTo",
		SWAPINDEX = "swapIndex";

	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new NavmenuView( contollerElement ), models );

			// this.navitem = null;
			// this.initSwapIndex = location.getHash( SWAPINDEX );
			// this.initsSrollTo = location.getHash( SCROLLTO );

			// var controller = this;
			this.$nav = $( this.view.topElement ).find( "#apinav" );

			this.$nav.on( "navmenu.select", function( e ) {
				// controller._modifyLocation( e.navitem );
				// controller.selectNavitem( e.navitem );
			} ).on( "dblclick", function( e ) {
				controller.trigger( "navmenu.dblclick", controller, {
					type: "navmenu.dblclick",
					event: e
				} );
			} );

		},
		_modifyLocation: function( target ) {
			// var $target = $( target );

			// if ( $target.isWidget( "ui.navitem" ) ) {
			// 	var path = $target.navitem( "getOptionToRoot" ).reverse().join( ROUTER_MARK );
			// 	location.setHash( "navmenu", path );
			// 	if ( this._modified ) {
			// 		location.removeHash( SCROLLTO );
			// 		location.removeHash( SWAPINDEX );
			// 	}

			// }
			// this._modified = true;
		},
		selectNavitem: function( navitem ) {
			// var swapIndex, scrollTo;
			// if ( this.navitem === null ) {
			// 	swapIndex = this.initSwapIndex;
			// 	scrollTo = this.initsSrollTo;
			// } else {
			// 	swapIndex = attr.getAttr( navitem, "swap-index" );
			// 	scrollTo = attr.getAttr( navitem, "scroll-to" );
			// }

			// this.navitem = navitem;

			// var path = this._getPath( navitem, swapIndex, scrollTo );

			// if ( path != null ) {
			// 	this.trigger( "navmenu.select", this, {
			// 		type: "navmenu.select",
			// 		path: path
			// 	} );
			// }

		},
		_getPath: function( navitem, swapIndex, scrollTo ) {

			return path;
		},
		selectDefaultNavmenu: function( target ) {
			// var ret = $( target ? this.$nav.uiNavmenu( "getNavItemsByHtmlPath", target.split( ROUTER_MARK ) ) : "#guide_AMDQuery" );
			// this.$nav.uiNavmenu( "selectNavItem", ret );
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