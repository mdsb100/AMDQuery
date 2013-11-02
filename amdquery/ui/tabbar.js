aQuery.define( "ui/tabbar", [
    "base/typed",
    "module/Widget",
    "ui/tabbutton",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr"
  ],
  function( $, typed, Widget, tabbutton, query, cls, event, css, position, dom, attr ) {
    "use strict"; //启用严格模式

    Widget.fetchCSS( "ui/css/tabbar" );

    var tabbar = Widget.extend( "ui.tabbar", {
      container: null,
      event: function( ) {},
      _initHandler: function( ) {
        var self = this;
        this.event = function( e ) {
          var $button = $( this );
          self.select( $button );
          var para = {
            type: self.getEventName( "click" ),
            container: self.container,
            target: self.target[ 0 ],
            tabButton: this,
            index: $button.index( ),
            event: e
          };

          self.target.trigger( para.type, self.target[ 0 ], para );
        };
        return this;
      },
      select: function( ele ) {
        var $button = typed.isNum( ele ) ? this.$tabButtons.eq( ele ) : $( ele );
        this.$tabButtons.uiTabbutton( "option", "select", false );
        $button.uiTabbutton( "option", "select", true );
      },
      render: function( ) {
        this.select( this.options.index );
      },
      getSelectionIndex: function( ) {
        var SelectionIndex = 0
        this.$tabButtons.each( function( ele, index ) {
          if ( $( ele ).uiTabbutton( "option", "select" ) ) {
            SelectionIndex = index;
            return false
          }
        } );
        return SelectionIndex;
      },
      enable: function( ) {
        this.disable( );
        this.$tabButtons.on( "tabbutton.click", this.event );
        this.options.disabled = false;
        return this;
      },
      disable: function( ) {
        this.$tabButtons.off( "tabbutton.click", this.event );
        this.options.disabled = true;
        return this;
      },
      init: function( opt, target ) {
        this._super( opt, target );

        this.target.css( {
          "border-top": "1px solid black",
          "border-bottom": "1px solid black",
          "border-right": "1px solid black"
        } );

        this.target.addClass( "aquery-tabbar" );

        this.$tabButtons = target.find( "*[amdquery-widget*='ui.tabbutton']" );

        this.$tabButtons.uiTabbutton( );

        this.options.index = this.getSelectionIndex( );

        this._initHandler( ).enable( ).render( );

        return this;
      },
      customEventName: [ "click" ],
      options: {
        index: 0
      },
      getter: {

      },
      setter: {

      },
      publics: {
        select: Widget.AllowPublic,
        getSelectionIndex: Widget.AllowReturn
      },
      target: null,
      toString: function( ) {
        return "ui.tabbar";
      },
      widgetEventPrefix: "tabbar"
    } );

    return tabbar;
  } );