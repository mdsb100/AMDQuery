aQuery.define( "ui/tabview", [
    "base/typed",
    "main/query",
    "main/class",
    "main/CustomEvent",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "module/Widget",
    "ui/tabbar",
    "ui/tabbutton"
  ],
  function( $, typed, query, cls, CustomEvent, event, css, position, dom, attr, Widget, tabbar, tabbutton ) {
    "use strict";

    // Widget.fetchCSS( "ui/css/tabview" );

    var tabview = Widget.extend( "ui.tabview", {
      container: null,
      event: function() {},
      _initHandler: function() {
        var self = this,
          opt = this.options;
        this.tabviewEvent = function( e ) {
          switch ( e.type ) {
            case Widget.detectEventName:
              self.detect();
              self.$tabBar.uiTabbar( "detect" );
              break;
            case "tabbar.click":
              self.selectView( e.index );
              break;
          }

        };
        return this;
      },
      enable: function() {
        this.disable();
        this.$tabBar.on( "tabbar.click", this.tabviewEvent );
        this.target.on( Widget.detectEventName, this.tabviewEvent );
        this.options.disabled = false;
        return this;
      },
      disable: function() {
        this.$tabBar.off( "tabbar.click", this.tabviewEvent );
        this.target.off( Widget.detectEventName, this.tabviewEvent );
        this.options.disabled = true;
        return this;
      },
      render: function( index ) {
        var opt = this.options;

        this.selectView( typed.isNumber( index ) ? index : opt.index );

      },
      selectTabbutton: function( index ) {
        this.$tabBar.uiTabbar( "option", "index", index );
      },
      selectView: function( index ) {
        var originIndex = this.options.index;
        this.$view.hide().eq( index ).show();
        this.options.index = index;

        if ( index !== originIndex ) {
          this.selectTabbutton( index );

          var activateView = this.$view.eq( index ),
            deactivateView = this.$view.eq( originIndex );

          deactivateView.trigger( CustomEvent.createEvent( "deactivated", deactivateView[ 0 ] ) );

          activateView.trigger( CustomEvent.createEvent( "activated", activateView[ 0 ] ) );

          this.target.trigger( CustomEvent.createEvent( this.getEventName( "select" ), this.target[ 0 ], {
            index: index
          } ) );
        }
      },
      init: function( opt, target ) {
        this._super( opt, target );

        this._initHandler();

        this.detect();

        return this;
      },
      destroy: function() {
        this.$tabBar.destroyTabbar();
        Widget.invoke( "destroy", this );
      },
      detect: function() {
        var $tabBar = this.target.children( "div[amdquery-widget*='ui.tabbar']" );

        this.$tabBar = $tabBar;

        $tabBar.uiTabbar();

        this.$view = this.target.children().filter( function() {
          return this === $tabBar[ 0 ];
        } );

        this.options.index = $tabBar.uiTabbar( "option", "index" );

        return this.able().render();
      },
      customEventName: [ "select" ],
      options: {
        index: 0
      },
      getter: {

      },
      setter: {

      },
      publics: {
        selectView: Widget.AllowPublic
      },
      target: null,
      toString: function() {
        return "ui.tabview";
      },
      widgetEventPrefix: "tabview"
    } );

    return tabview;
  } );