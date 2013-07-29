myQuery.define( "mobile/event.proxy", [ "base/extend", "base/client", "main.event" ], function( $, utilExtend, client, event, undefined ) {
  "use strict"; //启用严格模式
  if ( client.system.mobile ) {
    $.interfaces.achieve( "editEventType", function( name, type ) {
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
    }, touchImitation = function( ele, type, paras) {
      /// <summary>触发DOM元素touch事件</summary>
      /// <param name="ele" type="Element">dom元素</param>
      /// <param name="type" type="String">事件类型</param>
      /// <param name="paras" type="Object">模拟事件参数</param>
      /// <returns type="null" />
      var eventF = event.event.document,
        createEvent = eventF.createEvent,
        settings = utilExtend.extend( {}, _touchSettings, paras ),
        e, i;

        i = settings;

      e = createEvent( "TouchEvents" );
      e.initTouchEvent( type, i.bubbles, i.cancelable, i.view, i.detail, i.screenX, i.screenY, i.clientX, i.clientY, i.relatedTarget );
      eventF.dispatchEvent( ele, e, type );
    }, 
    _gestureSettings = {},
    gestureImitation = function( /*还不知道如何实现*/ ) {};

    event.event.document.imitation._touchSettings = _touchSettings;
    event.event.document.imitation.touch = touch;

    for ( i = 0, len = touch.length; i < len; i++ ) {
      event.event.domEventList[ touch[ i ] ] = touchImitation; //mouse
    }
    for ( i = 0, len = gesture.length; i < len; i++ ) {
      event.event.domEventList[ gesture[ i ] ] = 1; //mouse
    }
    for ( i = 0, len = other.length; i < len; i++ ) {
      event.event.domEventList[ other[ i ] ] = 1;
    }

    $.fn.extend( {
      touchstart: function( fun ) {
        /// <summary>绑定或触发touchstart事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "touchstart" );
      },

      touchmove: function( fun ) {
        /// <summary>绑定或触发touchmovep事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "touchmove" );
      },

      touchend: function( fun ) {
        /// <summary>绑定或触发touchend事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "touchend" );
      },

      touchcancel: function( fun ) {
        /// <summary>绑定或触发touchcancel事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "touchcancel" );
      },

      gesturestart: function( fun ) {
        /// <summary>绑定或触发gesturestart事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "gesturestart" );
      },

      gesturechange: function( fun ) {
        /// <summary>绑定或触发gesturechange事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "gesturechange" );
      },

      gestureend: function( fun ) {
        /// <summary>绑定或触发gestureend事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "gestureend" );
      },

      orientationchange: function( fun ) {
        /// <summary>绑定或触发orientationchange事件</summary>
        /// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
        /// <returns type="self" />
        return this.blur( fun, "orientationchange" );
      }


    } );

    return true;
  }
  return false;
} );