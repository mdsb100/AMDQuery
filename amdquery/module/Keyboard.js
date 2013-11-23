aQuery.define( "module/Keyboard", [ "base/config", "base/typed", "base/extend", "base/array", "main/event", "main/CustomEvent", "main/object", "hash/charcode" ], function( $, config, typed, utilExtend, array, event, CustomEvent, object, charcode ) {
  "use strict"; //启用严格模式
  var Keyboard = CustomEvent.extend( "Keyboard", {
    constructor: Keyboard,
    init: function( container, keyList ) {
      this._super( );
      this.keyList = [ ];
      this.container = container;
      this.commandStatus = false;
      if ( this.container.getAttribute( "tabindex" ) == undefined ) {
        this.container.setAttribute( "tabindex", Keyboard.tableindex++ );
      }
      this._initHandler( ).enable( ).addKeys( keyList );
    },
    _initHandler: function( ) {
      var self = this;
      this.event = function( e ) {
        self.routing( this, e );
      };
      return this;
    },
    enable: function( ) {
      event.on( this.container, "keydown keypress keyup", this.event );
      return this;
    },
    disable: function( ) {
      event.off( this.container, "keydown keypress keyup", this.event );
      return this;
    },
    _push: function( ret ) {
      if ( !( this.iterationKeyList( ret ) ) ) { //检查重复
        this.keyList.push( ret );
      }
      return this;
    },
    addKey: function( obj ) {
      var keyCode = obj.keyCode,
        ret;
      if ( typed.isArr( keyCode ) ) {
        for ( var i = 0, len = keyCode.length, nObj; i < len; i++ ) {
          nObj = {};
          utilExtend.easyExtend( nObj, obj );
          nObj.keyCode = keyCode[ i ];
          this.addKey( nObj );
        }
        return this;
      } else {
        ret = Keyboard.createOpt( obj );
        this._push( ret );
      }
      config.amdquery.debug && $.logger( "keyboard.addKey", "handlerName:", Keyboard.getHandlerName( ret ) );
      ret.todo && this.on( Keyboard.getHandlerName( ret ), ret.todo );
      return this;
    },
    addKeys: function( keyList ) {
      if ( !keyList ) {
        return this;
      }
      var i = 0,
        len;
      if ( !typed.isArr( keyList ) ) {
        keyList = [ keyList ];
      }
      for ( len = keyList.length; i < len; i++ ) {
        this.addKey( keyList[ i ] );
      }
      return this;
    },
    changeKey: function( origin, evolution ) {
      origin = Keyboard.createOpt( origin );
      var item;
      if ( item = this.iterationKeyList( origin ) ) {
        utilExtend.extend( item, evolution );
      }
      return this;
    },
    removeKey: function( obj ) {
      var item, ret, keyCode = obj.keyCode;
      if ( typed.isArr( keyCode ) ) {
        for ( var i = 0, len = keyCode.length, nObj; i < len; i++ ) {
          utilExtend.easyExtend( {}, obj );
          nObj = obj;
          nObj.keyCode = keyCode[ i ];
          this.removeKey( nObj );
        }
        return this;
      } else {
        ret = Keyboard.createOpt( obj );
        if ( item = this.iterationKeyList( ret ) ) {
          this.keyList.splice( array.inArray( this.keyList, item ), 1 );
          config.amdquery.debug && $.logger( "keyboard.removeKey", "handlerName:", Keyboard.getHandlerName( item ) );
          this.clearHandlers( Keyboard.getHandlerName( item ) );
        }
      }
      return this;
    },
    removeTodo: function( obj ) {
      var opt = Keyboard.createOpt( obj );
      this.off( Keyboard.getHandlerName( opt ), obj.todo );
    },
    iterationKeyList: function( e ) {
      for ( var i = 0, keyList = this.keyList, len = keyList.length, item, code, result = 0; i < len; i++ ) {
        code = e.keyCode || e.which;

        item = keyList[ i ];

        config.amdquery.debug && $.logger( "keyboard.iterationKeyList", "type:code", e.type + ":" + code );

        if ( e.type == "keyup" && code == 38 ) {
          debugger
        }

        if (
          e.type == item.type &&
          code == item.keyCode &&
          Keyboard.checkCombinationKey( e, item.combinationKey )
        ) {
          return item;
        }
      }
      return false;
    },
    routing: function( target, e ) {
      e = event.event.document.getEvent( e );
      var item;
      if ( item = this.iterationKeyList( e ) ) {
        //item.todo.call(this, e);i
        var type = Keyboard.getHandlerName( item );
        config.amdquery.debug && $.logger( "keyboard.routing", "handlerName", type );
        this.trigger( type, target, {
          type: type,
          event: e,
          keyItem: item
        } );
        event.event.document.preventDefault( e );
        event.event.document.stopPropagation( e );
      }
    }
  }, {
    codeToStringReflect: charcode.codeToStringReflect,
    stringToCodeReflect: charcode.stringToCodeReflect,
    createOpt: function( obj ) {
      var keyCode = obj.keyCode;
      //若有组合键 会把type强制转换
      if ( obj.combinationKey && obj.combinationKey.length ) {
        if ( typed.isStr( keyCode ) ) {
          keyCode = keyCode.length > 1 ? keyCode : keyCode.toUpperCase( );
        }
        obj.type = array.inArray( obj.combinationKey, "cmd" ) > -1 ? "keydown" : "keyup";
      }
      if ( typed.isStr( keyCode ) ) {
        obj.keyCode = Keyboard.stringToCode( keyCode );
      }

      return obj;
    },
    codeToChar: function( code ) {
      return typed.isNum( code ) ? String.fromCharCode( code ) : code;
    },
    codeToString: function( code ) {
      return Keyboard.codeToStringReflect[ code ] || Keyboard.codeToChar( code );
    },
    charToCode: function( c ) {
      return typed.isStr( c ) ? c.charCodeAt( 0 ) : c;
    },
    stringToCode: function( s ) {
      return Keyboard.stringToCodeReflect[ s ] || Keyboard.charToCode( s );
    },
    checkCombinationKey: function( e, combinationKey ) {
      var i = 0,
        j = 0,
        defCon = [ "ctrl", "alt", "shift" ],
        len = combinationKey ? combinationKey.length : 0,
        count1 = 0;
      if ( e.combinationKey ) {
        if ( e.combinationKey.length == len ) {
          for ( ; i < len; i++ ) {
            for ( ; j < len; j++ ) {
              e.combinationKey[ i ] != combinationKey[ j ] && count1++;
            }
          }
          if ( len == count1 ) {
            return 1;
          }
        } else {
          return 0;
        }
      } else {
        for ( var count2 = combinationKey ? combinationKey.length : 0; i < len; i++ ) {
          if ( combinationKey[ i ] === "cmd" ) {
            if ( Keyboard.commandStatus == true ) {
              count1++;
            } else {
              return 0;
            }
            continue;
          }

          if ( e[ defCon[ i ] + "Key" ] == true ) count1++;

          if ( e[ combinationKey[ i ] + "Key" ] == false ) {
            return 0;
          }
        }
        if ( count1 > count2 ) {
          return 0;
        }
      }
      return 1;
    },
    getHandlerName: function( obj ) {
      obj = Keyboard.createOpt( obj );
      var combinationKey = obj.combinationKey ? obj.combinationKey.join( "+" ) + "+" : "";
      return obj.type + ":" + combinationKey + Keyboard.stringToCode( obj.keyCode );
    },
    tableindex: 9000,
    cache: [ ],
    getInstance: function( container, keyList ) {
      var keyboard, i = 0,
        cache = Keyboard.cache,
        len = cache.length;
      for ( ; i < len; i++ ) {
        if ( cache[ i ].container == container ) {
          keyboard = cache[ i ];
        }
      }
      if ( !keyboard ) {
        keyboard = new Keyboard( container, keyList );
        Keyboard.cache.push( keyboard );
      }
      return keyboard;
    }
  } );

  event.on( document.documentElement, "keydown keypress keyup", function( e ) {
    var code = e.keyCode || e.which;
    if ( code === charcode.stringToCodeReflect[ "LeftCommand" ] ||
      code === charcode.stringToCodeReflect[ "RightCommand" ] ||
      code === charcode.stringToCodeReflect[ "Command" ] ) {
      switch ( e.type ) {
        case "keydown":
        case "keypress":
          Keyboard.commandStatus = true;
          break;
        case "keyup":
          Keyboard.commandStatus = false;
          break;
      }
    }
  } );

  return Keyboard;
} );