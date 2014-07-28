aQuery.define( "module/Keyboard", [ "base/config", "base/typed", "base/extend", "base/array", "main/event", "main/CustomEvent", "main/object", "hash/charcode" ], function( $, config, typed, utilExtend, array, event, CustomEvent, object, charcode ) {
  "use strict";
  /**
   * @global
   * @typedef {Object} KeyboardOptions
   * @link module:hash/charcode
   * @property KeyboardOptions {Object}
   * @property KeyboardOptions.keyCode {Number|String|Array<String>|Array<Number>} - "Up", 38, ["Up", "Down"], [38, 39]
   * @property KeyboardOptions.keyType {String} - "keydown", "keyup", "keypress"
   * @property KeyboardOptions.combinationKey {Array<String>} - "cmd", "ctrl", "alt", "shift"
   * @property KeyboardOptions.todo {Function}
   */

  /**
   * Handle Keyboard.
   * @constructor
   * @requires base/config
   * @requires base/typed
   * @requires base/extend
   * @requires base/array
   * @requires main/event
   * @requires main/CustomEvent
   * @requires main/object
   * @requires hash/charcode
   * @requires module:main/object
   * @augments module:main/object
   * @exports module/Keyboard
   * @mixes ObjectClassStaticMethods
   */
  var Keyboard = CustomEvent.extend( "Keyboard", /** @lends module:module/Keyboard.prototype */ {
    /**
     * @constructs module:module/Keyboard
     * @param {Element}
     * @param {Array<KeyboardOptions>|KeyboardOptions} [keyList=]
     */
    init: function( container, keyList ) {
      this._super();
      this.keyList = [];
      this.container = container;
      this.commandStatus = false;
      if ( this.container.getAttribute( "tabindex" ) == undefined ) {
        this.container.setAttribute( "tabindex", Keyboard.tableindex++ );
      }
      this._initHandler().enable().addKeys( keyList );
    },
    /**
     * @private
     */
    _initHandler: function() {
      var self = this;
      this.event = function( e ) {
        self.routing( this, e );
      };
      return this;
    },
    /**
     * Enable keyboard.
     * @returns {this}
     */
    enable: function() {
      event.on( this.container, "keydown keypress keyup", this.event );
      return this;
    },
    /**
     * Disable keyboard.
     * @returns {this}
     */
    disable: function() {
      event.off( this.container, "keydown keypress keyup", this.event );
      return this;
    },
    /**
     * @private
     */
    _push: function( ret ) {
      if ( !( this.iterationKeyList( ret ) ) ) {
        this.keyList.push( ret );
      }
      return this;
    },
    /**
     * Add key.
     * @param {KeyboardOptions}
     * @returns {this}
     */
    addKey: function( obj ) {
      var keyCode = obj.keyCode,
        ret;
      if ( typed.isArray( keyCode ) ) {
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
    /**
     * Add a list of key.
     * @param {Array<KeyboardOptions>|KeyboardOptions}
     * @returns {this}
     */
    addKeys: function( keyList ) {
      if ( !keyList ) {
        return this;
      }
      var i = 0,
        len;
      if ( !typed.isArray( keyList ) ) {
        keyList = [ keyList ];
      }
      for ( len = keyList.length; i < len; i++ ) {
        this.addKey( keyList[ i ] );
      }
      return this;
    },
    /**
     * Change key.
     * @param {KeyboardOptions}
     * @param {KeyboardOptions}
     * @returns {this}
     */
    changeKey: function( origin, evolution ) {
      origin = Keyboard.createOpt( origin );
      var item;
      if ( item = this.iterationKeyList( origin ) ) {
        utilExtend.extend( item, evolution );
      }
      return this;
    },
    /**
     * Remove key.
     * @param {KeyboardOptions}
     * @returns {this}
     */
    removeKey: function( obj ) {
      var item, ret, keyCode = obj.keyCode;
      if ( typed.isArray( keyCode ) ) {
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
    /**
     * Remove event listener.
     * @param {KeyboardOptions}
     * @returns {this}
     */
    removeTodo: function( obj ) {
      var opt = Keyboard.createOpt( obj );
      this.off( Keyboard.getHandlerName( opt ), obj.todo );
      return this;
    },
    /**
     * Iterate key list and search out matching key.
     * @param {KeyEvent}
     * @returns {KeyboardOptions|null}
     */
    iterationKeyList: function( e ) {
      for ( var i = 0, keyList = this.keyList, len = keyList.length, item, code, result = 0; i < len; i++ ) {
        code = e.keyCode || e.which;

        item = keyList[ i ];

        config.amdquery.debug && $.logger( "keyboard.iterationKeyList", "type:code", e.type + ":" + code );

        if (
          e.type == item.type &&
          code == item.keyCode &&
          Keyboard.checkCombinationKey( e, item.combinationKey )
        ) {
          return item;
        }
      }
      return null;
    },
    /**
     * @private
     */
    routing: function( target, e ) {
      e = event.document.getEvent( e );
      var item;
      if ( item = this.iterationKeyList( e ) ) {
        //item.todo.call(this, e);i
        var type = Keyboard.getHandlerName( item );
        config.amdquery.debug && $.logger( "keyboard.routing", "handlerName", type );
        this.trigger( CustomEvent.createEvent( type, target, {
          event: e,
          keyItem: item
        } ) );
        event.document.preventDefault( e );
        event.document.stopPropagation( e );
        return;
      }
      /**
       * @event module:module/Keyboard#keyboard.keydown
       * @type {Object}
       * @property {KeyboardEvent} event
       */
      /**
       * @event module:module/Keyboard#keyboard.keypress
       * @type {Object}
       * @property {KeyboardEvent} event
       */
      /**
       * @event module:module/Keyboard#keyboard.keyup
       * @type {Object}
       * @property {KeyboardEvent} event
       */
      this.trigger( CustomEvent.createEvent( e.type + ":*", target, {
        event: e,
      } ) );
    }
  }, /** @lends module:module/Keyboard */ {
    /**
     * Create option of keyboard.
     * @param {Object}
     * @return {KeyboardOptions}
     */
    createOpt: function( obj ) {
      var keyCode = obj.keyCode;
      //若有组合键 会把type强制转换
      if ( obj.combinationKey && obj.combinationKey.length ) {
        if ( typed.isString( keyCode ) ) {
          keyCode = keyCode.length > 1 ? keyCode : keyCode.toUpperCase();
        }
        obj.type = array.inArray( obj.combinationKey, "cmd" ) > -1 ? "keydown" : "keyup";
      }
      if ( typed.isString( keyCode ) ) {
        obj.keyCode = Keyboard.stringToCode( keyCode );
      }

      return obj;
    },
    /**
     * @param {Number}
     * @return {String}
     */
    codeToChar: function( code ) {
      return typed.isNumber( code ) ? String.fromCharCode( code ) : code;
    },
    /**
     * 38 ==> "Up".
     * @param {Number}
     * @return {String}
     */
    codeToString: function( code ) {
      return charcode.codeToStringReflect[ code ] || Keyboard.codeToChar( code );
    },
    /**
     * @param {String}
     * @return {Number}
     */
    charToCode: function( c ) {
      return typed.isString( c ) ? c.charCodeAt( 0 ) : c;
    },
    /**
     * "Up" ==> 38.
     * @param {String}
     * @return {Number}
     */
    stringToCode: function( s ) {
      return charcode.stringToCodeReflect[ s ] || Keyboard.charToCode( s );
    },
    /**
     * Whether e.combinationKey equals combinationKey.
     * @param {KeyEvent}
     * @param {Array<String>} - [ "ctrl", "alt", "shift" ]
     * @return {Boolean}
     */
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
    /**
     * @param {KeyboardOptions}
     * @return {String}
     */
    getHandlerName: function( obj ) {
      obj = Keyboard.createOpt( obj );
      var combinationKey = obj.combinationKey ? obj.combinationKey.join( "+" ) + "+" : "";
      return obj.type + ":" + combinationKey + Keyboard.stringToCode( obj.keyCode );
    },
    tableindex: 9000,
    cache: [],
    /**
     * Get an instance.
     * @param {Element}
     * @param {Array<KeyboardOptions>|KeyboardOptions} [keyList=]
     * @return {module:module/Keyboard}
     */
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