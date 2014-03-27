aQuery.define( "module/Test", [ "base/typed", "base/Promise", "base/config", "main/event" ], function( $, typed, Promise, config, event ) {
	"use strict";
	this.describe( "Test Module" );
	var TestEventType = "test.report";
	var logger, error, info, debug;
	if ( window.console && window.console.log.bind && !config.module.testLogByHTML ) {
		logger = $.logger;
		error = $.error;
		info = $.info;
		debug = $.debug;
	} else {
		var dialog = $.createEle( "pre" );

		dialog.style.cssText = "display:block;position:absolute;width:600px;height:200px;overflow:scroll;z-index:1000000;";
		dialog.style.right = "0px";
		dialog.style.top = "0px";
		document.body.appendChild( dialog );

		var colorMap = {
			log: "green",
			error: "red",
			info: "black",
			debug: "orange"
		};

		var input = function( type, arg ) {
			dialog.innerHTML = ( dialog.innerHTML + '<p style="color:' + colorMap[ type ] + '" >' + "<strong>" + type + ":<strong>" + arg.join( " " ) + '</p>' + "\n" );
			dialog.scrollTop = dialog.scrollHeight;
		};

		logger = function() {
			input( "log", $.util.argToArray( arguments ) );
		};

		error = function() {
			input( "error", $.util.argToArray( arguments ) );
		};

		info = function() {
			input( "info", $.util.argToArray( arguments ) );
		};

		debug = function() {
			input( "debug", $.util.argToArray( arguments ) );
		};

	}
	/**
	 * Event reporting that a test has been trigger.
	 * @event aQuery#"test.report"
	 * @param {String} name  - Test name.
	 * @param {Number} count - Test count.
	 * @param {Number} fail  - fail count.
	 * @param {Array<String>} failInfoList  - List of fail information.
	 */

	/**
	 * You can see Test.html.
	 * @public
	 * @module module/Test
	 * @requires module:base/Promise
	 * @requires module:base/config
	 */

	/**
	 * Test Module.
	 * @constructor
	 * @param {String} - Name of the test.
	 * @param {Function=} - The complete function of resoving all promise.
	 * @parma {String=} - Description to this test, will log when test begin.
	 * @alias module:module/Test
	 */
	function Test( name, complete, description ) {
		this.name = "[" + name + "]";
		this.complete = complete || function() {};
		this.promise = new Promise( function( preResult ) {
			description && logger( description );
			logger( this.name, "User Agent:", navigator.userAgent );
			logger( this.name, "Test start", "Test:" + this.count );
			return preResult;
		} ).withContext( this );
		this.count = 0;
		this.fail = 0;
		this.failInfoList = [];
	}

	/**
	 * console.log or log in html.
	 * @method logger
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.logger = logger;
	/**
	 * console.error or error in html.
	 * @method error
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.error = error;
	/**
	 * console.info or info in html.
	 * @method info
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.info = info;
	/**
	 * console.debug or debug in html.
	 * @method debug
	 * @param {...String}
	 * @memberOf module:module/Test
	 */
	Test.debug = debug;
	/**
	 *{undefined|DOMElement}
	 * @memberOf module:module/Test
	 */
	Test.dialog = dialog;

	var ssuccess = "√",
		sfail = "X";

	Test.prototype = /** @lends module:module/Test.prototype */ {
		constructor: Test,

		_fail: function() {
			this.fail++;
			this.failInfoList.push( $.util.argToArray( arguments ).join( " " ) );
		},

		/**
		 * Execute a function and non-return.
		 * @param {String} - The describe of this test.
		 * @param {Function} - The function of this test.
		 * @param {Promise=} - If get a Promise instance then this test will be async.
		 * @returns {this}
		 * @example
		 * var promise1 = new Promise;
		 * new Test("TestTest", function(preResult){
		 *   // complete
		 * })
		 * .execute("Test execute async. After 1 seconds, 'promise1.resolve'. ", function(){
		 *   setTimeout(function(){
		 *     promise1.resolve();
		 *   }, 1000);
		 * })
		 * .execute("Test execute async. After 1 seconds, the next test is executed. ", function(){
		 *
		 * }, promise1)
		 * .start();
		 */
		execute: function( describe, executeFn, promise ) {
			this.count++;
			this.promise = this.promise.then( function( preResult ) {
				if ( Promise.forinstance( promise ) ) {
					promise.then( function( result ) {
						this._execute( describe, executeFn, result != null ? result : preResult );
					} ).withContext( this );
					return promise;
				} else {
					this._execute( describe, executeFn, preResult );
					return preResult;
				}
			} );
			return this;
		},
		_execute: function( describe, executeFn, preResult ) {
			try {
				executeFn( preResult );
				logger( this.name, describe, ssuccess );
			} catch ( e ) {
				this._fail( describe, sfail, e );
				error( this.name, describe, sfail, e );
				throw e;
			}
		},
		/**
		 * Execute a function and return a result.
		 * @param {String} - The describe of this test.
		 * @param {*} - The result.
		 * @param {Function} - The function of this test.
		 * @param {Promise=} - If get a Promise instance then this test will be async.
		 * @returns {this}
		 * @example
		 * var promise1 = new Promise;
		 * new Test("TestTest", function(preResult){
		 *   // complete
		 * })
		 * .equal("Test equal async. After 1 seconds, 'promise1.resolve'. ", true, function(){
		 *   setTimeout(function(){
		 *     promise1.resolve();
		 *   }, 1000);
		 *   return true;
		 * })
		 * .equal("Test equal async. After 1 seconds, the next test is executed and preResult is true. ", true, function(preResult){
		 *   return preResult;
		 * }, promise1)
		 * .start();
		 */
		equal: function( describe, value, resultBackFn, promise ) {
			this.count++;
			this.promise = this.promise.then( function( preResult ) {
				if ( Promise.forinstance( promise ) ) {
					promise.then( function( result ) {
						return this._equal( describe, value, resultBackFn, result != null ? result : preResult );
					} ).withContext( this );
					return promise;
				} else {
					return this._equal( describe, value, resultBackFn, preResult );
				}
			} );
			return this;
		},
		_equal: function( describe, value, resultBackFn, preResult ) {
			try {
				var result = resultBackFn( preResult );
			} catch ( e ) {
				this._fail( describe, sfail, e );
				error( this.name, describe, sfail, e );
				throw e;
			}
			if ( typed.isEqual( result, value ) ) {
				logger( this.name, describe, ssuccess );
			} else {
				this._fail( describe, sfail );
				error( this.name, describe, sfail );
			}
			return result;
		},
		/**
		 * Create a task for testing.
		 * @param {String} - The describe of this test.
		 * @param {Function} - The function of this test.
		 * @param {Promise=} - If get a Promise instance then this test will be async.
		 * @returns {this}
		 * @example
		 * var testTest = new Test("TestTest", function(preResult){
		 *   // complete
		 * })
		 * .task("Test task", function(preResult, equal, execute){
		 *   equal("Test equal", true, true, preResult);
		 *   execute("Test execute", function(){}, preResult);
		 *   return preResult;
		 * })
		 * .start();
		 */
		task: function( describe, fn, promise ) {
			var self = this;
			var equal = function( equalDesc, value, result, preResult ) {
				var newDescribe = "\\--------" + equalDesc;
				self.count++
				self._equal( newDescribe, value, function() {
					return result;
				}, preResult );
			},
				execute = function( executeDesc, executeFn, preResult ) {
					var newDescribe = "\\--------" + executeDesc;
					self.count++
					self._execute( newDescribe, executeFn, preResult );
				};

			this.promise = this.promise.then( function( preResult ) {
				logger( this.name, "Do task:", describe );
				if ( Promise.forinstance( promise ) ) {
					promise.then( function( result ) {
						return fn( result != null ? result : preResult, equal, execute );
					} ).withContext( this );
					return promise;
				} else {
					return fn( preResult, equal, execute );
				}
			} );
			return this;
		},
		/**
		 * Start test
		 * @param {*} - The first result.
		 * @returns {this}
		 */
		start: function( firstResult ) {
			this.promise.then( function() {
				Test[ this.fail == 0 ? "logger" : "error" ]( this.name, "Test stop", "Test:" + this.count, "Success" + ( this.count - this.fail ), "Fail:" + this.fail );
				this.complete();
				this.report();
			} );
			this.promise.root().resolve( firstResult );
			return this;
		},
		/**
		 * If window.parent.aQuery is exists then trigger "test" event.
		 * @inner
		 * @fires aQuery#"test.report"
		 * @returns {this}
		 */
		report: function() {
			if ( window.parent && window.parent.aQuery && window.parent.aQuery.trigger ) {
				window.parent.aQuery.trigger( TestEventType, null, {
					type: TestEventType,
					name: this.name,
					count: this.count,
					fail: this.fail,
					failInfoList: this.failInfoList
				} );
			}
			return this;
		}
	};

	return Test;
} );