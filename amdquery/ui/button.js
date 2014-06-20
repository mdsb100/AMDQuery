aQuery.define( "ui/button", [
    "base/client",
    "module/Widget",
    "main/query",
    "main/class",
    "main/event",
    "main/css",
    "main/position",
    "main/dom",
    "main/attr",
    "html5/css3"
  ],

  function( $, client, Widget, query, cls, event, css, position, dom, attr, css3 ) {
    "use strict";

    Widget.fetchCSS( "ui/css/button" );

    var button = Widget.extend( "ui.button", {
      container: null,
      _initHandler: function() {
        var self = this;
        this.buttonEvent = function( e ) {
          switch ( e.type ) {
            case "click":
              var para = {
                type: self.getEventName( "click" ),
                container: self.container,
                target: self.target[ 0 ],
                event: e
              };

              self.target.trigger( para.type, self.target[ 0 ], para );
              break;
          }
        };
        return this;
      },
      enable: function() {
        this.disable();
        this.target.on( "click", this.buttonEvent );
        this.options.disabled = false;
        return this;
      },
      disable: function() {
        this.target.off( "click", this.buttonEvent );
        this.options.disabled = true;
        return this;
      },
      render: function() {
        var opt = this.options,
          ie = client.browser.ie < 9;
        if ( ie ) {
          this.$text.remove();
        }
        this.$text.html( opt.text );
        if ( ie ) {
          this.$text.appendTo( this.container );
        }
        this.container.attr( "title", opt.title );
        return this;
      },
      init: function( opt, target ) {
        this._super( opt, target );

        target.addClass( this.options.defualtCssName );

        this.container = $( $.createEle( "a" ) ).css( {
          "display": "inline-block",
          "text-decoration": "none",
          "width": "100%",
          "height": "100%",
          "position": "relative"
        } ).addClass( "back" );

        this.$img = $( $.createEle( "div" ) ).css( {
          "display": "block",
          "text-decoration": "none",
          "position": "absolute",
          "width": "100%",
          "height": "100%"
        } ).addClass( "img" ).addClass( this.options.icon );

        this.$text = $( $.createEle( "a" ) ).css( {
          "display": "block",
          "text-decoration": "none",
          "position": "absolute",
          "float": "left",
          "width": "100%",
          "height": "100%"
        } ).addClass( "text" );

        this.container.append( this.$img ).append( this.$text );

        target.append( this.container );

        target.css( {
          "float": "left",
          "cursor": "pointer"
        } );

        this.$text.css3( "user-select", "none" );

        this._initHandler().enable().render();

        return this;
      },
      customEventName: [ "click" ],
      options: {
        defualtCssName: "aquery-button",
        text: "clickme",
        title: "",
        icon: "icon"
      },
      getter: {
        defualtCssName: 1,
        text: 1,
        title: 1,
        icon: 0
      },
      setter: {
        defualtCssName: 0,
        text: 1,
        title: 1,
        icon: 0
      },
      publics: {

      },
      target: null,
      toString: function() {
        return "ui.button";
      },
      widgetEventPrefix: "button"
    } );

    return button;
  } );