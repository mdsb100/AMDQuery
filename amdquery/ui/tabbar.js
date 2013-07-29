myQuery.define( "ui/tabbar", [
    "module/Widget",
    "ui/button",
    "main/query",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/src"
  ],
  function( $, Widget, Button, query, cls, event, dom, attr, src ) {
    "use strict"; //启用严格模式

    src.link( {
      href: $.getPath( "ui/css/tabbar", ".css" )
    } );

    var tabbar = Widget.extend( "ui.tabbar", {
      container: null,
      event: function( ) {},
      _initHandler: function( ) {
        var self = this;
        this.event = function( e ) {
          self.$tabButtons.uiTabbutton( "option", "select", false );
          $( this ).uiTabbutton( "option", "select", true );

          var para = {
            type: self.getEventName( "click" ),
            container: self.container,
            target: self.target[ 0 ],
            tabButton: this,
            event: e
          };

          self.target.trigger( para.type, self.target[ 0 ], para );
        };
        return this;
      },
      enable: function( ) {
        this.disable( );
        this.$tabButtons.on( "tabbutton.click", this.event );
        this.options.disabled = true;
        return this;
      },
      disable: function( ) {
        this.$tabButtons.off( "tabbutton.click", this.event );
        this.options.disabled = false;
        return this;
      },
      init: function( opt, target ) {
        this._super( opt, target );

        target.css( {
          "border-top": "1px solid black",
          "border-bottom": "1px solid black",
          "border-right": "1px solid black",
          "float": "left"
        } );

        this.$tabButtons = target.find( "*[ui-tabbutton]" );

        this._initHandler( ).enable( );

        return this;
      },
      customEventName: [ ],
      options: {

      },
      getter: {

      },
      setter: {

      },
      publics: {

      },
      target: null,
      toString: function( ) {
        return "ui.tabbar";
      },
      widgetEventPrefix: "tabbar"
    } );

    //提供注释
    $.fn.uiTabbar = function( a, b, c, args ) {
      return tabbar.apply( this, arguments );
    };

    return tabbar;
  } );