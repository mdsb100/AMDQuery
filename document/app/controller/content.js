aQuery.define( "@app/controller/content", [ "base/client", "app/Controller", "@app/view/content" ], function( $, client, SuperController, ContentView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, new ContentView( contollerElement ) );

    },
    onReady: function( ) {
      var $content = $( this.view.topElement ).find( "#content" );

      this.$content = $content;

    },
    onDestroy: function( ) {

    },
    loadPath: function( path ) {
      this.$content.src( {
        src: path
      } )
    },
    openWindow: function( ) {
      var src = this.$content.attr( "src" );
      src && window.open( src );
    }
  }, {

  } );

  return Controller;
} );