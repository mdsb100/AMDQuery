aQuery.define( "html5/Worker", function( $, undefined ) {
	"use strict";
	this.describe( "HTML5 Worker" );
	/**
	 * @public
	 * @module html5/Worker
	 */

	/**
	 * Wrap Worker.
	 * @constructor
   * @alias module:html5/Worker
	 * @param {String} path - Path of js.
	 */
	var MyWorker = function( path ) {
		if ( window.Worker ) {
			this.worker = new window.Worker( path || $.getPath( "html5/_Worker" ) );
		}
	}

	MyWorker.prototype = /** @lends module:html5/Worker.prototype */ {
		constructor: MyWorker,
		/**
		 * @param {String} - Event name.
		 * @param {Function}
		 * @returns {this}
		 */
		addHandler: function( type, fn ) {
			this.worker && this.worker.addEventListener( type, fn, false );
			return this;
		},
		/**
		 * Add a handler.
		 * @param {String} - Event name.
		 * @param {Function}
		 * @returns {this}
		 */
		on: function( type, fn ) {
			return this.addHandler( type, fn );
		},
		/**
		 * @param {String} - Event name.
		 * @param {Function}
		 * @returns {this}
		 */
		removeHandler: function( type, fn ) {
			this.worker && this.worker.removeEventListener( type, fn, false );
			return this;
		},
		/**
		 * Remove a handler.
		 * @param {String} - Event name.
		 * @param {Function}
		 * @returns {this}
		 */
		off: function( type, fn ) {
			return this.removeHandler( type, fn );
		},
		/**
		 * @param {Function}
		 * @returns {this}
		 */
		onError: function( fn ) {
			return this.on( "error", fn );
		},
		/**
		 * @param {Function}
		 * @returns {this}
		 */
		onMessage: function( fn ) {
			return this.on( "message", fn );
		},
    /**
     * @param {Function}
     * @param {Object}
     * @param {...Object}
     * @returns {this}
     */
		postMessage: function( todo, context, paras ) {
			this.worker && this.worker.postMessage( {
				todo: todo.toString(),
				paras: $.util.argToArray( arguments, 2 ),
				context: context || null
			} );
			return this;
		},
		/**
		 * Terminate the worker
		 */
		terminate: function() {
			this.worker && this.worker.terminate();
			return this;
		}
	};
	return MyWorker;
} );