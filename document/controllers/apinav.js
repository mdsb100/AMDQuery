aQuery.define( "@app/controllers/apinav", [ "main/attr", "module/location", "app/Controller", "@app/views/apinav" ], function( $, attr, location, SuperController, NavmenuView ) {
	"use strict"; //启用严格模式
	var ROUTER_MARK = "_",
		SCROLLTO = "scrollTo",
		SWAPINDEX = "swapIndex";

	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new NavmenuView( contollerElement ), models );
			this.hash = {};
			var controller = this;
			this.$nav = $( this.view.topElement ).find( "#apinav" );

			this.$nav.on( "navmenu.select", function( e ) {
				controller.selectNavitem( e.navitem );
			} ).on( "dblclick", function( e ) {
				controller.trigger( "navmenu.dblclick", controller, {
					type: "navmenu.dblclick",
					event: e
				} );
			} );

		},
		activate: function() {

		},
		deactivate: function() {

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
			var link = attr.getAttr( navitem, "link" );
			if ( link ) {
				this.trigger( "navmenu.select", this, {
					type: "navmenu.select",
					path: "assets/api/" + link
				} )
			}
		},
		_getPath: function( navitem, swapIndex, scrollTo ) {

			return path;
		},
		selectDefaultNavmenu: function( target ) {
			var navitem = this.$nav.find( "li[link='" + ( target || "index.html" ) + "']" );
			if ( navitem.length ) {
				this.$nav.uiNavmenu( "selectNavItem", navitem[ 0 ] );
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