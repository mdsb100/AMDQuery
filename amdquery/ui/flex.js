aQuery.define( "ui/flex", [
    "base/client",
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
  function( $, client, typed, support, Widget, query, cls, event, css, position, dom, attr, css3, functionExtend ) {
    "use strict"; //启用严格模式

    Widget.fetchCSS( "ui/css/flex" );

    var domStyle = document.documentElement.style,
      proto,
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
          if ( !typed.isNul( width ) ) {
            this.setWidth( width );
          }
          if ( !typed.isNul( height ) ) {
            this.setHeight( height );
          }
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
          this.render( width, height );
        },
        findParent: function( ) {
          var parent = this.target.parent( "[ui-flex]" );
          if ( parent.length && parent[ 0 ] === this.target[ 0 ].parentNode ) {
            return parent;
          }
          return null;
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
          this.target.addClass( "flex" );
          if ( !this.findParent( ) || ( typed.isNode( this.target[ 0 ], "iframe" ) && client.browser.ie >= 10 ) ) {
            if ( this.options.fillParentWidth ) {
              this.target.css( "width", "100%" );
            }
            if ( this.options.fillParentHeight ) {
              this.target.css( "height", "100%" );
            }
          }
          this.render( );
          return this;
        },
        customEventName: [ ],
        options: {
          flex: originFlexValue,
          flexDirection: originFlexDirectionValue,
          fillParentWidth: true,
          fillParentHeight: true
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
        destroy: function( key ) {
          this.target.css( flexName, originFlexValue );
          this.target.css( flexDirectionName, originFlexDirectionValue );
          Widget.invoke( "destroy", this, key );
          return this;
        }
      };
    } else {
      proto = {
        container: null,
        event: function( ) {},
        _initHandler: function( ) {
          // var self = this;
          var self = this;

          this.event = functionExtend.debounce( function( ) {
            self.fillParent( );
            self.render( );
          }, 50 );

          return this;
        },
        enable: function( ) {
          if ( !this.findParent( ) ) {
            event.event.document.addHandler( window, "resize", this.event );
          }
          this.options.disabled = true;
          return this;
        },
        disable: function( ) {
          if ( !this.findParent( ) ) {
            event.event.document.removeHandler( window, "resize", this.event );
          }
          this.options.disabled = false;
          return this;
        },
        render: function( width, height ) {
          if ( !typed.isNul( width ) ) {
            this.target.width( width );
          }
          if ( !typed.isNul( height ) ) {
            this.target.height( height );
          }

          this.width = this.target.width( );
          this.height = this.target.height( );

          this.toDirection( this.options.flexDirection );

          //来自父元素的
          if ( this._lock === false ) {
            this.noticeParent( );
          }

          return this;
        },
        resize: function( width, height ) {
          this.render( width, height );
        },
        setWidth: function( width ) {
          this.render( width, null );
        },
        setHeight: function( height ) {
          this.render( null, height );
        },
        _setFlexDirection: function( flexDirection ) {
          var opt = this.options;
          switch ( flexDirection ) {
            case "row":
              opt.flexDirection = flexDirection;
              break;
            case "column":
              opt.flexDirection = flexDirection;
              break;
          }
        },
        _setFlex: function( flex ) {
          if ( typed.isNum( flex ) && flex >= 0 ) {
            if ( this.options.flex !== flex ) {
              this.options.flex = flex;
            }
          }
        },
        filterFlex: function( ) {
          var children = this.target.children( ),
            opt = this.options,
            $item,
            flexTarget = [ ],
            itemFlex,
            totalFlex = 0,
            $lastItem = null,
            isFlex,
            hasFlex,
            traceWidth = this.width,
            traceHeight = this.height;

          children.each( function( ele ) {
            $item = $( ele );
            isFlex = $item.isWidget( "ui.flex" );
            itemFlex = 0;
            $item.isFlex = isFlex;
            if ( isFlex ) {
              $item.uiFlex( {
                initWithParent: true
              } );
              itemFlex = $item.uiFlex( "option", "flex" );
            }
            hasFlex = itemFlex > 0;
            $item.hasFlex = hasFlex;
            if ( isFlex && hasFlex ) {
              totalFlex += itemFlex;
              $lastItem = $item;
            } else {
              if ( opt.flexDirection === "row" ) {
                traceWidth -= $item.outerWidth( );
              } else if ( opt.flexDirection === "column" ) {
                traceHeight -= $item.outerHeight( );
              }
            }
            flexTarget.push( $item );
          } );

          traceWidth = Math.max( traceWidth, 0 );
          traceHeight = Math.max( traceHeight, 0 );
          if ( $lastItem ) {
            $lastItem.isLastItem = true;
          }
          return {
            flexTarget: flexTarget,
            totalFlex: totalFlex,
            traceWidth: traceWidth,
            traceHeight: traceHeight
          };
        },
        toDirection: function( direction ) {
          var ret = this.filterFlex( ),
            flexTarget = ret.flexTarget,
            totalFlex = ret.totalFlex,
            traceWidth = ret.traceWidth,
            traceHeight = ret.traceHeight,
            $item, i = 0,
            len = flexTarget.length,
            sumWidth = 0,
            sumHeight = 0,
            tempWidth = null,
            tempHeight = null,
            itemFlex,
            isFillParentWidth = false,
            isFillParentHeight = false;

          for ( ; i < len; i++ ) {
            $item = flexTarget[ i ];
            $item.css( "display", "block" );
            switch ( direction ) {
              case "row":
                $item.css( "float", "left" );
                break;
              case "column":
                $item.css( "clear", "both" );
                break;
            }

            if ( $item.isFlex ) {
              tempWidth = null;
              tempHeight = null;
              isFillParentHeight = $item.uiFlex( "option", "fillParentHeight" );
              isFillParentWidth = $item.uiFlex( "option", "fillParentWidth" );
              itemFlex = $item.uiFlex( "option", "flex" );
              if ( itemFlex > 0 ) {
                if ( direction === "row" ) {
                  if ( traceWidth > 0 ) {
                    tempWidth = Math.round( itemFlex / totalFlex * traceWidth );
                    if ( $item.isLastItem ) {
                      tempWidth = traceWidth - sumWidth;
                    } else {
                      sumWidth += tempWidth;
                    }
                  }
                  if ( isFillParentHeight ) {
                    tempHeight = traceHeight;
                  }
                } else if ( direction === "column" ) {
                  if ( traceHeight > 0 ) {
                    tempHeight = Math.round( itemFlex / totalFlex * traceHeight );
                    if ( $item.isLastItem ) {
                      tempHeight = traceHeight - sumHeight;
                    } else {
                      sumHeight += tempHeight;
                    }
                  }
                  if ( isFillParentWidth ) {
                    tempWidth = traceWidth;
                  }
                }

              } else {
                if ( isFillParentWidth ) {
                  tempWidth = traceWidth;
                }
                if ( isFillParentHeight ) {
                  tempHeight = traceHeight;
                }
              }
              $item.uiFlex( "lock" );
              $item.uiFlex( "resize", tempWidth, tempHeight );
              $item.uiFlex( "unlock" );
            }
          }
          return this;
        },
        noticeParent: function( ) {
          var parent = this.findParent( );
          if ( parent ) {
            parent.uiFlex( "resize" );
          }
        },
        findParent: function( ) {
          var parent = this.target.parent( "[ui-flex]" );
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
        fillParent: function( ) {
          if ( this.options.fillParentWidth ) {
            this.target.width( this.target.parent( ).width( ) );
          }
          if ( this.options.fillParentHeight ) {
            this.target.height( this.target.parent( ).height( ) );
          }
        },
        init: function( opt, target ) {
          this._super( opt, target );
          var self = this;
          this._lock = false;
          this.width = 0;
          this.height = 0;
          this.traceWidth = 0;
          this.traceHeight = 0;
          this._initHandler( ).enable( );
          if ( !this.findParent( ) ) {
            this.fillParent( );
            this.render( );
          } else {
            if ( !this.options.initWithParent ) {
              this.noticeParent( );
            }
          }
          return this;
        },
        customEventName: [ ],
        options: {
          flex: 0,
          flexDirection: "row",
          fillParentWidth: true,
          fillParentHeight: true,
          initWithParent: false
        },
        getter: {
          initWithParent: false
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

    var flex = Widget.extend( "ui.flex", proto, {
      flexName: flexName
    } );

    return flex;
  } );