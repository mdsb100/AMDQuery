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
        var self = this,
          opt = this.options;
        var EnterEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "Enter"
          } ),
          enterEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "enter"
          } ),
          EscapeEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "Escape"
          } ),
          UpEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "Up"
          } ),
          DownEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "Down"
          } ),
          LeftEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "Left"
          } ),
          RightEventName = Keyboard.getHandlerName( {
            type: "keyup",
            keyCode: "Right"
          } );

        this.autoCompleteEvent = function( e ) {
          switch ( e.type ) {
            case "click":
              var li = event.document.getTarget( e ),
                key = li.innerHTML,
                value = opt.data[ key ];
              self.clear();
              self.selectSlideItem( li );
              self.target.trigger( CustomEvent.createEvent( self.getEventName( "click" ), self.target[ 0 ], {
                selectSlideItem: li,
                key: key,
                value: value
              } ) ).trigger( CustomEvent.createEvent( self.getEventName( "complete" ), self.target[ 0 ], {
                selectSlideItem: li,
                key: key,
                value: value
              } ) );
              break;
            case "keyup:*":
              self._setValue( self.target.val() );
              if ( self.checkValue() ) {
                self.$slideBar.show();
                self.render();
              } else {
                self.clear();
              }
              break;
            case EnterEventName:
            case enterEventName:
              var li = self.$slideBar.children()[ self.selectionItemIndex ];
              if ( !li ) {
                return;
              }
              var key = li.innerHTML,
                value = opt.data[ key ];
              self.clear();
              self.selectSlideItem( li );
              self.target.trigger( CustomEvent.createEvent( self.getEventName( "enter" ), self.target[ 0 ], {
                selectSlideItem: li,
                key: key,
                value: value
              } ) ).trigger( CustomEvent.createEvent( self.getEventName( "complete" ), self.target[ 0 ], {
                selectSlideItem: li,
                key: key,
                value: value
              } ) );
              break;
            case EscapeEventName:
              self._setValue( "" );
              self.clear();
              self.target.trigger( CustomEvent.createEvent( self.getEventName( "cancel" ), self.target[ 0 ] ) );
              break;
            case UpEventName:
              if ( self.selectionItemIndex > 0 ) {
                self.selectionItemIndex -= 1;
                var li = self.$slideBar.children()[ self.selectionItemIndex ],
                  key = li.innerHTML,
                  value = opt.data[ key ]
                self.selectSlideItem( li );
                self.target.trigger( CustomEvent.createEvent( self.getEventName( "select" ), self.target[ 0 ], {
                  selectSlideItem: li,
                  key: key,
                  value: value
                } ) );
              }
              break;
            case DownEventName:
              if ( self.selectionItemIndex < self.$slideBar.children().length ) {
                self.selectionItemIndex += 1;
                var li = self.$slideBar.children()[ self.selectionItemIndex ];
                self.selectSlideItem( li );
                self.target.trigger( CustomEvent.createEvent( self.getEventName( "select" ), self.target[ 0 ], {
                  selectSlideItem: li,
                  key: key,
                  value: value
                } ) );
              }
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
          keyCode: [ "enter", "Escape", "Up", "Down" ],
          todo: this.autoCompleteEvent
        } );
        this.$slideBar.delegate( "li", "click", this.autoCompleteEvent );
        this.options.disabled = false;
        return this;
      },
      disable: function() {
        this.keyboard.off( "keyup:*", this.autoCompleteEvent );
        this.keyboard.removeKey( {
          type: "keyup",
          keyCode: [ "enter", "Escape", "Up", "Down" ],
          todo: this.autoCompleteEvent
        } );
        this.$slideBar.off( "click", this.autoCompleteEvent );
        this.options.disabled = true;
        return this;
      },
      matchData: function( data ) {
        var opt = this.options,
          value = this.options.value,
          ret = [];
        if ( this.checkValue() ) {
          var reg = RegExp( "(.*" + value + "+.*)", !!opt.ignoreCase ? "im" : "m" );
          for ( var key in data ) {
            if ( reg.test( key ) ) {
              ret.push( RegExp.$1 );
            }
          }
        }
        return ret;
      },
      checkValue: function() {
        var value = this.options.value;
        return value && value.length >= this.options.letterNumber;
      },
      render: function() {
        var opt = this.options,
          list = this.matchData( this.options.data ),
          i = 0,
          len = list.length;
        this.$slideBar.children().remove();
        for ( ; i < len; i++ ) {
          $( $.createEle( "li" ) ).insertText( list[ i ] ).addClass( "aquery-autoComplete-slideItem" ).appendTo( this.$slideBar );
        };

        return this;
      },
      init: function( opt, target ) {
        this._super( opt, target );

        this.selectionItemIndex = -1;

        this.keyboard = new Keyboard( this.target[ 0 ] );

        this.target.attr( "autocomplete", false );

        this.$slideBar = $( $.createEle( "ul" ) ).width( this.target.outerWidth() ).height( this.options.maxHeight ).css( {
          "position": "absolute",
          "left": this.target.getPositionX(),
          "top": this.target.getPositionY() + this.target.outerHeight(),
          "overflow": "hidden",
          "zIndex": 100000
        } ).hide().addClass( "aquery-autoComplete-slideBar" ).appendTo( this.target.parent() );

        this._initHandler().enable().render();

        return this;
      },
      selectSlideItem: function( li ) {
        if ( query.contains( this.$slideBar[ 0 ], li ) ) {
          this.$slideBar.children().removeClass( "aquery-autoComplete-selection-slideItem" );
          $( li ).addClass( "aquery-autoComplete-selection-slideItem" );
          this._setValue( li.innerHTML );
        }
      },
      clear: function() {
        this.$slideBar.hide();
        this.selectionItemIndex = -1;
      },
      destory: function() {
        Widget.invoke( "destroy", this );
      },
      _setData: function( data ) {
        if ( typed.isObject( data ) ) {
          this.options.data = data;
        }
      },
      _setMaxHeight: function( height ) {
        this.options.maxHeight = height;
        this.$slideBar && this.$slideBar.height( height );
      },
      _setValue: function( text ) {
        this.target.val( text );
        this.options.value = text;
      },
      customEventName: [ "select", "cancel", "enter", "click", "complete" ],
      options: {
        data: {},
        maxHeight: 100,
        letterNumber: 3,
        value: "",
        ignoreCase: true
      },
      getter: {
        data: 0
      },
      setter: {

      },
      publics: {
        clear: Widget.AllowPublic
      },
      target: null,
      toString: function() {
        return "ui.autocomplete";
      },
      widgetEventPrefix: "autocomplete"
    } );

    return autoComplete;
  } );