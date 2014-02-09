define( "html5/Storage", [ "main/event", "module/parse" ], function( event, parse, undefined ) {
	"use strict";
	this.describe( "HTML5 Storage" );
	/**
	 * @callback StorageCallback
	 * @param event {Object} - callback event.
	 * @param event.key {String} - Key of Storage.
	 * @param event.newValue {String}.
	 * @param event.oldValue {String}.
	 * @param event.url {String}.
	 * @param event.storageArea
	 */

	/**
	 * @public
	 * @module html5/Storage
	 */

	/**
	 * Wrap Storage.
	 * @constructor
	 * @alias module:html5/Storage
	 * @param {Object} storage - window.localStorage or window.sessionStorage
	 */
	var Storage = function( storage ) {
		this.storage = storage;
	};
	Storage.prototype = /** @lends module:html5/Storage.prototype */ {
		constructor: Storage,
		/**
		 * @param {StorageCallback}
		 * @returns {this}
		 */
		addChangeHandler: function( fun ) {
			return event.document.addHandler( window, "storage", fun );
		},
		/**
		 * Clear storage
		 * @returns {this}
		 */
		clear: function() {
			this.storage.clear();
			return this;
		},
		/**
		 * Get data by key.
		 * @param {String}
		 * @returns {JSON}
		 */
		get: function( key ) {
			var value = this.storage.getItem( key );
			return value ? parse.parseJSON( value ) : value;
		},
		/**
		 * Set data.
		 * @param {String}
		 * @param {*} data - Stringify data.
		 * @returns {this}
		 */
		set: function( key, data ) {
			this.storage.setItem( key, JSON.stringify( data ) );
			return this;
		},
		/**
		 * Get data by list.
		 * @param {Array<String>}
		 * @returns {Object<String, JSON>}
		 */
		getByList: function( keyList ) {
			var valueList = {}, i = 0,
				key,
				len = keyList.length;
			for ( ; i < len; i++ ) {
				key = keyList[ i ];
				valueList[ key ] = this.get( key );
			}
			return valueList;
		},
		/**
		 * Get data by Object.
		 * @param {Object<String, JSON>}
		 * @returns {this}
		 */
		setByObject: function( object ) {
			var key, value;
			for ( key in object ) {
				value = object[ key ];
				this.set( key, value );
			}
			return this;
		}
	};

	return Storage;
} );