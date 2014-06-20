aQuery.define( "main/CustomEvent", [ "base/extend", "main/object" ], function( $, utilExtend, object, undefined ) {
  "use strict";
  this.describe( "A custom event" );
  /**
   * Be defined by object.extend.
   * Each function can not repeat to add into CustomEvent.
   * @constructor
   * @exports main/CustomEvent
   * @requires module:main/object
   * @mixes ObjectClassStaticMethods
   */
  var CustomEvent = object.extend( "CustomEvent", /** @lends module:main/CustomEvent.prototype */ {
    constructor: CustomEvent,
    /** @constructs module:main/CustomEvent */
    init: function() {
      this.__handlers = {};
      return this;
    },
    /**
     * Add a handler.
     * @param {String} - "mousedown" or "mousedown mouseup"
     * @param {Function}
     * @returns {this}
     */
    on: function( type, handler ) {
      return this.addHandler( type, handler );
    },
    /**
     * Add a handler once.
     * @param {String} - "mousedown" or "mousedown mouseup"
     * @param {Function}
     * @param {Function} - Inner.
     * @returns {this}
     */
    once: function( type, handler, proxy ) {
      var self = this,
        proxyName = this._getOnceProxyName( type );
      if ( handler[ proxyName ] ) {
        return this;
      }
      handler[ proxyName ] = function() {
        self.off( type, handler );
        delete handler[ proxyName ];
        handler.apply( this, arguments );
        handler = null;
        proxy && proxy();
        proxy = null;
      };
      return this.on( type, handler );
    },
    _getOnceProxyName: function( name ) {
      return "__" + name + "proxy";
    },
    /**
     * Add a handler.
     * @param {String} - "mousedown" or "mousedown mouseup"
     * @param {Function}
     * @returns {this}
     */
    addHandler: function( type, handler ) {
      var types = type.split( " " ),
        i = types.length - 1;
      for ( ; i >= 0; i-- ) {
        this._addHandler( types[ i ], handler );
      }
      return this;
    },
    _addHandler: function( type, handler ) {
      var handlers = this.__handlers[ type ];
      if ( !handlers ) {
        this.__handlers[ type ] = handlers = [];
      }
      if ( this.hasHandler( type, handler, handlers ) == -1 ) {
        handlers.push( handler );
      }
      return this;
    },
    /**
     * Clear handlers.
     * @param {String} [type] - If type is undefined, then clear all handler. If string can be used like "mousedown" or "mousedown mouseup".
     * @returns {this}
     */
    clear: function( type ) {
      return this.clearHandlers( type );
    },
    /**
     * Clear handlers.
     * @param {String} [type] - If type is undefined, then clear all handler. If string can be used like "mousedown" or "mousedown mouseup".
     * @returns {this}
     */
    clearHandlers: function( type ) {
      if ( type ) {
        var types = type.split( " " ),
          i = types.length - 1,
          item;
        for ( ; i >= 0; i-- ) {
          item = types[ i ];
          delete this.__handlers[ item ];
        }
      } else {
        this.__handlers = {};
      }
      return this;
    },
    /**
     * Return handlers.
     * @param {String=} - If type is null then return whole handlers object.
     * @returns {Array|Object}
     */
    getHandlers: function( type ) {
      return type ? this.__handlers[ type ] || [] : this.__handlers;
    },
    /**
     * Return index of handlers array. -1 means not found.
     * @param {String}
     * @param {Function}
     * @param {Array<Function>} [handlers]
     * @returns {Number}
     */
    hasHandler: function( type, handler, handlers ) {
      handlers = handlers || this.getHandlers( type );
      var i = 0,
        j = -1,
        len;
      if ( handlers instanceof Array && handlers.length ) {
        for ( len = handlers.length; i < len; i++ ) {
          if ( handlers[ i ] === handler ) {
            j = i;
            break;
          }
        }
      }
      return j;
    },
    /**
     * There are not any event then return true.
     * @returns {Boolean}
     */
    isEmpty: function() {
      for ( var i in this.__handlers ) {
        return false;
      }
      return true;
    },

    /**
     * Trigger an event.
     * @variation 1
     * @method trigger
     * @memberOf module:main/CustomEvent.prototype
     * @param {Object} - The special object create by CustomEvent.createEvent.
     * @returns {this}
     */

    /**
     * Trigger an event.
     * @param {String} - "mousedown" or "mousedown mouseup"
     * @param {Context}
     * @param {...*} [args]
     * @returns {this}
     */
    trigger: function( type, target, args ) {
      if ( typeof type === 'object' && type.__customEventFlag === true ) {
        return this.trigger( type.type, type.target, type );
      }
      var types = type.split( " " ),
        i = 0,
        len = types.length;
      for ( ; i < len; i++ ) {
        this._trigger( types[ i ], target, args );
      }
      return this;
    },
    _trigger: function( type, target ) {
      var handlers = this.getHandlers( type ),
        onceProxyName = this._getOnceProxyName( type );
      if ( handlers instanceof Array && handlers.length ) {
        for ( var i = 0, len = handlers.length, arg = $.util.argToArray( arguments, 2 ), handler; i < len; i++ ) {
          handler = handlers[ i ];

          if ( handler[ onceProxyName ] ) {
            handler = handler[ onceProxyName ];
          }

          handler.apply( target, arg );
        }
      }
      return this;
    },
    /**
     * Remove handler.
     * @param {String}
     * @param {Function}
     * @returns {this}
     */
    off: function( type, handler ) {
      return this.removeHandler( type, handler );
    },
    /**
     * Remove handler.
     * @param {String} - "mousedown" or "mousedown mouseup"
     * @param {Function}
     * @returns {this}
     */
    removeHandler: function( type, handler ) {
      var types = type.split( " " ),
        i = types.length - 1;
      for ( ; i >= 0; i-- ) {
        this._removeHandler( types[ i ], handler );
      }
      return this;
    },
    /** @returns {CustomEvent} */
    clone: function() {
      var customEvent = new CustomEvent(),
        name, list, i, len;

      for ( name in this.getHandlers() ) {
        list = this.getHandlers( name );
        len = list.length;
        for ( i = 0; i < len; i++ ) {
          customEvent.on( name, list[ i ] );
        }
      }

      return customEvent;
    },
    _removeHandler: function( type, handler ) {
      var handlers = this.getHandlers( type ),
        i = this.hasHandler( type, handler, handlers );
      if ( i > -1 ) {
        handlers.splice( i, 1 );
      }
      if ( handlers.length === 0 ) {
        delete this.__handlers[ type ];
      }
      return this;
    },
  }, /** @lends module:main/CustomEvent */ {
    /**
     * Create a standard event.
     * @param {String} - Type of event.
     * @param {Object} - Target of event.
     * @param {Object} - Data.
     * @returns {Object}
     */
    createEvent: function( type, target, object ) {
      var event = {};
      object = object || {};
      utilExtend.extend( event, object );
      event.type = type;
      event.target = target;
      event.__customEventFlag = true;
      return event;
    }
  } );

  return CustomEvent;
} );