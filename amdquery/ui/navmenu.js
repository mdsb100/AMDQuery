aQuery.define( "ui/navmenu", [
    "base/typed",
    "base/extend",
    "ui/navitem",
    "module/Widget",
    "main/query",
    "main/class",
    "main/CustomEvent",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "ecma5/array"
  ],
  function( $, typed, utilExtend, NavItem, Widget, query, cls, CustomEvent, event, css, position, dom, attr, uitlArray ) {
    "use strict";

    Widget.fetchCSS( "ui/css/navmenu" );

    var navmenu = Widget.extend( "ui.navmenu", {
      container: null,
      _initHandler: function() {
        var self = this;
        this.navmenuEvent = function( e ) {
          var para = utilExtend.extend( {}, e ),
            type,
            target;
          target = para.target = self.target[ 0 ];

          para.navitem = e.target;

          switch ( e.type ) {
            case "navitem.open":
              type = para.type = self.getEventName( "open" );
              self.target.trigger( type, target, para );
              break;
            case "navitem.close":
              type = para.type = self.getEventName( "close" );
              self.target.trigger( type, target, para );
              break;
            case "navitem.select":
              self.selectNavItem( e.target );
              break;
          }
        };
        return this;
      },
      changeHandler: function( $ele, fun, type ) {
        $ele[ type ]( "navitem.open", fun );
        $ele[ type ]( "navitem.close", fun );
        $ele[ type ]( "navitem.select", fun );
      },
      enable: function() {
        var fun = this.navmenuEvent;

        this.changeHandler( $( this.navItemList ), fun, "on" );

        this.options.disabled = false;
        return this;
      },
      disable: function() {
        var fun = this.navmenuEvent;

        this.changeHandler( $( this.navItemList ), fun, "off" );

        this.options.disabled = true;
        return this;
      },
      getNavItemsByHtml: function( str ) {
        return this.navItemList.filter( function( ele ) {
          return $( ele ).uiNavitem( "option", "html" ) === str;
        } );
      },
      getNavItemsByHtmlPath: function( strList ) {
        var ret = this.getNavItemsByHtml( strList.pop() ),
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

        if ( typed.isString( item ) ) {
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
        } else if ( typed.isElement( item ) ) {
          checkFn = function( ele, item ) {
            return ele === item;
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
      getNavItemList: function() {
        return this.target.find( "li[ui-navitem]" ).reverse().eles;
      },
      selectNavItem: function( target, isTrigger ) {
        var $target = $( this.getNavItem( target ) || [] ),
          opt = this.options;
        if ( $target.isWidget( "ui.navitem" ) ) {
          if ( opt.selectedNavItem && opt.selectedNavItem !== target ) {
            $( opt.selectedNavItem ).uiNavitem( "cancel" );
          }

          if ( !opt.selectedNavItem || opt.selectedNavItem !== target ) {
            opt.selectedNavItem = target;
            $target.uiNavitem( "select" );

            if ( isTrigger === undefined ) {
              isTrigger = true;
            }
            if ( isTrigger ) {
              this.target.trigger( CustomEvent.createEvent( this.getEventName( "select" ), this.target[ 0 ], {
                navitem: target
              } ) );
            }
          }
        }
      },
      init: function( opt, target ) {
        this._super( opt, target );
        target.addClass( "aquery-navmenu" );

        this.navItemList = this.getNavItemList();

        $( this.navItemList ).uiNavitem();

        this._initHandler().enable().render();

        return this;
      },
      refreshNavItem: function() {
        this.navItemList = this.getNavItemList();
        var $navItemList = $( this.navItemList );
        $navItemList.uiNavitem();
        this.able();
      },
      detect: function() {
        this.refreshNavItem();
      },
      addNavItem: function( navitems, navitemParent ) {
        var $navitems = $( navitems );
        $( navitemParent || this.target ).children( "ul" ).append( $navitems );
        this.navItemList = this.getNavItemList();
        if ( !this.options.disabled ) {
          this.changeHandler( $navitems, this.navmenuEvent, "on" );
        }
      },
      removeNavItem: function( navitems ) {
        var $navitems = $( navitems );
        this.changeHandler( $navitems, this.navmenuEvent, "off" );
        $navitems.uiNavitem( "destroy" );
        $navitems.remove();
        this.navItemList = this.getNavItemList();
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
        selectNavItem: Widget.AllowPublic,
        refreshNavItem: Widget.AllowPublic,
        addNavItem: Widget.AllowPublic,
        removeNavItem: Widget.AllowPublic
      },
      customEventName: [ "open", "close" ],
      target: null,
      toString: function() {
        return "ui.navmenu";
      },
      destroy: function() {
        $( this.navItemList ).destroyUiNavitem();
        Widget.invoke( "destroy", this );
      },
      widgetEventPrefix: "navmenu"
    } );

    return navmenu;
  } );