aQuery.define( "mobile/event", [ "base/extend", "base/client", "main.event" ], function( $, utilExtend, client, event, undefined ) {
  "use strict";

  /**
   * @desc A mobile event proxy.If context is mobile then return true.<br/>
   * Extend aQuery.prototype. You must requrie this module.
   * @public
   * @module mobile/event
   */

  if ( client.system.mobile ) {
    $.interfaces.achieve( "eventHooks", function( name, type ) {
      var str = "";
      switch ( type ) {
        case "mousedown":
          str = "touchstart";
          break;
        case "mousemove":
          str = "touchmove";
          break;
        case "mouseup":
          str = "touchend";
          break;
        default:
          str = type;
      }
      return str;
    } );

    $.interfaces.achieve( "proxy", function( name, event, target ) {
      if ( !event ) return;
      switch ( event.type ) {
        case "touchmove":
        case "touchstart":
        case "touchend":
          var end = event.changedTouches[ 0 ];
          if ( !event.pageX ) {
            if ( client.system.lepad ) {
              delete event.pageX;
              delete event.pageY;
            }
            event.pageX = end.pageX || 0;
            event.pageY = end.pageY || 0;
          }
          if ( event.clientX == undefined ) {
            event.clientX = end.clientX;
            event.clientY = end.clientY;
          }
          if ( event.screenX == undefined ) {
            event.screenX = end.screenX;
            event.screenY = end.screenY;
          }
          break;
      }

      return {
        event: event,
        target: target
      };
    } );

    var touch = "touchstart touchmove touchend touchcancel".split( " " ),
      gesture = "gesturestart gesturechange gestureend".split( " " ),
      other = "orientationchange".split( " " ),
      len, i = 0,
      _touchSettings = {
        bubbles: true,
        cancelable: true,
        view: document.defaultView,
        detail: 0,
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        relatedTarget: null
      },
      touchImitation = function( ele, type, paras ) {
        /// <summary>触发DOM元素touch事件</summary>
        /// <param name="ele" type="Element">dom元素</param>
        /// <param name="type" type="String">事件类型</param>
        /// <param name="paras" type="Object">模拟事件参数</param>
        /// <returns type="null" />
        var eventF = event.document,
          createEvent = eventF.createEvent,
          settings = utilExtend.extend( {}, _touchSettings, paras ),
          e, i;

        i = settings;

        e = createEvent( "TouchEvents" );
        e.initTouchEvent( type, i.bubbles, i.cancelable, i.view, i.detail, i.screenX, i.screenY, i.clientX, i.clientY, i.relatedTarget );
        eventF.dispatchEvent( ele, e, type );
      },
      _gestureSettings = {},
      gestureImitation = function( /*unfinished*/) {};

    event.document.imitation._touchSettings = _touchSettings;
    event.document.imitation.touch = touch;

    for ( i = 0, len = touch.length; i < len; i++ ) {
      event.domEventList[ touch[ i ] ] = touchImitation; //mouse
    }
    for ( i = 0, len = gesture.length; i < len; i++ ) {
      event.domEventList[ gesture[ i ] ] = 1; //mouse
    }
    for ( i = 0, len = other.length; i < len; i++ ) {
      event.domEventList[ other[ i ] ] = 1;
    }

    $.fn.extend( /** @lends aQuery.prototype */ {
      /**
       * Bind or trigger touchstart.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      touchstart: function( fn ) {
        return this.addHandler( "touchstart", fn );
      },
      /**
       * Bind or trigger touchmove.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      touchmove: function( fn ) {
        return this.addHandler( "touchmove", fn );
      },
      /**
       * Bind or trigger touchend.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      touchend: function( fn ) {
        return this.addHandler( "touchend", fn );
      },
      /**
       * Bind or trigger touchcancel.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      touchcancel: function( fn ) {
        return this.addHandler( "touchcancel", fn );
      },
      /**
       * Bind or trigger gesturestart.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      gesturestart: function( fn ) {
        return this.addHandler( "gesturestart", fn );
      },
      /**
       * Bind or trigger gesturechange.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      gesturechange: function( fn ) {
        return this.addHandler( "gesturechange", fn );
      },
      /**
       * Bind or trigger gestureend.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      gestureend: function( fn ) {
        return this.addHandler( "gestureend", fn );
      },
      /**
       * Bind or trigger orientationchange.
       * @param {Function|Object} [fn]
       * @returns {this}
       */
      orientationchange: function( fn ) {
        return this.addHandler( "orientationchange", fn );
      }

    } );

    return true;
  }
  return false;
} );