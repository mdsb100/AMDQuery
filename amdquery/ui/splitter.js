aQuery.define( "ui/splitter", [
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
    "html5/css3",
    "ui/splitterpane"
  ],
  function( $, typed, support, Widget, query, cls, event, css, position, dom, attr, css3, splitterpane ) {
    "use strict"; //启用严格模式
    var proto, splitter;
    if ( support.box ) {
      var boxFlexName = splitterpane.boxFlexName,
        originBoxFlexValue = document.documentElement.style[ boxFlexName ];

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
          if ( opt.flex !== originBoxFlexValue ) {
            //fix css + px because this is original string
            this.target.css( boxFlexName, opt.flex + "" );
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
          this.render( );
          return this;
        },
        customEventName: [ ],
        options: {
          flex: originBoxFlexValue
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
          return "ui.splitter";
        },
        widgetEventPrefix: "splitter",
        destory: function( key ) {
          this.target.css( boxFlexName, originBoxFlexValue );
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
          var parent = this.target.parent( "[ui-splitterpane]" );
          if ( parent.length && parent[0] === this.target[0].parentNode ) {
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
          return "ui.splitter";
        },
        widgetEventPrefix: "splitter"
      };
    }

    splitter = Widget.extend( "ui.splitter", proto );

    return splitter;
  } );