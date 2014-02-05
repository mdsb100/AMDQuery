aQuery.define( "main/CustomEvent", [ "main/object" ], function( $, object, undefined ) {
	"use strict";
	this.describe( "A custom event" );
	/**
	 * Be defined by object.extend.
	 * @constructor
	 * @exports main/CustomEvent
	 * @requires module:main/object
	 * @mixes ObjectClassStaticMethods
	 */
	var CustomEvent = object.extend( "CustomEvent", /** @lends module:main/CustomEvent.prototype */ {
		constructor: CustomEvent,
		/** @constructs module:main/CustomEvent */
		init: function() {
			this.handlers = {};
			this._handlerMap = {};
			return this;
		},
		/**
		 * Add a handler.
		 * @param {String}
		 * @param {Function}
		 * @returns {this}
		 */
		on: function( type, handler ) {
			return this.addHandler( type, handler );
		},
		/**
		 * Add a handler once.
		 * @param {String}
		 * @param {Function}
		 * @returns {this}
		 */
		once: function( type, handler ) {
			var self = this,
				handlerproxy = function() {
					self.off( type, handlerproxy );
					handler.apply( this, arguments );
				};
			return this.on( type, handlerproxy );
		},
		/**
		 * Add a handler.
		 * @param {String}
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
			var handlers = this._nameSpace( type );
			this.hasHandler( type, handler, handlers ) == -1 && handlers.push( handler );
			return this;
		},
		/**
		 * Clear handlers.
		 * @param {String} [type] - If type is undefined, then clear all handler
		 * @returns {this}
		 */
		clear: function( type ) {
			return this.clearHandlers( type );
		},
		/**
		 * Clear handlers.
		 * @param {String} [type] - If type is undefined, then clear all handler
		 * @returns {this}
		 */
		clearHandlers: function( type ) {
			if ( type ) {
				var types = type.split( " " ),
					i = types.length - 1,
					item;
				for ( ; i >= 0; i-- ) {
					item = types[ i ];
					this._nameSpace( item, true );
					delete this._handlerMap[ item ];
					delete this.handlers[ item ];
				}
			} else {
				this.handlers = {};
			}
			return this;
		},
		/**
		 * Return index of handlers array. -1 means not found.
		 * @param {String}
		 * @param {Function}
		 * @param {Array<Function>} [handlers]
		 * @returns {Number}
		 */
		hasHandler: function( type, handler, handlers ) {
			handlers = handlers || this._nameSpace( type );
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
		 * Trigger an event.
		 * @param {String}
		 * @param {Context}
		 * @param {...*} [args]
		 * @returns {this}
		 */
		trigger: function( type, target, args ) {
			var handlers = this._nameSpace( type );
			if ( handlers instanceof Array && handlers.length ) {
				for ( var i = 0, len = handlers.length, arg = $.util.argToArray( arguments, 2 ); i < len; i++ )
					handlers[ i ].apply( target, arg );
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
		 * @param {String}
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
		_removeHandler: function( type, handler ) {
			/// <summary>移除自定义事件</summary>
			/// <param name="type" type="String">方法类型</param>
			/// <param name="handler" type="Function">方法</param>
			/// <returns type="self" />
			var handlers = this._nameSpace( type ),
				i = this.hasHandler( type, handler, handlers );
			if ( i > -1 ) {
				handlers.splice( i, 1 );
			}
			return this;
		},
		_nameSpace: function( type, re ) {
			var nameList = type.split( "." ),
				result = this._initSpace( nameList, this.handlers, re );
			//, i = 0, nameSpace, name, result;
			//nameList.length > 2 && tools.error({ fn: "CustomEvent._nameSpace", msg: "nameSpace is too long" });

			this._handlerMap[ type ] || ( this._handlerMap[ type ] = result );
			return result;
		},
		_initSpace: function( nameList, nameSpace, re ) {
			var name = nameList[ 0 ],
				result;
			//name = nameList[1];
			if ( nameSpace ) {
				result = nameSpace[ name ];
				if ( !result || re ) {
					nameSpace[ name ] = {};
				}
				nameSpace = nameSpace[ name ];
				if ( !nameSpace[ "__" + name ] ) {
					nameSpace[ "__" + name ] = [];
				}
				result = nameSpace[ "__" + name ];
			}
			nameList.splice( 0, 1 );
			return nameList.length ? this._initSpace( nameList, nameSpace, re ) : result;
		}
	} );

	return CustomEvent;
} );