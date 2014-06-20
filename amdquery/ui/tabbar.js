aQuery.define( "ui/tabbar", [
    "base/typed",
    "module/Widget",
    "ui/tabbutton",
    "main/query",
    "main/class",
    "main/CustomEvent",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr"
  ],
  function( $, typed, Widget, tabbutton, query, cls, CustomEvent, event, css, position, dom, attr ) {
    "use strict";

    Widget.fetchCSS( "ui/css/tabbar" );

    var tabbar = Widget.extend( "ui.tabbar", {
      container: null,
      event: function() {},
      _initHandler: function() {
        var self = this;
        this.tabbarEvent = function( e ) {
          var $button = $( this );
          self.select( $button );

          self.target.trigger( CustomEvent.createEvent( self.getEventName( "click" ), self.target[ 0 ], {
            container: self.container,
            tabButton: this,
            index: $button.index(),
            event: e
          } ) );
        };
        return this;
      },
      select: function( ele ) {
        var $button = typed.isNumber( ele ) ? this.$tabButtons.eq( ele ) : $( ele );
        this.options.index = $button.index();
        this.$tabButtons.uiTabbutton( "option", "select", false );
        $button.uiTabbutton( "option", "select", true );
      },
      render: function( index ) {
        this.select( index || this.options.index );
      },
      getSelectionIndex: function() {
        var SelectionIndex = 0;
        this.$tabButtons.each( function( ele, index ) {
          if ( $( ele ).uiTabbutton( "option", "select" ) ) {
            SelectionIndex = index;
            return false;
          }
        } );
        return SelectionIndex;
      },
      enable: function() {
        this.disable();
        this.$tabButtons.on( "tabbutton.click", this.tabbarEvent );
        this.options.disabled = false;
        return this;
      },
      disable: function() {
        this.$tabButtons.off( "tabbutton.click", this.tabbarEvent );
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

        this._initHandler();

        this.target.addClass( "aquery-tabbar" );

        this.detect();

        return this;
      },
      destroy: function() {
        this.$tabButtons.destroyTabbutton();
        Widget.invoke( "destroy", this );
      },
      detect: function() {
        this.$tabButtons = this.target.find( "*[amdquery-widget*='ui.tabbutton']" );

        this.$tabButtons.uiTabbutton();

        this.options.index = this.getSelectionIndex();

        return this.able().render();
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
      toString: function() {
        return "ui.tabbar";
      },
      widgetEventPrefix: "tabbar"
    } );

    return tabbar;
  } );