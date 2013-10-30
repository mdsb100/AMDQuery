aQuery.define( "ui/navmenu", [
    "base/typed",
    "base/extend",
    "ui/navitem",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "ecma5/array.compati"
  ],
  function( $, typed, utilExtend, NavItem, Widget, query, cls, event, css, position, dom, attr, Array ) {
    "use strict"; //启用严格模式

    Widget.fetchCSS( "ui/css/navmenu" );

    var navmenu = Widget.extend( "ui.navmenu", {
      container: null,
      event: function( ) {},
      _initHandler: function( ) {
        var self = this;
        this.event = function( e ) {
          var para = utilExtend.extend( {}, e ),
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
              self.changeSelectedNavItem( e.target );
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
        return this.navItemList.filter( function( ele ) {
          return $( ele ).uiNavitem( "option", "html" ) === str;
        } );
      },
      getNavItemsByHtmlPath: function( strList ) {
        var ret = this.getNavItemsByHtml( strList.pop( ) ),
          str = "";
        ret.filter( function( ele ) {
          for ( var i = strList.length - 1, parent; i >= 0; i-- ) {
            str = strList[ i ];
            parent = $( ele ).uiNavitem( "option", "parent" );

            if ( !parent || parent.uiNavitem( "option", "html" ) !== str ) {
              return false;
            }
          }
          return true;
        } );

        return ret;
      },
      getNavItem: function( item ) {
        var ret = null,
          i = 0,
          len = this.navItemList.length,
          ele,
          checkFn;

        if ( typed.isStr( item ) ) {
          checkFn = function( ele, item ) {
            return attr.getAttr( ele, "id" ) === item;
          };
        } else if ( typed.is$( item ) ) {
          checkFn = function( ele, item ) {
            return ele === item[ 0 ];
          };
        } else if ( Widget.is( "ui.navmenu", item ) ) {
          checkFn = function( ele, item ) {
            return $( ele ).navitem( "equals", item );
          };
        } else if ( typed.isEle( item ) ) {
          checkFn = function( ele, item ) {
            return ele === item
          };
        } else {
          return null;
        }

        for ( i = 0; i < len; i++ ) {
          ele = this.navItemList[ i ];
          if ( checkFn( ele, item ) ) {
            ret = ele;
            break;
          }
        }

        return ret;
      },
      getNavItemList: function( ) {
        return this.target.find( "li[ui-navitem]" ).reverse( ).eles;
      },
      detectNavItemList: function( ) {
        this.navItemList = this.getNavItemList( );
      },
      selectNavItem: function( target ) {
        var $target = $( this.getNavItem( target ) || [ ] ),
          opt = this.options;
        if ( $target.isWidget( "ui.navitem" ) ) {
          if ( opt.selectedNavItem && opt.selectedNavItem !== target ) {
            $( opt.selectedNavItem ).uiNavitem( "cancel" );
          }
          $target.uiNavitem( "select" );
          opt.selectedNavItem = $target;
        }
      },
      changeSelectedNavItem: function( target ) {
        var $target = $( this.getNavItem( target ) || [ ] ),
          opt = this.options;
        if ( $target.isWidget( "ui.navitem" ) ) {
          if ( opt.selectedNavItem && opt.selectedNavItem !== target ) {
            $( opt.selectedNavItem ).uiNavitem( "cancel" );
          }
          opt.selectedNavItem = $target;

          var para = {
            navitem: target
          }, type;

          type = para.type = this.getEventName( "select" );
          this.target.trigger( type, this.target[ 0 ], para );
        }
      },
      init: function( opt, target ) {
        this._super( opt, target );
        target.addClass( "aquery-navmenu" );

        this.navItemList = [ ];
        this.$parent = null;
        this.detectNavItemList( );
        $( this.navItemList ).uiNavitem( );

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
        getNavItemsByHtmlPath: Widget.AllowReturn,
        getNavItem: Widget.AllowReturn,
        detectNavItemList: Widget.AllowPublic,
        selectNavItem: Widget.AllowPublic,
        changeSelectedNavItem: Widget.AllowPublic
      },
      customEventName: [ "open", "close" ],
      target: null,
      toString: function( ) {
        return "ui.navmenu";
      },
      destroy: function( ) {
        $( this.navItemList ).destroyUiNavitem( );
        Widget.invoke( "destroy", this );
      },
      widgetEventPrefix: "navmenu"
    } );

    return navmenu;
  } );