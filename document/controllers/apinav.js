aQuery.define( "@app/controllers/apinav", [ "main/attr", "module/history", "app/Controller", "@app/views/apinav" ], function( $, attr, history, SuperController, NavmenuView ) {
  "use strict"; //启用严格模式
  var APINAVMENUKEY = "apiNavmenuKey";

  var Controller = SuperController.extend( {
    init: function( contollerElement, models ) {
      this._super( new NavmenuView( contollerElement ), models );
      this.hash = {};
      this.APINAVMENUKEY = APINAVMENUKEY;
      var controller = this;
      this.$nav = $( this.view.topElement ).find( "#apinav" );

      this.$nav.on( "navmenu.select", function( e ) {
        var link = attr.getAttr( e.navitem, "link" );
        if ( link ) {
          controller.linkTo( link );
          history.addByKeyValue( APINAVMENUKEY, link );
        }
      } ).on( "dblclick", function( e ) {
        controller.trigger( "navmenu.dblclick", controller, {
          type: "navmenu.dblclick",
          event: e
        } );
      } );

      this.handleIframeChange = function( e ) {
        history.addByKeyValue( APINAVMENUKEY, e.href );
      };

      $.on( "api_iframe.hrefChange", this.handleIframeChange );

      history.on( APINAVMENUKEY + ".change", function( e ) {
        controller.selectDefaultNavmenu( e.token );
      } );

    },
    activate: function() {

    },
    deactivate: function() {

    },
    linkTo: function( link ) {
      this.trigger( "navmenu.select", this, {
        type: "navmenu.select",
        path: "assets/api/" + link
      } );
    },
    _getPath: function( navitem, swapIndex, scrollTo ) {

      return path;
    },
    findLink: function( target ) {
      target = target.split( "#" );
      var navitem = this.$nav.find( "li[link='" + target[ 0 ] + "']" );
      return navitem.length ? navitem[ 0 ] : null;
    },
    selectDefaultNavmenu: function( target ) {
      var src = target || "index.html";
      var navitem = this.findLink( src );
      if ( navitem ) {
        this.$nav.uiNavmenu( "selectNavItem", navitem, false );
      }
      this.linkTo( src );
      return navitem;
    },
    destroy: function() {
      this.$nav.clearHandlers();
      this.$nav = null;
      $.off( "api_iframe.hrefChange", this.handleIframeChange );
      SuperController.invoke( "destroy" );
    }
  }, {

  } );

  return Controller;
} );