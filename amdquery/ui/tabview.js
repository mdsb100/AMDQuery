aQuery.define( "ui/tabview", [
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "module/Widget",
    "ui/tabbar",
    "ui/tabbutton"
  ],
  function( $, query, cls, event, css, position, dom, attr, Widget, tabbar, tabbutton ) {
    "use strict"; //启用严格模式

    // Widget.fetchCSS( "ui/css/tabview" );

    var tabview = Widget.extend( "ui.tabview", {
      container: null,
      event: function( ) {},
      _initHandler: function( ) {
        var self = this,
          opt = this.options;
        this.tabviewEvent = function( e ) {
          self.selectView( e.index );
        };
        return this;
      },
      enable: function( ) {
        this.disable( );
        this.$tabBar.on( "tabbar.click", this.tabviewEvent );
        this.options.disabled = false;
        return this;
      },
      disable: function( ) {
        this.$tabBar.off( "tabbar.click", this.tabviewEvent );
        this.options.disabled = true;
        return this;
      },
      render: function( ) {
        var opt = this.options;

        this.selectView( opt.index );

        this.selectTabbutton( opt.index );
      },
      selectTabbutton: function( index ) {
        this.$tabBar.uiTabbar( index );

        this.options.index = index;
      },
      selectView: function( index ) {
        var originIndex = this.options.index;
        this.$view.hide( ).eq( index ).show( );
        this.options.index = index;

        if ( index !== originIndex ) {
          var activeView = this.$view.eq( index ),
            deactiveView = this.$view.eq( originIndex );

          deactiveView.trigger( "deactive", deactiveView[ 0 ], {
            type: "deactive"
          } );

          activeView.trigger( "active", activeView[ 0 ], {
            type: "active"
          } );

          var eventName = this.getEventName( "select" );

          this.target.trigger( eventName, this.target[ 0 ], {
            type: eventName,
            index: index
          } );
        }
      },
      init: function( opt, target ) {
        this._super( opt, target );

        var $tabBar = target.children( "div[amdquery-widget*='ui.tabbar']" );

        $tabBar.uiTabbar( );

        this.$tabBar = $tabBar;

        this.$view = target.children( ).filter( function( ) {
          return this === $tabBar[ 0 ];
        } );

        this.options.index = $tabBar.uiTabbar( "option", "index" );

        this._initHandler( ).enable( ).render( );

        return this;
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

      },
      target: null,
      toString: function( ) {
        return "ui.tabview";
      },
      widgetEventPrefix: "tabview"
    } );

    return tabview;
  } );