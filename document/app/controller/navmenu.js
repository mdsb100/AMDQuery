aQuery.define( "@app/controller/navmenu", [ "app/Controller", "@app/view/navmenu" ], function( $, SuperController, NavmenuView, undefined ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement ) {
      this._super( new NavmenuView( contollerElement ) );

      var controller = this;
      this.$nav = $( this.view.topElement ).find( "#nav" );

      var ret = this.$nav.uiNavmenu( "getNavItemsByHtml", "about AQuery" );

      ret = this.$nav.uiNavmenu( "getNavItemsByHtmlPath", [ "guide", "about AQuery" ] );

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
    selectDefaultNavmenu: function( ) {
      this.$nav.uiNavmenu( "selectNavItem", "index_navmenu" );
    },
    onDestroy: function( ) {
      this.$nav.clearHandlers( );
      this.$nav = null;
    }
  }, {

  } );

  return Controller;
} );