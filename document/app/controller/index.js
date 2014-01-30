aQuery.define( "@app/controller/index", [
  "hash/locationHash",
  "app/Controller",
  "@app/view/index",
  "@app/controller/navmenu",
  "@app/controller/content"
  ], function( $,
	locationHash,
	SuperController,
	IndexView ) {
	"use strict"; //启用严格模式
	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new IndexView( contollerElement ), models );
			var self = this;

			this.navmenu.on( "navmenu.select", function( e ) {
				self.document.loadPath( e.path );
			} );
			this.navmenu.on( "navmenu.dblclick", function( e ) {
				self.document.openWindow();
			} );

			this.navmenu.selectDefaultNavmenu( locationHash.navmenu );

			// this.api.loadPath( "/document/api/index.html" );

			var $swapview = $( this.view.topElement ).find( "#contentview" );

			var loadAPIFlag = false;

			$( "#tabview" ).on( "tabview.select", function( e ) {
				$swapview.uiSwapview( "render", e.index, function() {
					if ( e.index === 1 && loadAPIFlag === false ) {
						loadAPIFlag = true;
						self.api.loadPath( "asset/api/index.html" );
					}
				} );
			} );
		},
		destroy: function() {
			this.navmenu.clearHandlers();
			SuperController.invoke( "destroy" );
		}
	}, {

	} );

	return Controller;
} );