aQuery.define( "ui/tabbutton", [
    "module/Widget",
    "ui/button",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "html5/css3"
  ],
  function( $, Widget, Button, query, cls, event, css, position, dom, css3, src ) {
    "use strict"; //启用严格模式

    Widget.fetchCSS( "ui/css/tabbutton" );

    var tabbutton = Button.extend( "ui.tabbutton", {
      options: {
        defaultCssName: "aquery-defaultTabButton",
        selectCssName: "aquery-selectTabButton",
        select: false,
        text: "",
        title: ""
      },
      getter: {
        defaultCssName: 1,
        selectCssName: 1,
        select: 1,
        text: 1,
        title: 1
      },
      setter: {
        defaultCssName: 1,
        selectCssName: 1,
        select: 1,
        text: 1,
        title: 1
      },
      publics: {
        select: Widget.AllowPublic,
        toggle: Widget.AllowPublic
      },
      _initHandler: function( ) {
        this.event = this._getInitHandler( Button, this );
        return this;
      },
      select: function( ) {
        this.options.select = true;
        return this.change( );
      },
      toggle: function( ) {
        var opt = this.options;
        opt.select = !opt.select;
        return this.change( );
      },
      change: function( ) {
        var opt = this.options;

        if ( opt.select == true ) {
          this.target.removeClass( opt.defaultCssName ).addClass( opt.selectCssName );
        } else {
          this.target.removeClass( opt.selectCssName ).addClass( opt.defaultCssName );
        }
        return this;
      },
      render: function( ) {
        Button.invoke( "render", this );
        var opt = this.options;
        if ( this.defaultCssName != opt.defaultCssName ) {
          this.defaultCssName = opt.defaultCssName;
          this.target.removeClass( this.defaultCssName );
        }
        if ( this.selectCssName != opt.selectCssName ) {
          this.selectCssName = opt.selectCssName;
          this.target.removeClass( this.selectCssName );
        }

        this.change( );
        return this;
      },
      init: function( opt, target ) {
        this._super( opt, target );
        opt = this.options;

        target.addClass( "aquery-tabButton" );

        this.defaultCssName = opt.defaultCssName;
        this.selectCssName = opt.selectCssName;
        return this;
      },
      toString: function( ) {
        return "ui.tabbutton";
      },
      widgetEventPrefix: "tabbutton",
      initIgnore: true
    } );

    //提供注释
    $.fn.uiTabbutton = function( a, b, c, args ) {
      return tabbutton.apply( this, arguments );
    };

    return tabbutton;
  } );