aQuery.define( "ui/scrollableview", [
  "base/support",
  "main/query",
  "main/css",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "ui/swappable",
  "ui/draggable",
  "module/Widget",
  "module/animate",
  "module/tween.extend" ], function( $, support, query, css, position, dom, cls, css3, animateTransform, css3Transition, swappable, draggable, Widget, animate, tween, undefined ) {
  "use strict"; //启用严格模式
  Widget.fetchCSS( "ui/css/scrollableview" );
  var isTransform3d = !! $.config.module.transitionToAnimation && support.transform3d;

  var scrollableview = Widget.extend( "ui.scrollableview", {
    container: null,
    create: function( ) {
      var opt = this.options;
      this.positionParent = $( {
        "overflow": "visible"
      }, "div" ).width( this.target.width( ) ).height( this.target.height( ) ).append( this.target.children( ) );

      this.container = $( {
        "position": "absolute"
      }, "div" ).append( this.positionParent ).appendTo( this.target );

      this.target.uiSwappable( );

      this.statusBarX = $( {
        height: "10px",
        display: "none",
        position: "absolute",
        bottom: "0px"
      }, "div" ).addClass( "scrollableViewStatusBar" ).appendTo( this.target );

      this.statusBarY = $( {
        width: "10px",
        display: "none",
        position: "absolute",
        right: "0px"
      }, "div" ).addClass( "scrollableViewStatusBar" ).appendTo( this.target );

      this.container.uiDraggable( {
        keepinner: 1,
        innerWidth: opt.boundary,
        innerHeight: opt.boundary,
        axis: opt.overflow,
        stopPropagation: false,
        axisx: this._isAllowedDirection( "x" ),
        axisy: this._isAllowedDirection( "y" ),
        container: this.target,
        overflow: true
      } );

      this.refreshPosition( ).refreshContainerSize( );

      isTransform3d && this.container.initTransform3d( );

      return this;
    },
    event: function( ) {},
    enable: function( ) {
      var event = this.event;
      this.container.on( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
      this.target.on( "swap.move swap.stop swap.pause", event ).touchwheel( event );
      this.options.disabled = true;
      return this;
    },
    disable: function( ) {
      var event = this.event;
      this.container.off( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
      this.target.off( "swap.move swap.stop swap.pause", event ).off( "touchwheel", event );
      this.options.disabled = false;
      return this;
    },
    _initHandler: function( ) {
      var self = this,
        target = self.target,
        opt = self.options,
        check = function( ) {
          self.toXBoundary( self.getLeft( ) ).toYBoundary( self.getTop( ) ).hideStatusBar( );
        };

      this.event = function( e ) {
        switch ( e.type ) {
          case "drag.move":
            var x = self.checkXBoundary( e.offsetX, opt.boundary ),
              y = self.checkYBoundary( e.offsetY, opt.boundary );
            self.renderStatusBar( self.checkXStatusBar( x ), self.checkYStatusBar( y ) );
            self.showStatusBar( );
            break;
          case "drag.pause":
            var left = self.getLeft( ),
              top = self.getTop( ),
              distance = opt.pullDistance;

            if ( left > distance ) {
              e.type = self.getEventName( "pullleft" );
              target.trigger( e.type, this, e );
            } else if ( left < -self.overflowWidth - distance ) {
              e.type = self.getEventName( "pullright" );
              target.trigger( e.type, this, e );
            }
            if ( top > distance ) {
              e.type = self.getEventName( "pulldown" );
              target.trigger( e.type, this, e );
            } else if ( top < -self.overflowHeight - distance ) {
              e.type = self.getEventName( "pullup" );
              target.trigger( e.type, this, e );
            }

            break;
          case "drag.start":
            self.refreshPosition( ).refreshContainerSize( );
            break;
          case "DomNodeInserted":
          case "DomNodeRemoved":
            self.refreshPosition( ).refreshContainerSize( ).toYBoundary( self.getTop( ) ).toXBoundary( self.getLeft( ) );
            break;
          case "swap.move":
            self.showStatusBar( );
            break;
          case "swap.stop":
            self.animate( e );
            break;
          case "swap.pause":
            self.pause( e );
            break;
          case "mousewheel":
          case "DOMMouseScroll":
            x = null;
            y = null;
            clearTimeout( self.wheelTimeId );
            //refreshContainerSize?
            self.refreshPosition( );
            // var x = null,
            // y = null;
            if ( e.direction == "x" ) {
              x = e.delta * opt.mouseWheelAccuracy;
            } else if ( e.direction == "y" ) {
              y = e.delta * opt.mouseWheelAccuracy;
            }
            self.showStatusBar( );

            self.wheelTimeId = setTimeout( check, 500 );

            self.render( x, y, true, opt.boundary );
            break;
        }
      };
      return this;
    },
    destory: function( key ) {
      if ( key ) {
        this.target.uiSwappable( "destory" );
        this.container.uiDraggable( "destory" );
        this.target.children( ).remove( );
        this.positionParent.children( ).appendTo( this.target );
        Widget.invoke( "destory", this, key );
      }
    },
    init: function( opt, target ) {
      this._super( opt, target );

      this.originOverflow = this.target.css( "overflow" );

      this.target.attr( "amdquery-ui", "scrollableview" );
      this.target.css( {
        "overflow": "hidden",
        /*fix ie*/
        "overflow-x": "hidden",
        "overflow-y": "hidden"
      } );

      var pos = this.target.css( "position" );
      if ( pos != "relative" && pos != "absolute" ) {
        this.target.css( "position", "relative" );
      }

      return this.create( )._initHandler( ).enable( ).render( 0, 0 );
    },
    customEventName: [ "pulldown", "pullup", "pullleft", "pullright", "animationEnd" ],
    options: {
      "overflow": "xy",
      "animateDuration": 600,
      "boundary": 150,
      "boundaryDruation": 300,
      "mouseWheelAccuracy": 0.3,
      "pullDistance": 50
    },
    publics: {
      "refreshPosition": Widget.AllowPublic,
      "showStatusBar": Widget.AllowPublic,
      "hideStatusBar": Widget.AllowPublic,
      "render": Widget.AllowPublic,
      "toX": Widget.AllowPublic,
      "toY": Widget.AllowPublic
    },
    render: function( x, y, addtion, boundary ) {
      var position,
        originX = 0,
        originY = 0,
        statusX, statusY;

      if ( addtion ) {
        position = this.getContainerPosition( );

        originX = position.x;
        originY = position.y;
      }

      if ( x !== null && this._isAllowedDirection( "x" ) ) {
        x = this.checkXBoundary( originX + x, boundary );
        statusX = this.checkXStatusBar( x );
      }
      if ( y !== null && this._isAllowedDirection( "y" ) ) {
        y = this.checkYBoundary( originY + y, boundary );
        statusY = this.checkYStatusBar( y );
      }

      return this._render( x, statusX, y, statusY );
    },
    _render: function( x1, x2, y1, y2 ) {
      var pos = {};
      if ( x1 !== null && this._isAllowedDirection( "x" ) ) {
        pos.x = parseInt( x1 );
        this.statusBarX.setPositionX( isTransform3d, parseInt( x2 ) );
      }
      if ( y1 !== null && this._isAllowedDirection( "y" ) ) {
        pos.y = parseInt( y1 );
        this.statusBarY.setPositionY( isTransform3d, parseInt( y2 ) );
      }
      this.container.setPositionXY( isTransform3d, pos );
      return this;
    },
    renderStatusBar: function( x, y ) {
      this._isAllowedDirection( "x" ) && this.statusBarX.setPositionX( isTransform3d, parseInt( x ) );

      this._isAllowedDirection( "y" ) && this.statusBarY.setPositionY( isTransform3d, parseInt( y ) );

      return this;
    },
    getContainerPosition: function( ) {
      return {
        x: this.getLeft( ),
        y: this.getTop( )
      };
    },

    target: null,
    toString: function( ) {
      return "ui.scrollableview";
    },
    widgetEventPrefix: "scrollableview",

    refreshStatusBar: function( ) {
      var viewportWidth = this.viewportWidth,
        scrollWidth = this.scrollWidth,
        viewportHeight = this.viewportHeight,
        scrollHeight = this.scrollHeight,
        width = 0,
        height = 0;

      if ( scrollWidth != viewportWidth ) {
        this.statusBarXVisible = 1;
        width = viewportWidth * viewportWidth / scrollWidth;
      } else {
        width = this.statusBarXVisible = 0;
      }


      if ( scrollHeight != viewportHeight ) {
        this.statusBarYVisible = 1;
        height = viewportHeight * viewportHeight / scrollHeight;
      } else {
        height = this.statusBarYVisible = 0;
      }

      this.statusBarX.width( width );
      this.statusBarY.height( height );

      return this;
    },

    refreshContainerSize: function( ) {
      this.container.width( this.scrollWidth );
      this.container.height( this.scrollHeight );
      return this;
    },

    refreshPosition: function( ) {
      this.scrollWidth = this.positionParent.scrollWidth( );
      this.scrollHeight = this.positionParent.scrollHeight( );

      this.viewportWidth = this.target.width( );
      this.viewportHeight = this.target.height( );

      this.overflowWidth = this.scrollWidth - this.viewportWidth;
      this.overflowHeight = this.scrollHeight - this.viewportHeight;

      return this.refreshStatusBar( );
    },
    _isAllowedDirection: function( direction ) {
      return this.options.overflow.indexOf( direction ) > -1;
    },
    getTop: function( ) {
      return this.container.getPositionY( );
    },
    getLeft: function( ) {
      return this.container.getPositionX( );
    },
    pause: function( ) {

      return this;
    },
    animate: function( e ) {
      var opt = this.options,
        a0 = e.acceleration,
        t0 = opt.animateDuration - e.duration,
        s0 = Math.round( a0 * t0 * t0 * 0.5 ),
        direction = e.direction;

      if ( t0 <= 0 ) {
        this.toYBoundary( this.getTop( ) ).toXBoundary( this.getLeft( ) );
        return this.hideStatusBar( );
      }

      switch ( direction ) {
        case 3:
          this.toX( -s0, t0, direction );
          break;
        case 9:
          this.toX( s0, t0, direction );
          break;
        case 6:
          this.toY( -s0, t0, direction );
          break;
        case 12:
          this.toY( s0, t0, direction );
          break;
        default:
          this.toXBoundary( this.getTop( ) ).toYBoundary( this.getLeft( ) );
      }

      return this;
    },

    checkXBoundary: function( s, boundary ) {
      var boundary = boundary !== undefined ? boundary : this.options.boundary;
      return $.between( -( this.overflowWidth + boundary ), boundary, s );
    },
    checkYBoundary: function( s, boundary ) {
      var boundary = boundary !== undefined ? boundary : this.options.boundary;
      return $.between( -( this.overflowHeight + boundary ), boundary, s );
    },

    checkXStatusBar: function( left ) {
      var result = -left / this.scrollWidth * this.viewportWidth;
      return $.between( 0, this.viewportWidth - this.statusBarX.width( ), result );
    },

    checkYStatusBar: function( top ) {
      var result = -top / this.scrollHeight * this.viewportHeight;
      return $.between( 0, this.viewportHeight - this.statusBarY.height( ), result );
    },

    showStatusBar: function( ) {
      this.statusBarXVisible && this._isAllowedDirection( "x" ) && this.statusBarX.show( );
      this.statusBarYVisible && this._isAllowedDirection( "y" ) && this.statusBarY.show( );
      return this;
    },
    hideStatusBar: function( ) {
      this.statusBarX.hide( );
      this.statusBarY.hide( );
      return this;
    },

    outerXBoundary: function( t ) {
      if ( t >= 0 ) {
        return 0;
      } else if ( t < -this.overflowWidth ) {
        return -this.overflowWidth;
      }
      return null;
    },

    outerYBoundary: function( t ) {
      if ( t >= 0 ) {
        return 0;
      } else if ( t < -this.overflowHeight ) {
        return -this.overflowHeight;
      }
      return null;
    },

    _triggerAnimate: function( scene, direction, duration, distance ) {
      var type = this.getEventName( "animationEnd" );
      this.target.trigger( type, this.container[ 0 ], {
        type: type,
        scene: scene,
        direction: direction,
        duration: duration,
        distance: distance
      } );
    },

    toXBoundary: function( left, direction ) {
      var outer = this.outerXBoundary( left ),
        self = this;
      if ( outer !== null ) {
        this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, outer ), {
          duration: this.options.boundaryDruation,
          easing: "expo.easeOut",
          queue: false,
          complete: function( ) {
            self.hideStatusBar( );
            self._triggerAnimate( "boundary", direction, self.options.boundaryDruation, outer );
          }
        } );
      }
      return this;
    },

    toYBoundary: function( top, direction ) {
      var outer = this.outerYBoundary( top ),
        self = this;
      if ( outer !== null ) {
        this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, outer ), {
          duration: this.options.boundaryDruation,
          easing: "expo.easeOut",
          queue: false,
          complete: function( ) {
            self.hideStatusBar( );
            self._triggerAnimate( "boundary", direction, self.options.boundaryDruation, outer );
          }
        } );
      }
      return this;
    },

    toX: function( s, t, d ) {
      return this._isAllowedDirection( "x" ) ? this.animateX( this.checkXBoundary( this.getLeft( ) - s ), t, d ) : this;
    },
    toY: function( s, t, d ) {
      return this._isAllowedDirection( "y" ) ? this.animateY( this.checkYBoundary( this.getTop( ) - s ), t, d ) : this;
    },
    animateY: function( y1, t, direction ) {
      var self = this,
        y2 = this.checkYStatusBar( y1 );

      this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, y1 ), {
        duration: t,
        easing: "easeOut",
        complete: function( ) {
          self.toXBoundary( self.getLeft( ), direction ).toYBoundary( y1, direction );
          self._triggerAnimate( "inner", direction, t, y1 );
        }
      } );

      this.statusBarY.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, y2 ), {
        duration: t,
        easing: "easeOut"
      } );
      return this;
    },
    animateX: function( x1, t, direction ) {
      var self = this,
        x2 = this.checkXStatusBar( x1 );

      this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, x1 ), {
        duration: t,
        easing: "easeOut",
        complete: function( ) {
          self.toXBoundary( x1, direction ).toYBoundary( self.getTop( ), direction );
          self._triggerAnimate( "inner", direction, t, x1 );
        }
      } );

      this.statusBarX.animate( $.getPositionAnimationOptionProxy( isTransform3d, x2 ), {
        duration: t,
        easing: "easeOut"
      } );
      return this;
    }
  } );

  return scrollableview;
} );