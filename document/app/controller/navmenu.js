aQuery.define( "@app/controller/navmenu", [ "main/attr", "hash/locationHash", "app/Controller", "@app/view/navmenu" ], function( $, attr, locationHash, SuperController, NavmenuView ) {
	"use strict"; //启用严格模式
	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new NavmenuView( contollerElement ), models );

			this.navitem = null;
			this.initSwapIndex = locationHash.swapIndex;
			this.initsSrollTo = locationHash.scrollTo;

			var controller = this;
			this.$nav = $( this.view.topElement ).find( "#nav" );

			this.$nav.on( "navmenu.select", function( e ) {
				controller.selectNavitem( e.navitem );
			} ).on( "dblclick", function( e ) {
				controller.trigger( "navmenu.dblclick", controller, {
					type: "navmenu.dblclick",
					event: e
				} );
			} );

		},
		selectNavitem: function( navitem ) {
			var swapIndex, scrollTo;
			if ( this.navitem === null ) {
				swapIndex = this.initSwapIndex;
				scrollTo = this.initsSrollTo;
			} else {
				swapIndex = attr.getAttr( navitem, "swap-index" );
				swapIndex = attr.getAttr( navitem, "scroll-to" );
			}

			this.navitem = navitem;

			var path = this._getPath( navitem, swapIndex, scrollTo );

      if ( path != null ) {
        this.trigger( "navmenu.select", this, {
          type: "navmenu.select",
          path: path
        } );
      }

		},
		_getPath: function( navitem, swapIndex, scrollTo ) {
			var target = $( navitem ),
				ret = target.uiNavitem( "getOptionToRoot" ),
				path = null;
			if ( ret.length > 1 ) {
				ret.push( "source", "asset" );

				path = $.pagePath + ret.reverse().join( "/" ) + ".html#";

				if ( swapIndex != null ) {
					path += "swapIndex=" + locationHash.swapIndex + "!";
				}
				if ( scrollTo != null ) {
					path += "scrollTo=" + locationHash.scrollTo + "!";
				}
			}
			return path;
		},
		selectDefaultNavmenu: function( target ) {
			var ret = "index_navmenu";
			if ( target ) {
				var navItem = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", target.split( /\W/ ) )[ 0 ];
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