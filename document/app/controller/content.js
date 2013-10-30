aQuery.define( "@app/controller/content", [ "base/client", "app/Controller", "@app/view/content" ], function( $, client, SuperController, ContentView ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement ) {
      this._super( new ContentView( contollerElement ) );
      var $content = $( this.view.topElement ).find( "#content" );

      this.$content = $content;
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