aQuery.define( "@app/controllers/index", [
  "module/location",
  "app/Controller",
  "@app/views/index",
  "@app/controllers/docnav",
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

			this.docnav.selectDefaultNavmenu( location.getHash( "navmenu" ) );

			// this.api.loadPath( "/document/api/index.html" );

			var $swapview = $( this.view.topElement ).find( "#contentview" );

			$.on( "document_iframe.swapIndexChange", function( e ) {
				location.removeHash( "scrollTo" );
				location.setHash( "swapIndex", e.index );
			} );

			$.on( "document_iframe.scrollToChange", function( e ) {
				location.setHash( "scrollTo", e.name );
			} );

			var loadAPIFlag = false;
			var $tabview = $( "#tabview" );
			$tabview.on( "tabview.select", function( e ) {
				$swapview.uiSwapview( "render", e.index, function() {
					location.setHash( "tab", e.index );
					if ( e.index === 1 && loadAPIFlag === false ) {
						loadAPIFlag = true;
						self.api.loadPath( "assets/api/index.html" );
					}
				} );
			} );

			if ( location.getHash( "tab" ) != null ) {
				$tabview.uiTabview( "render", parseInt( location.getHash( "tab" ) ) || 0 );
			}
		},
		destroy: function() {
			this.docnav.clearHandlers();
			SuperController.invoke( "destroy" );
		}
	}, {

	} );

	return Controller;
} );