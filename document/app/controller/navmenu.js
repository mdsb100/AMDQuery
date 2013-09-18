aQuery.define( "@app/controller/navmenu", [ "app/Controller", "@app/view/navmenu" ], function( $, SuperController, NavmenuView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( id, contollerElement ) {
      this._super( id, contollerElement, NavmenuView );

    },
    onReady: function( ) {
      var controller = this;
      var $nav = $( this.view.topElement ).find( "#nav" );

      $nav.on( "navmenu.select", function( e ) {
        var target = $( e.navitem ),
          ret = target.uiNavitem( "getOptionToRoot" ),
          path;
        if ( ret.length > 1 ) {
          ret.push( "document", ".." );
          path = $.getPath( ret.reverse( ).join( "/" ), ".html" );
          controller.trigger( "navmenu.select", controller, {
            type: "navmenu.select",
            path: path
          } );
        }
      } );

      $nav.on( "dblclick", function( e ) {
        controller.trigger( "navmenu.dblclick", controller, {
          type: "navmenu.dblclick",
          event: e
        } );
      } );

    },
    onDestroy: function( ) {
      var $nav = $( this.view.topElement ).find( "#nav" );
      $nav.clearHandlers( );
      $nav = null;
    }
  }, {

  } );

  return Controller;
} );