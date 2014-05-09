aQuery.define( "@app/controllers/docnav", [ "main/attr", "module/location", "app/Controller", "@app/views/docnav" ], function( $, attr, location, SuperController, NavmenuView ) {
	"use strict"; //启用严格模式
	var ROUTER_MARK = "_",
		SCROLLTO = "scrollTo",
		SWAPINDEX = "swapIndex",
		DOCNAVMENUKEY = "docNavmenuKey";

	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new NavmenuView( contollerElement ), models );
			this.hash = {};
			this.navitem = null;
			this.initSwapIndex = location.getHash( SWAPINDEX );
			this.initsSrollTo = location.getHash( SCROLLTO );

			var controller = this;
			this.$nav = $( this.view.topElement ).find( "#docnav" );

			this.$nav.on( "navmenu.select", function( e ) {
				controller._modifyLocation( e.navitem );
				controller.selectNavitem( e.navitem );
			} ).on( "dblclick", function( e ) {
				controller.trigger( "navmenu.dblclick", controller, {
					type: "navmenu.dblclick",
					event: e
				} );
			} );

			this.swapIndexChange = function( e ) {
				location.removeHash( SCROLLTO );
				location.setHash( SWAPINDEX, e.index );
			}

			$.on( "document_iframe.swapIndexChange", this.swapIndexChange );

			this.scrollToChange = function( e ) {
				location.setHash( SCROLLTO, e.name );
			}

			$.on( "document_iframe.scrollToChange", this.scrollToChange );

		},
		activate: function() {
			SuperController.invoke( "activate", this );
		},
		deactivate: function() {
			SuperController.invoke( "deactivate", this );
		},
		_modifyLocation: function( target ) {
			var $target = $( target );

			if ( $target.isWidget( "ui.navitem" ) ) {
				var path = $target.navitem( "getOptionToRoot" ).reverse().join( ROUTER_MARK );
				location.setHash( DOCNAVMENUKEY, path );
				if ( this._modified ) {
					location.removeHash( SCROLLTO );
					location.removeHash( SWAPINDEX );
				}

			}
			this._modified = true;
		},
		selectNavitem: function( navitem ) {
			var swapIndex, scrollTo;
			if ( this.navitem === null ) {
				swapIndex = this.initSwapIndex;
				scrollTo = this.initsSrollTo;
			} else {
				swapIndex = attr.getAttr( navitem, "swap-index" );
				scrollTo = attr.getAttr( navitem, "scroll-to" );
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
				ret.push( "source", "assets" );

				path = $.pagePath + ret.reverse().join( "/" ) + ".html#";

				if ( swapIndex != null ) {
					path += "swapIndex=" + location.getHash( SWAPINDEX ) + "!";
				}
				if ( scrollTo != null ) {
					path += "scrollTo=" + location.getHash( SCROLLTO ) + "!";
				}
			}
			return path;
		},
		selectDefaultNavmenu: function( target ) {
			target = target || location.getHash( DOCNAVMENUKEY ) || "guide_AMDQuery";
			var ret = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", target.split( ROUTER_MARK ) );
			if ( ret.length ) {
				this.$nav.uiNavmenu( "selectNavItem", ret[ 0 ] );
			}

		},
		destroy: function() {
			this.$nav.clearHandlers();
			this.$nav = null;
			$.off( "document_iframe.swapIndexChange", this.swapIndexChange );
			$.off( "document_iframe.scrollToChange", this.scrollToChange );
			SuperController.invoke( "destroy" );
		}
	}, {

	} );

	return Controller;
} );