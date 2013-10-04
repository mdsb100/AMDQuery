aQuery.define( "ui/splitterpane", [
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
    "util/function.extend"
  ],
  function( $, typed, support, Widget, query, cls, event, css, position, dom, attr, css3, functionExtend ) {
    "use strict"; //启用严格模式

    Widget.fetchCSS( "ui/css/splitterpane" );

    var domStyle = document.documentElement.style,
      boxFlexName = "",
      boxOrientName = "";
    //boxPackName = "",
    //boxAlignName = "";

    if ( "boxFlex" in domStyle ) {
      boxFlexName = "boxFlex";
      boxOrientName = "boxOrient";
      //boxPackName = "boxPack";
      //boxAlignName = "boxAlign";

    } else if ( ( $.css3Head + "BoxFlex" ) in domStyle ) {
      boxFlexName = $.css3Head + "BoxFlex";
      boxOrientName = $.css3Head + "BoxOrient";
      //boxPackName = $.css3Head + "BoxPack";
      //boxAlignName = $.css3Head + "BoxAlign";
    }

    support.box = !! boxFlexName;

    var splitterpane, proto;

    if ( support.box ) {
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
        render: function( width, height ) {
          if ( !arguments.length ) {
            return;
          }
          var opt = this.options;
          this.target.css( boxOrientName, opt.orient );
          //this.target.css(boxAlignName, opt.align);
          //this.target.css(boxPackName, opt.pack);
          this.resize( width, height );
          return this;
        },
        resize: function( width, height ) {
          typed.isNul( width ) || this.target.width( width );
          typed.isNul( height ) || this.target.height( height );

          return this;
        },
        init: function( opt, target ) {
          this._super( opt, target );
          this.target.addClass( "splitterpane" );
          this.render( );
          return this;
        },
        _setOrient: function( orient ) {
          var opt = this.options;
          switch ( orient ) {
            case "horizontal":
              opt.orient = orient;
              break;
            case "vertical":
              opt.orient = orient;
              break;
          }
        },
        customEventName: [ ],
        options: {
          orient: "horizontal"
          //pack: "start",
          //align: "start"
        },
        getter: {

        },
        setter: {

        },
        publics: {
          resize: Widget.AllowPublic
        },
        target: null,
        toString: function( ) {
          return "ui.splitterpane";
        },
        widgetEventPrefix: "splitter",
        destory: function( key ) {
          this.targt.removeClass( "splitterpane" );
          Widget.invoke( "destory", this, key );
          return this;
        }
      };
    } else {
      proto = {
        container: null,
        event: function( ) {},
        _initHandler: function( ) {
          var self = this;
          this.event = functionExtend.debounce( function( e ) {
            switch ( e.type ) {
              case "resize":
                self.resize( );
                break;
            }
          }, 15 );
          return this;
        },
        enable: function( ) {
          event.on( window, "resize", this.event );
          this.options.disabled = true;
          return this;
        },
        disable: function( ) {
          event.off( window, "resize", this.event );
          this.options.disabled = false;
          return this;
        },
        render: function( width, height ) {
          if ( !arguments.length ) {
            return;
          }
          this.resize( width, height );
          this.target.find( "li[ui-splitter]" ).uiSplitterpane( "resize" );
          return this;
        },
        resize: function( width, height ) {
          var opt = this.options;
          if ( !typed.isNul( width ) ) {
            this.target.width( width );
          }
          if ( !typed.isNul( height ) ) {
            this.target.height( height );
          }
          this.width = this.target.width( );
          this.height = this.target.height( );

          switch ( opt.orient ) {
            case "horizontal":
              this.toHorizontal( );
              break;
            case "vertical":
              this.toVertical( );
              break;
          }
          return this;
        },
        _setOrient: function( orient ) {
          var opt = this.options;
          switch ( orient ) {
            case "horizontal":
              opt.orient = orient;
              break;
            case "vertical":
              opt.orient = orient;
              break;
          }
        },
        filterSplitter: function( ) {
          var children = this.target.children( ),
            $item,
            splitter = [ ],
            flex = 0,
            $lastItem = null,
            traceWidth = this.width,
            traceHeight = this.height;

          children.each( function( ele ) {
            $item = $( ele );
            if ( Widget.is( $item, "ui.splitter" ) ) {
              $item.isSplitter = true;
              $item.uiSplitter( );
              flex += $item.splitter( "option", "flex" );
              $lastItem = $item;
            } else {
              traceWidth -= $item.outerWidth( );
              traceHeight -= $item.outerHeight( );
            }
            splitter.push( $item );
          } );

          traceWidth = Math.max( traceWidth, 0 );
          traceHeight = Math.max( traceHeight, 0 );
          if ( $lastItem ) {
            $lastItem.isLastItem = true;
          }
          return {
            splitter: splitter,
            flex: flex,
            traceWidth: traceWidth,
            traceHeight: traceHeight
          };
        },
        toHorizontal: function( ) {
          var ret = this.filterSplitter( ),
            splitter = ret.splitter,
            flex = ret.flex,
            traceWidth = ret.traceWidth,
            // traceHeight = ret.traceHeight,
            $item, i = 0,
            len = splitter.length,
            sumWidth = 0,
            tempWidth = 0;

          for ( ; i < len; i++ ) {
            $item = splitter[ i ];
            $item.css( "float", "left" );
            if ( $item.isSplitter && traceWidth > 0 ) {

              tempWidth = Math.round( $item.uiSplitter( "option", "flex" ) / flex * traceWidth );
              if ( $item.isLastItem ) {
                tempWidth = traceWidth - sumWidth;
              } else {
                sumWidth += tempWidth;
              }
              $item.uiSplitter( "lock" );
              $item.uiSplitter( "setWidth", tempWidth );
              $item.uiSplitter( "unlock" );
            }
          }
          return this;
        },
        toVertical: function( ) {
          var ret = this.filterSplitter( ),
            splitter = ret.splitter,
            flex = ret.flex,
            // traceWidth = ret.traceWidth,
            traceHeight = ret.traceHeight,
            $item, i = 0,
            len = splitter.length,
            sumHeight = 0,
            tempHeight = 0;

          for ( ; i < len; i++ ) {
            $item = splitter[ i ];
            $item.css( "clear", "both" );
            if ( $item.isSplitter && traceHeight > 0 ) {

              tempHeight = Math.round( $item.uiSplitter( "option", "flex" ) / flex * traceHeight );
              if ( $item.isLastItem ) {
                tempHeight = traceHeight - sumHeight;
              } else {
                sumHeight += tempHeight;
              }
              $item.uiSplitter( "lock" );
              $item.uiSplitter( "setHeight", tempHeight );
              $item.uiSplitter( "unlock" );
            }
          }

          return this;
        },
        init: function( opt, target ) {
          this._super( opt, target );
          this.width = 0;
          this.height = 0;
          this.traceWidth = 0;
          this.traceHeight = 0;
          this.resize( );
          return this;
        },
        customEventName: [ ],
        options: {
          orient: "horizontal"
          //pack: "start",
          //align: "start"
        },
        getter: {

        },
        setter: {

        },
        publics: {
          resize: Widget.AllowPublic
        },
        target: null,
        toString: function( ) {
          return "ui.splitterpane";
        },
        widgetEventPrefix: "splitterpane"
      };
    }

    splitterpane = Widget.extend( "ui.splitterpane", proto, {
      boxFlexName: boxFlexName
    } );

    return splitterpane;
  } );