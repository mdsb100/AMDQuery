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
			var describe = $.util.argToArray( arguments ).join( " " )
			this.failInfoList.push( describe );
			error( describe );
		},
		_isEqual: function( describe, result, value, not ) {
			this.count++;
			var bol = typed.isEqual( result, value );
			if ( not ) {
				bol = !bol;
			}
			if ( bol ) {
				logger( describe, ssuccess );
			} else {
				this._fail( describe, sfail );
			}
		},
		_beCall: function( describe, todoFn, isThrow ) {
			this.count++;
			var err = null,
				bol = false;
			try {
				todoFn();
			} catch ( e ) {
				err = e;
				bol = true;
			}

			if ( isThrow ) {
				bol = !bol;
				if ( !err ) {
					error = "";
				}
			}

			if ( bol ) {
				this._fail( describe, sfail, err );
			} else {
				logger( describe, ssuccess );
			}

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
		 * .describe("Test a", function(preResult, test, logger){
		 *  var testTarget = {
		 *
		 *  };
		 *  test(testTarget, "testTarget").should.be.an("object");
		 *
		 *  var myName = "Jarray";
		 *  test(myName, "My name").should.be.a("string");
		 *  setTimeout(function(){
		 *    promise.resolve(preResult)
		 *  }, 3000)
		 * })
		 * .describe("Test a", function(preResult, test, logger){
		 *  //should.be.an
		 *  //should.be.a
		 *  //should.be.greater.than
		 *  //should.be.less.than
		 *  //should.be.greater.than.or.equal
		 *  //should.be.less.than.or.equal
		 *  //should.be.instance.of
		 *  //should.equal
		 *  //should.not.equal
		 *  //should.exists
		 *  //should.not.exists
		 *  //should.Throw
		 *  //should.not.Throw
		 *  //should.have.length
		 *  //should.have.property
		 *  //should.have.property().with
		 *  //should.have.index().with
		 * }, promise)
		 * .start();
		 */
		describe: function( describe, fn, promise ) {
			var self = this;

			function testWrapper( target, describe ) {
				return new TestWrapper( target, describe || "", self );
			}

			this.promise = this.promise.then( function( preResult ) {
				logger( this.name, describe );
				if ( Promise.forinstance( promise ) ) {
					promise.then( function( result ) {
						try {
							return fn( result != null ? result : preResult, testWrapper, logger );
						} catch ( e ) {
							error( e );
							throw e;
							return;
						}
					} ).withContext( this );
					return promise;
				} else {
					try {
						return fn( preResult, testWrapper, logger );
					} catch ( e ) {
						error( e );
						throw e;
						return;
					}
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

	function TestWrapper( target, describe, testObject ) {
		var testWrapper = this;
		this.should = {
			be: {
				a: function( value ) {
					testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "be", "a", "'" + String( value ) + "'" ), typeof target, value );
					return testWrapper;
				},
				an: function( value ) {
					testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "be", "an", "'" + String( value ) + "'" ), typeof target, value );
					return testWrapper;
				},
				greater: {
					than: function( value ) {
						testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "be", "greater", "than", "'" + String( value ) + "'" ), target > value, true );
						return testWrapper;
					}
				},
				less: {
					than: function( value ) {
						testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "be", "less", "than", "'" + String( value ) + "'" ), target < value, true );
						return testWrapper;
					}
				},
				instance: {
					of: function( value ) {
						testObject._beCall( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "instance", "of", value.name || "'" + String( value ) + "'" ), target instanceof value, true );
						return testWrapper;
					}
				}
			},
			equal: function( value ) {
				testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "equal", "'" + String( value ) + "'" ), target, value );
				return testWrapper;
			},
			have: {
				length: function( value ) {
					if ( typeof target.length !== "number" ) {
						testObject.count++
						testObject._fail( describe, "target", "have", "not", "length", sfail );
						return testWrapper;
					}
					if ( typeof value !== "number" ) {
						testObject.count++
						testObject._fail( describe, "parameter", "value is not a number", sfail );
						return testWrapper;
					}
					testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "have", "length", "'" + String( value ) + "'" ), target.length, value );
					return testWrapper;
				},
				property: function( name ) {
					var bol = target != null || target[ name ] !== undefined;
					testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "have", String( name ), "property" ), bol, true );
					if ( bol ) {
						testWrapper = new TestWrapper( target[ name ], "With property " + name, testObject );
						testWrapper.with = testWrapper;
					}
					return testWrapper;
				},
				index: function( index ) {
					var bol = target != null || target[ index ] !== undefined;
					testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "have", "index", index ), bol, true );
					if ( bol ) {
						testWrapper = new TestWrapper( target[ index ], "With index " + index, testObject );
						testWrapper.with = testWrapper;
					}
					return testWrapper;
				}
			},
			exists: function() {
				testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "exists" ), target !== undefined && target !== null, true );
				return testWrapper;
			},
			not: {
				equal: function( value ) {
					testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "not", "equal", "'" + String( value ) + "'" ), target, value, true );
					return testWrapper;
				},
				exists: function() {
					testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "not", "exists" ), target == null, true );
					return testWrapper;
				},
				Throw: function() {
					testObject._beCall( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "not", "Throw" ), target );
					return testWrapper;
				}
			},
			Throw: function() {
				testObject._beCall( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "Throw" ), target, true );
				return testWrapper;
			}
		};

		this.should.be.greater.than.or = {
			equal: function( value ) {
				testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "be", "greater", "than", "or", "equal", "'" + String( value ) + "'" ), target >= value, true );
				return testWrapper;
			}
		}
		this.should.be.less.than.or = {
			equal: function( value ) {
				testObject._isEqual( testWrapper.combineString( describe, "'" + String( target ) + "'", "should", "be", "less", "than", "or", "equal", "'" + String( value ) + "'" ), target <= value, true );
				return testWrapper;
			}
		}
	}

	TestWrapper.prototype.combineString = function() {
		return $.util.argToArray( arguments ).join( " " );
	}

	return Test;
} );