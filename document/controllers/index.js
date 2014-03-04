aQuery.define( "@app/controllers/index", [
  "module/location",
  "app/Controller",
  "@app/views/index",
  "@app/controllers/docnav",
  "@app/controllers/apinav",
  "@app/controllers/content"
  ], function( $,
	location,
	SuperController,
	IndexView ) {
	"use strict"; //启用严格模式
	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new IndexView( contollerElement ), models );
			var self = this;

			this.docnav.on( "navmenu.select", function( e ) {
				self.document.loadPath( e.path );
			} );
			this.docnav.on( "navmenu.dblclick", function( e ) {
				self.document.openWindow();
			} );

			this.docnav.selectDefaultNavmenu();

			this.apinav.on( "navmenu.select", function( e ) {
				self.api.loadPath( e.path );
			} );

			this.apinav.on( "navmenu.dblclick", function() {
				self.api.openWindow();
			} );

			var loadAPIFlag = false,
				navMap = [ this.docnav, this.apinav ];
			var $swapview = $( this.view.topElement ).find( "#contentview" ).on( "change", function( e ) {
				location.setHash( "tab", e.index );
				if ( e.index === 1 && loadAPIFlag === false ) {
					loadAPIFlag = true;
					self.apinav.selectDefaultNavmenu();
				}

				navMap[ e.index ].active();
				navMap[ e.originIndex ].deactive();

			} );

			var $tabview = $( "#tabview" );
			$tabview.on( "tabview.select", function( e ) {
				$swapview.uiSwapview( "render", e.index );
			} );

			if ( location.getHash( "tab" ) != null ) {
				$tabview.uiTabview( "render", parseInt( location.getHash( "tab" ) ) || 0 );
			}
		},
		destroy: function() {
			$( this.view.topElement ).find( "#contentview" ).clearHandlers();
			this.docnav.clearHandlers();
			this.apinav.clearHandlers();
			SuperController.invoke( "destroy" );
		}
	}, {

	} );

	return Controller;
} );