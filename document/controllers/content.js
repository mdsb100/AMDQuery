aQuery.define( "@app/controllers/content", [ "base/client", "module/src", "app/Controller", "@app/views/content" ], function( $, client, src, SuperController, ContentView ) {
	"use strict"; //启用严格模式
	var Controller = SuperController.extend( {
		init: function( contollerElement, models ) {
			this._super( new ContentView( contollerElement ), models );
			var $content = $( this.view.topElement ).find( "iframe" );

			this.$content = $content;
		},
		loadPath: function( path ) {
			if ( this.getSrc() !== path ) {
				this.$content.src( {
					src: path,
					history: false
				} );
			}
		},
		getSrc: function() {
			return this.$content.attr( "src" );
		},
		openWindow: function() {
			var src = this.getSrc();
			src && window.open( src );
		}
	}, {

	} );

	return Controller;
} );