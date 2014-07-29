aQuery.define( "ui/autocomplete", [
    "base/client",
    "base/typed",
    "module/Widget",
    "main/query",
    "main/class",
    "main/CustomEvent",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "main/parse",
    "html5/css3",
    "module/Keyboard",
    "html5/css3.position"
  ],

  function( $, client, typed, Widget, query, cls, CustomEvent, event, css, position, dom, attr, parse, css3, Keyboard ) {
    "use strict";

    Widget.fetchCSS( "ui/css/autocomplete" );

    var autoComplete = Widget.extend( "ui.autocomplete", {
      container: null,
      _initHandler: function() {
        var self = this;
        var EnterEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "enter"
          } ),
          EscapeEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "Escape"
          } );
        this.autoCompleteEvent = function( e ) {
          switch ( e.type ) {
            case "click":
              break;
            case "keyup:*":
              self.slideBar.show();
              self.render();
              break;
            case EnterEventName:

              break;
            case EscapeEventName:
              self.slideBar.hide();
              break;
          }
        };
        return this;
      },
      enable: function() {
        this.disable();
        this.keyboard.on( "keyup:*", this.autoCompleteEvent );
        this.keyboard.addKey( {
          type: "keyup",
          keyCode: [ "enter", "Escape" ],
          todo: this.autoCompleteEvent
        } );
        this.options.disabled = false;
        return this;
      },
      disable: function() {
        this.keyboard.off( "keyup:*", this.autoCompleteEvent );
        this.keyboard.removeKey( {
          type: "keyup",
          keyCode: [ "enter", "Escape" ],
          todo: this.autoCompleteEvent
        } );
        this.options.disabled = true;
        return this;
      },
      matchData: function() {

      },
      render: function( data ) {
        var opt = this.options;
        data = data || opt.data;
        return this;
      },
      init: function( opt, target ) {
        this._super( opt, target );

        this.keyboard = new Keyboard( this.target[ 0 ] );

        this.target.attr( "autocomplete", false );

        this.slideBar = $( $.createEle( "div" ) ).width( this.target.outerWidth() ).height( this.options.maxHeight ).css( {
          "position": "absolute",
          "left": this.target.getPositionX(),
          "top": this.target.getPositionY() + this.target.outerHeight(),
          "overflow": "hidden"
        } ).hide().addClass( "aquery-autoComplete-slideBar" ).appendTo( this.target.parent() );

        this._initHandler().enable().render();

        return this;
      },
      destory: function() {
        Widget.invoke( "destroy", this );
      },
      _setData: function( data ) {
        if ( typed.isObject( data ) ) {
          this.options.data = parse.JSON( data );
          this.render( this.options.data );
        }
      },
      _setMaxHeight: function( height ) {
        this.options.maxHeight = height;
        this.slideBar && this.slideBar.height( height );
      },
      customEventName: [ "press", "select", "cancel", "enter" ],
      options: {
        data: "",
        maxHeight: 100,
        letterNumber: 3
      },
      getter: {

      },
      setter: {

      },
      publics: {

      },
      target: null,
      toString: function() {
        return "ui.autocomplete";
      },
      widgetEventPrefix: "autocomplete"
    } );

    return autoComplete;
  } );