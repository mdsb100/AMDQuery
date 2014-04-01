aQuery.define( "base/typed", function( $ ) {
	"use strict";
	this.describe( "Support typeof function" );
	var
	class2type = {},
		hasOwnProperty = class2type.hasOwnProperty,
		toString = class2type.toString;

	$.each( "Boolean Number String Function Array Date RegExp Object Error".split( " " ), function( name, i ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );
	/**
	 * Determine the type of object。
	 * @public
	 * @exports base/typed
	 * @borrows aQuery.forinstance as is$
	 */
	var typed = {
		/**
		 * Is it an element collection?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isEleConllection: function( a ) {
			return typed.isType( a, "[object NodeList]" ) ||
				typed.isType( a, "[object HTMLCollection]" ) ||
				( typed.isNum( a.length ) && !typed.isArr( a.length ) &&
				( a.length > 0 ? typed.isEle( a[ 0 ] ) : true ) &&
				( typed.isObj( a.item ) || typed.isStr( a.item ) ) );
		},
		/**
		 * Is an event of Dom?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isEvent: function( a ) {
			return a && !! ( toString.call( a ).indexOf( "Event" ) > -1 || ( a.type && a.srcElement && a.cancelBubble !== undefined ) || ( a.type && a.target && a.bubbles !== undefined ) )
		},
		/**
		 * Is it arguments?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isArguments: function( a ) {
			return !!a && "callee" in a && this.isNum( a.length );
		},
		/**
		 * Is it a array?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isArr: function( a ) {
			return typed.isType( a, "[object Array]" );
		},
		/**
		 * Does it like a array?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isArrlike: function( obj ) {
			var length = obj.length,
				type = typed.type( obj );

			if ( typed.isWindow( obj ) ) {
				return false;
			}

			if ( obj.nodeType === 1 && length ) {
				return true;
			}

			return type === "array" || type !== "function" &&
				( length === 0 ||
				typeof length === "number" && length > 0 && ( length - 1 ) in obj );
		},
		/**
		 * Is it Boolean?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isBol: function( a ) {
			return typed.isType( a, "[object Boolean]" );
		},
		/**
		 * Is it Date?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isDate: function( a ) {
			return typed.isType( a, "[object Date]" );
		},
		/**
		 * Is it Document?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isDoc: function( a ) {
			return !!toString.call( a ).match( /document/i );
		},
		/**
		 * Is it Element?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isEle: function( a ) {
			if ( !a || a === document ) return false;
			var str = ( a.constructor && a.constructor.toString() ) + Object.prototype.toString.call( a )
			if ( ( str.indexOf( "HTML" ) > -1 && str.indexOf( "Collection" ) == -1 ) || a.nodeType === 1 ) {
				return true;
			}
			return false;
		},
		/**
		 * Is it empty?
		 * @param {*}
		 * @returns {Boolean}
		 * @example
		 * var a = null, b = undefined, c = [], d = {}, e = "";
		 * typed.isEmpty(a); // true
		 * typed.isEmpty(b); // true
		 * typed.isEmpty(c); // true
		 * typed.isEmpty(d); // true
		 * typed.isEmpty(e); // true
		 */
		isEmpty: function( a ) {
			if ( a == null ) return true;
			if ( typed.isArr( a ) || typed.isStr( a ) ) return a.length == 0;
			return typed.isEmptyObj( a );
		},
		/**
		 * Is it empty object?
		 * @param {*}
		 * @returns {Boolean}
		 * @example
		 * var a = [], b = {};
		 * typed.isEmptyObj(a); // true
		 * typed.isEmptyObj(b); // true
		 */
		isEmptyObj: function( obj ) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		},
		/**
		 * Is it Error?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isError: function( a ) {
			return typed.isType( a, "[object Error]" );
		},
		/**
		 * Is it Finite?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isFinite: function( a ) {
			return isFinite( a ) && !isNaN( parseFloat( a ) );
		},
		/**
		 * Is it Function?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isFun: function( a ) {
			return typed.isType( a, "[object Function]" );
		},
		/**
		 * Is it native JSON?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNativeJSON: function( a ) {
			return window.json && typed.isType( a, "object JSON" );
		},
		/**
		 * Is it not a Number?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNaN: function( a ) {
			return typed.isNum( a ) && a != +a;
		},
		/**
		 * Is it a Number?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNum: function( a ) {
			return typed.isType( a, "[object Number]" );
		},
		/**
		 * Is it a Numeric?
		 * @param {*}
		 * @returns {Boolean}
		 * @example
		 * typed.isNum("5"); // false
		 * typed.isNumeric("5"); // true
		 */
		isNumeric: function( a ) {
			return !isNaN( parseFloat( a ) ) && isFinite( a );
		},
		/**
		 * Is it null? "undefined", "null" and "NaN" return true.
		 * @param {*}
		 * @returns {Boolean}
		 */
		isNul: function( a ) {
			return a === undefined || a === null || typed.isNaN( a );
		},
		/**
		 * Is it element node?
		 * @param {*}
		 * @param {String} - Name of node.
		 * @returns {Boolean}
		 */
		isNode: function( ele, name ) {
			return typed.isEle( ele ) ? ( ele.nodeName && ele.nodeName.toUpperCase() === name.toUpperCase() ) : false;
		},
		/**
		 * Is it Object? "undefined" is not Object.
		 * @param {*}
		 * @returns {Boolean}
		 */
		isObj: function( a ) {
			return a !== undefined ? typed.isType( a, "[object Object]" ) : false;
		},
		/**
		 * Whether it is the prototype property.
		 * @param {*}
		 * @param {String}
		 * @returns {Boolean}
		 */
		isPrototypeProperty: function( obj, name ) {
			return "hasOwnProperty" in obj && !obj.hasOwnProperty( name ) && ( name in obj );
		},
		/**
		 * Is it plain Object?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isPlainObj: function( obj ) {
			if ( !obj || !typed.isObj( obj ) || obj.nodeType || obj.setInterval ) {
				return false;
			}

			// Not own constructor property must be Object
			if ( obj.constructor && !hasOwnProperty.call( obj, "constructor" ) && !hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
			var key;
			for ( key in obj ) {
				break;
			}

			return key === undefined || hasOwnProperty.call( obj, key );
		},
		/**
		 * Is it a RegExp?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isRegExp: function( a ) {
			return typed.isType( a, "[object RegExp]" );
		},
		/**
		 * Is it a String?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isStr: function( a ) {
			return typed.isType( a, "[object String]" );
		},
		/**
		 * @param {*}
		 * @param {String} - like "[object Number]", "[object String]"
		 * @returns {Boolean}
		 * @example
		 * typed.isType( 5, "[object Number]" ) // true
		 */
		isType: function( a, b ) {
			return toString.call( a ) == b;
		},
		/**
		 * It is XML?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isXML: function( ele ) {
			// documentElement is verified for cases where it doesn't yet exist
			// (such as loading iframes in IE - #4833)
			var documentElement = ( ele ? ele.ownerDocument || ele : 0 ).documentElement;

			return documentElement ? documentElement.nodeName !== "HTML" : false;
		},
		/**
		 * It is window?
		 * @param {*}
		 * @returns {Boolean}
		 */
		isWindow: function( a ) {
			return a != null && a == a.window;
		},
		/**
		 * Object.is is a proposed addition to the ECMA-262 standard
		 * @param {Object}
		 * @param {Object}
		 * @returns {Boolean}
		 * @example
		 * Object.is("foo", "foo");     // true
		 * Object.is(window, window);   // true
		 *
		 * Object.is("foo", "bar");     // false
		 * Object.is([], []);           // false
		 *
		 * var test = {a: 1};
		 * Object.is(test, test);       // true
		 *
		 * Object.is(null, null);       // true
		 *
		 * // Special Cases
		 * Object.is(0, -0);            // false
		 * Object.is(-0, -0);           // true
		 * Object.is(NaN, 0/0);         // true
		 */
		is: function( v1, v2 ) {
			if ( Object.is ) {
				return Object.is( v1, v2 );
			}
			if ( v1 === 0 && v2 === 0 ) {
				return 1 / v1 === 1 / v2;
			}
			if ( v1 !== v1 ) {
				return v2 !== v2;
			}
			return v1 === v2;
		},
		/**
		 * Object A is equal to Object B.
		 * @param {Object}
		 * @param {Object}
		 * @returns {Boolean}
		 * @example
		 * var a = { foo : { fu : "bar" } };
		 * var b = { foo : { fu : "bar" } };
		 * aQuery.util.isEqual(a, b) //return true
		 */
		isEqual: function( x, y ) {
			if ( this.is( x, y ) )
				return true;

			if ( !( x instanceof Object ) || !( y instanceof Object ) ) return false;

			if ( x.constructor !== y.constructor ) return false;

			for ( var p in x ) {
				if ( !x.hasOwnProperty( p ) ) continue;

				if ( !y.hasOwnProperty( p ) ) return false;

				if ( x[ p ] === y[ p ] ) continue;

				if ( typeof( x[ p ] ) !== "object" ) return false;

				if ( !typed.isEqual( x[ p ], y[ p ] ) ) return false;
			}

			for ( p in y ) {
				if ( y.hasOwnProperty( p ) && !x.hasOwnProperty( p ) ) return false;
			}
			return true;
		},
		is$: $.forinstance,
		/**
		 * Return object type.
		 * @param {*}
		 * @returns {String}
		 */
		type: function( obj ) {
			if ( obj == null ) {
				return String( obj );
			}
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		}
	};

	return typed;
} );