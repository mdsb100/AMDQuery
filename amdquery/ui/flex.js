aQuery.define( "ui/flex", [
    "base/typed",
    "base/support",
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
  function( $, typed, support, Widget, query, cls, event, css, position, dom, attr, css3 ) {
    "use strict"; //启用严格模式

    Widget.fetchCSS( "ui/css/flex" );

    var domStyle = document.documentElement.style,
      proto, flex,
      flexName = "",
      flexDirectionName = "";

    if ( "flex" in domStyle ) {
      flexName = "flex";
      flexDirectionName = "flexDirection";

    } else if ( ( $.css3Head + "Flex" ) in domStyle ) {
      flexName = $.css3Head + "Flex";
      flexDirectionName = $.css3Head + "FlexDirection";
    }

    support.box = !! flexName;

    if ( support.box ) {
      var originFlexValue = domStyle[ flexName ],
        originFlexDirectionValue = domStyle[ flexDirectionName ];

      proto = {
        container: null,
        event: function( ) {},
        _initHandler: function( ) {
          // var self = this;
          this.event = function( e ) {

          };
          return this;
        },
        enable: function( ) {

          this.options.disabled = true;
          return this;
        },
        disable: function( ) {

          this.options.disabled = false;
          return this;
        },
        render: function( ) {
          var opt = this.options;
          if ( opt.flex !== originFlexValue ) {
            //fix css + px because this is original string
            this.target.css( flexName, opt.flex + "" );
          }
          if ( opt.flexDirection !== originFlexDirectionValue ) {
            this.target.css( flexDirectionName, opt.flexDirection + "" );
          }
          return this;
        },
        resize: function( width, height ) {
          typed.isNul( width ) && this.setWidth( width );
          typed.isNul( height ) && this.setHeight( height );
        },
        setWidth: function( width ) {
          this.target.width( width );
        },
        setHeight: function( height ) {
          this.target.height( height );
        },
        _setFlex: function( flex ) {
          this.options.flex = flex;
        },
        init: function( opt, target ) {
          this._super( opt, target );
          this.target.addClass( 'flex' );
          this.render( );
          return this;
        },
        customEventName: [ ],
        options: {
          flex: originFlexValue,
          flexDirection: originFlexDirectionValue
        },
        getter: {

        },
        setter: {

        },
        publics: {
          setWidth: Widget.AllowPublic,
          setHeight: Widget.AllowPublic,
          resize: Widget.AllowPublic
        },
        target: null,
        toString: function( ) {
          return "ui.flex";
        },
        widgetEventPrefix: "flex",
        destory: function( key ) {
          this.target.css( flexName, originFlexValue );
          this.target.css( flexDirectionName, originFlexDirectionValue );
          Widget.invoke( "destory", this, key );
          return this;
        }
      };
    } else {
      proto = {
        container: null,
        event: function( ) {},
        _initHandler: function( ) {
          // var self = this;
          this.event = function( e ) {

          };
          return this;
        },
        enable: function( ) {

          this.options.disabled = true;
          return this;
        },
        disable: function( ) {

          this.options.disabled = false;
          return this;
        },
        render: function( ) {
          if ( this._lock === false ) {
            this.noticeParent( );
          }
          return this;
        },
        resize: function( width, height ) {
          typed.isNul( width ) && this.target.width( width );
          typed.isNul( height ) && this.target.height( height );
          this.render( );
        },
        setWidth: function( width ) {
          this.target.width( width );
          this.render( );
        },
        setHeight: function( height ) {
          this.target.height( height );
          this.render( );
        },
        _setFlex: function( flex ) {
          if ( typed.isNum( flex ) && flex >= 0 ) {
            if ( this.options.flex !== flex ) {
              this.options.flex = flex;
            }
          }
        },
        noticeParent: function( ) {
          var parent = this.findParent( );
          if ( parent ) {
            parent.uiSplitterpane( "resize" );
          }
        },
        findParent: function( ) {
          var parent = this.target.parent( "[ui-flexpane]" );
          if ( parent.length && parent[ 0 ] === this.target[ 0 ].parentNode ) {
            return parent;
          }
          return null;
        },
        lock: function( ) {
          this._lock = true;
        },
        unlock: function( ) {
          this._lock = false;
        },
        init: function( opt, target ) {
          this._super( opt, target );
          var self = this;
          this._lock = false;
          setTimeout( function( ) {
            self.render( );
          }, 1 );
          return this;
        },
        customEventName: [ ],
        options: {
          flex: ""
        },
        getter: {

        },
        setter: {

        },
        publics: {
          setWidth: Widget.AllowPublic,
          setHeight: Widget.AllowPublic,
          resize: Widget.AllowPublic,
          lock: Widget.AllowPublic,
          unlock: Widget.AllowPublic
        },
        target: null,
        toString: function( ) {
          return "ui.flex";
        },
        widgetEventPrefix: "flex"
      };
    }

    flex = Widget.extend( "ui.flex", proto, {
      flexName: flexName
    } );

    return flex;
  } );