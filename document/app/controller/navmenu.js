aQuery.define( "@app/controller/navmenu", [ "hash/locationHash", "app/Controller", "@app/view/navmenu" ], function( $, locationHash, SuperController, NavmenuView ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement, models ) {
      this._super( new NavmenuView( contollerElement ), models );

      var controller = this;
      this.$nav = $( this.view.topElement ).find( "#nav" );

      this.$nav.on( "navmenu.select", function( e ) {
        var target = $( e.navitem ),
          ret = target.uiNavitem( "getOptionToRoot" ),
          path;
        if ( ret.length > 1 ) {
          ret.push( "source", "asset" );

          path = $.pagePath + ret.reverse( ).join( "/" ) + ".html";

          if ( locationHash.scrollTo ) {
            path += "#scrollTo=" + locationHash.scrollTo;
          }

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
    destroy: function( ) {
      this.$nav.clearHandlers( );
      this.$nav = null;
      SuperController.invoke( "destroy" );
    }
  }, {

  } );

  return Controller;
} );