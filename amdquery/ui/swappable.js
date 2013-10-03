aQuery.define( "ui/swappable", [ "base/typed", "base/client", "main/event", "module/math", "module/Widget" ], function( $, typed, client, event, math, Widget, undefined ) {
  "use strict"; //启用严格模式
  var swappable = Widget.extend( "ui.swappable", {
    container: null,
    create: function( ) {

      return this;
    },
    event: function( ) {

    },
    enable: function( ) {
      var fun = this.event;
      this.disable( );
      this.target.on( "mousemove", fun ).on( "mousedown", fun );
      $( document ).on( "mouseup", fun );
      this.options.disabled = true;
      return this;
    },
    disable: function( ) {
      var fun = this.event;
      this.target.off( "mousemove", fun ).off( "mousedown", fun );
      //event.document.off(window, "scroll", fun);
      $( document ).off( "mouseup", fun );
      this.options.disabled = false;
      return this;
    },
    computeSwapType: function( swapTypeName ) {
      var path = this.path,
        swaptype = undefined;

      ///先用简单实现
      ///这里去计算path 最后返回如: "LeftToRight","Linear","Cicrle" 多元线性回归;
      return swaptype;
    },
    getPara: function( para, time, range, x1, y1, x2, y2 ) {
      var diff = ( new Date( ) ) - time;
      para.distance = Math.round( math.distance( x1, y1, x2, y2 ) );
      para.speed = Math.round( math.speed( para.distance, diff ) * 1000 );

      para.angle = Math.round( math.radianToDegree( math.angle( x1, y1, x2, y2 ) ) * 10 ) / 10;
      para.direction = math.direction( para.angle, range );

      para.acceleration = math.acceleration( para.distance, diff );
      para.duration = diff;

      if ( this.path.length < 5 && this.path.length > 2 ) {
        para.currentAngle = para.angle;
        para.currentDirection = para.direction;
      }

      return para;
    },
    getPath: function( index ) {
      if ( index === undefined ) {
        return this.path;
      }
      index *= 2;
      return [ this.path[ index ], this.path[ index + 1 ] ];
    },
    getPathLast: function( ) {
      return this.getPath( this.path.length / 2 - 1 );
    },
    isInPath: function( x, y ) {
      for ( var path = this.path, i = this.path.length - 1; i >= 0; i -= 2 )
        if ( path[ i ] === x && path[ i + 1 ] === y ) return i;
      return -1;
    },
    init: function( opt, target ) {
      this._super( opt, target );
      this.path = [ ];
      this.isDown = false;
      this.startY = null;
      this.startX = null;
      return this._initHandler( ).enable( ).render( );
    },
    customEventName: [ "start", "move", "pause", "stop", "mousemove" ],
    options: {
      cursor: "pointer",
      directionRange: 15,
      pauseSensitivity: 500
    },
    publics: {
      isInPath: Widget.AllowReturn,
      getPath: Widget.AllowReturn,
      getPathLast: Widget.AllowReturn
    },
    _initHandler: function( ) {
      var self = this,
        target = self.target,
        opt = self.options,
        time, timeout, lastEvent; //IE和绑定顺序有关？找不到startX值？
      this.event = function( e ) {
        //event.document.stopPropagation(e);
        var left = target.getLeft( ),
          top = target.getTop( ),
          temp, x = ( e.pageX || e.clientX ) - left,
          y = ( e.pageY || e.clientY ) - top,
          para;
        if ( self.isDown || e.type == "mousedown" || e.type == "touchstart" ) {
          para = {
            type: self.getEventName( "start" ),
            offsetX: x,
            offsetY: y,
            event: e,
            speed: 0,
            target: this,
            startX: self.startX,
            startY: self.startY,
            path: self.path,
            swapType: undefined,
            angle: undefined,
            direction: undefined,
            distance: undefined,
            duration: undefined,
            currentAngle: undefined,
            currentDirection: undefined
          };
        } else {
          para = {
            offsetX: x,
            offsetY: y,
            event: e,
            target: this,
            startX: self.startX,
            startY: self.startY
          };
        }

        switch ( e.type ) {
          case "mousedown":
            if ( !client.system.mobile ) event.event.document.preventDefault( e );
          case "touchstart":
            //event.document.stopPropagation(e);
            if ( !self.isDown ) {
              self.isDown = true;
              para.startX = self.startX = x;
              para.startY = self.startY = y;
              time = new Date( );
              self.path = [ ];
              self.path.push( x, y );
              lastEvent = null;
              target.trigger( para.type, target[ 0 ], para );
            }
            break;
          case "mousemove":
            //event.document.stopPropagation(e);
            if ( e.which === 0 || ( client.browser.ie678 && e.button != 1 ) || self.isDown == false ) {
              self.isDown = false;
              para.type = self.getEventName( "mousemove" );
              target.trigger( para.type, target[ 0 ], para );
              break;
            }

          case "touchmove":
            //event.document.preventDefault(e);
            if ( self.isDown ) {
              temp = self.getPathLast( );
              if ( temp[ 0 ] === x && temp[ 1 ] === y ) break;
              self.path.push( x, y );
              self.getPara( para, time, opt.directionRange, self.startX, self.startY, x, y );
              para.type = self.getEventName( "move" );
              target.trigger( para.type, target[ 0 ], para );
              //if (!typed.isMobile) {
              clearTimeout( timeout );
              timeout = setTimeout( function( ) {
                para.type = self.getEventName( "pause" );
                para.swapType = self.computeSwapType( );
                target.trigger( para.type, target[ 0 ], para );
              }, opt.pauseSensitivity );
              //}
              lastEvent = e;
            }
            break;
          case "touchend":
            if ( lastEvent && self.isDown ) {
              para.offsetX = x = ( lastEvent.pageX || lastEvent.clientX ) - target.getLeft( );
              para.offsetY = y = ( lastEvent.pageY || lastEvent.clientY ) - target.getTop( );
            }
          case "mouseup":
            if ( self.isDown ) {
              //event.document.preventDefault(e);
              //event.document.stopPropagation(e);
              self.isDown = false;
              if ( !lastEvent && !client.browser.ie678 ) break;
              clearTimeout( timeout );

              self.getPara( para, time, opt.directionRange, self.startX, self.startY, $.between( 0, target.width( ), x ), $.between( 0, target.height( ), y ) );
              para.type = self.getEventName( "stop" );
              para.swapType = self.computeSwapType( );
              target.trigger( para.type, target[ 0 ], para );
              self.startX = undefined;
              self.startY = undefined;
            }
            break;

        }
      };
      return this;
    },
    render: function( ) {
      var opt = this.options;
      this.target.css( {
        cursor: opt.cursor
      } );
      return this;
    },
    target: null,
    toString: function( ) {
      return "ui.swappable";
    },
    widgetEventPrefix: "swap"
  } );

  return swappable;
} );