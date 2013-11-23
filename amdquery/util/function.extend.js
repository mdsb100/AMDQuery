aQuery.define( "util/function.extend", [ "base/extend" ], function( $, utilExtend ) {
	"use strict"; //启用严格模式
	utilExtend.easyExtend( $.util, {
		compose: function() {
			var funcs = arguments;
			return function() {
				var args = arguments;
				for ( var i = funcs.length - 1; i >= 0; i-- ) {
					args = [ funcs[ i ].apply( this, args ) ];
				}
				return args[ 0 ];
			};
		},


		debounce: function( fun, wait, immediate ) {
			//undefinded does not work well when titanium
			var timeout = null,
				result = null;
			return function() {
				var context = this,
					args = arguments;
				var later = function() {
					timeout = null;
					if ( !immediate ) result = fun.apply( context, args );
				};
				var callNow = immediate && !timeout;
				clearTimeout( timeout );
				timeout = setTimeout( later, wait );
				if ( callNow ) result = fun.apply( context, args );
				return result;
			};
		},

		defer: function( fun, context ) {
			var args = $.util.argToArray( arguments, 1 );
			return setTimeout( function() {
				fun.apply( context, args );
			}, 1 );
		},

		once: function( fun ) {
			var ran = false,
				memo;
			return function() {
				if ( ran ) return memo;
				ran = true;
				memo = fun.apply( this, arguments );
				fun = null;
				return memo;
			};
		},

		throttle: function( fun, wait ) {
			var context, args, timeout, result;
			var previous = 0;
			var later = function() {
				previous = new Date();
				timeout = null;
				result = fun.apply( context, args );
			};

			return function() {
				var now = new Date();
				var remaining = wait - ( now - previous );
				context = this;
				args = arguments;
				if ( remaining <= 0 ) {
					clearTimeout( timeout );
					timeout = null;
					previous = now;
					result = fun.apply( context, args );
				} else if ( !timeout ) {
					timeout = setTimeout( later, remaining );
				}
				return result;
			};
		}
	} );
	return $.util;
}, "consult underscore" );