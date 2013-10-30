aQuery.define( "@app/controller/navmenu", [ "app/Controller", "@app/view/navmenu" ], function( $, SuperController, NavmenuView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement ) {
      this._super( new NavmenuView( contollerElement ) );

    },
    onReady: function( ) {
      var controller = this;
      this.$nav = $( this.view.topElement ).find( "#nav" );

      this.$nav.on( "navmenu.select", function( e ) {
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
      } ).on( "dblclick", function( e ) {
        controller.trigger( "navmenu.dblclick", controller, {
          type: "navmenu.dblclick",
          event: e
        } );
      } );

    },
    selectDefaultNavmenu: function( target ) {
      var ret = "index_navmenu";
      if ( target ) {
        var navItem = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", target.split( /\W/ ) )[ 0 ];
        ret = navItem || ret;
      }
      this.$nav.uiNavmenu( "selectNavItem", ret );
    },
    onDestroy: function( ) {
      this.$nav.clearHandlers( );
      this.$nav = null;
    }
  }, {

  } );

  return Controller;
} );