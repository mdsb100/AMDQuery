myQuery.define( "ui/navmenu", [
    "ui/navitem",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src"
  ],
  function( $, NavItem, Widget, query, cls, event, dom, attr, src ) {
    "use strict"; //启用严格模式

    src.link( {
      href: $.getPath( "ui/css/navmenu", ".css" )
    } );

    var navmenu = Widget.extend( "ui.navmenu", {
      container: null,
      event: function( ) {},
      _initHandler: function( ) {
        var self = this;
        this.event = function( e ) {
          var para = $.extend( {}, e ),
            type,
            target;
          target = para.target = self.target[ 0 ];

          para.navitem = e.target;

          switch ( e.type ) {
            case "navitem.open":
              type = para.type = self.getEventName( "open" );
              self.target.trigger( type, target[ 0 ], para );
              break;
            case "navitem.close":
              type = para.type = self.getEventName( "close" );
              self.target.trigger( type, target[ 0 ], para );
              break;
            case "navitem.select":
              type = para.type = self.getEventName( "select" );
              self.changeSelectedNavItem( e.target );
              self.target.trigger( type, target[ 0 ], para );
              break;
          }
        };
        return this;
      },
      enable: function( ) {
        var fun = this.event,
        i = 0,
        len = this.navItemList.length,
        ele;
        for ( i = 0; i < len; i++ ) {
          ele = $( this.navItemList[ i ] );
          ele.on( "navitem.open", fun );
          ele.on( "navitem.close", fun );
          ele.on( "navitem.select", fun );
        }
        this.options.disabled = true;
        return this;
      },
      disable: function( ) {
        var fun = this.event,
        i = 0,
        len = this.navItemList.length,
        ele;
        for ( i = 0; i < len; i++ ) {
          ele = $( this.navItemList[ i ] );
          ele.off( "navitem.open", fun );
          ele.off( "navitem.close", fun );
          ele.on( "navitem.select", fun );
        }
        this.options.disabled = false;
        return this;
      },
      getNavItemsByHtml: function( str ) {
        var ret = [ ],
          i = 0,
          len = this.navItemList.length,
          ele,
          html;
        for ( i = 0; i < len; i++ ) {
          ele = this.navItemList[ i ];
          html = $( ele ).navitem( "option", "html" );
          if ( html === str ) {
            ret.push( ele );
          }
        }
        return ret;
      },
      getNavItem: function( item ) {
        var ret, i = 0,
          len = this.navItemList.length,
          ele;
        if ( $.isStr( item ) ) {
          for ( i = 0; i < len; i++ ) {
            ele = this.navItemList[ i ];
            if ( $.attr( ele, "id" ) === item ) {
              ret = ele;
              break;
            }
          }
        } else if ( $.Widget.is( item, "navmenu" ) ) {
          for ( i = 0; i < len; i++ ) {
            ele = this.navItemList[ i ];
            if ( $( ele ).navitem( "equals", item ) ) {
              ret = ele;
              break;
            }
          }
        } else if ( $.isEle( item ) ) {
          for ( i = 0; i < len; i++ ) {
            ele = this.navItemList[ i ];
            if ( ele === item ) {
              ret = ele;
              break;
            }
          }
        }
        return ret;
      },
      getNavItemList: function( ) {
        return this.target.find( "li[ui-navitem]" ).reverse( );
      },
      detectNavItemList: function( ) {
        this.navItemList = this.getNavItemList( );
      },
      selectedNavItem: function( target ) {
        var $target = $( target ),
          opt = this.options;
        if ( Widget.is( $target, "ui.navitem" ) ) {
          if ( opt.selectedNavItem && opt.selectedNavItem !== target ) {
            $( opt.selectedNavItem ).uiNavitem( "cancel" );
          }
          $target.uiNavitem( "select" );
          opt.selectedNavItem = target;
        }
      },
      changeSelectedNavItem: function( target ) {
        var $target = $( target ),
          opt = this.options;
        if ( Widget.is( $target, "ui.navitem" ) ) {
          if ( opt.selectedNavItem && opt.selectedNavItem !== target ) {
            $( opt.selectedNavItem ).uiNavitem( "cancel" );
          }
          opt.selectedNavItem = target;
        }
      },
      init: function( opt, target ) {
        this._super( opt, target );
        target.addClass( "navmenu" );

        this.navItemList = [ ];
        this.$parent = null;
        this.detectNavItemList( );

        this._initHandler( ).enable( ).render( );

        return this;
      },
      options: {
        selectedNavItem: null
      },
      setter: {
        selectedNavItem: 0
      },
      publics: {
        getNavItemsByHtml: Widget.AllowReturn,
        getNavItem: Widget.AllowReturn,
        detectNavItemList: Widget.AllowPublic,
        selectedNavItem: Widget.AllowPublic,
        changeSelectedNavItem: Widget.AllowPublic
      },
      customEventName: [ "open", "close" ],
      target: null,
      toString: function( ) {
        return "ui.navmenu";
      },
      widgetEventPrefix: "navmenu"
    } );

    return navmenu;
  } );