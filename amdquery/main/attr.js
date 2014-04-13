aQuery.define( "main/attr", [ "base/typed", "base/extend", "base/support" ], function( $, typed, utilExtend, support, undefined ) {
	"use strict";
	//暂不要那么多hooks
	var fixSpecified = {
		name: true,
		id: true,
		coords: true
	},
		propFix = {
			tabindex: "tabIndex",
			readonly: "readOnly",
			"for": "htmlFor",
			"class": "className",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			cellpadding: "cellPadding",
			rowspan: "rowSpan",
			colspan: "colSpan",
			usemap: "useMap",
			frameborder: "frameBorder",
			contenteditable: "contentEditable"
		}, rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i;
	/**
	 * @exports main/attr
	 * @requires module:base/typed
	 * @requires module:base/extend
	 * @requires module:base/support
	 */
	var attrUtil = {
		/**
		 * @param {Element}
		 * @param {String}
		 * @returns {String}
		 */
		getAttr: function( ele, name ) {
			var ret;
			if ( !support.getSetAttribute ) {
				ret = ele.getAttributeNode( name );
				return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
					ret.nodeValue :
					undefined;
			}
			return ( ret = ele.getAttributeNode( name ) ) ? ret.nodeValue : undefined;
		},
		/**
		 * Exception select, checkbox, radio. <br/>
		 * If select is multiple choice, then return "America|England"
		 * @param {Element}
		 * @returns {String}
		 */
		getVal: function( ele ) {
			var type = ele.type.toUpperCase(),
				result;
			if ( typed.isNode( ele, "select" ) ) {
				result = ele.value;
				if ( typed.isNul( result ) || ele.multiple == true ) {
					result = [];
					$( ele ).posterity( ":selected" ).each( function( ele ) {
						result.push( ele.innerHTML );
					} );
					result = result.join( "|" );
				}
				return result;
			} else if ( typed.isNode( ele, "select" ) && ( type == "CHECKBOX" || type == "RADIO" ) )
				return ele.checked.toString();
			else
				return ele.value.toString();
		},
		/**
		 * @param {Element}
		 * @param {String}
		 * @returns {this}
		 */
		removeAttr: function( ele, key ) {
			var propName, attrNames, name, l, isBool, i = 0;

			if ( key && ele.nodeType === 1 ) {
				attrNames = key.toLowerCase().split( /\s+/ );
				l = attrNames.length;

				for ( ; i < l; i++ ) {
					name = attrNames[ i ];

					if ( name ) {
						propName = propFix[ name ] || name;
						isBool = rboolean.test( name );

						if ( !isBool ) {
							attrUtil.setAttr( ele, name, "" );
						}
						ele.removeAttribute( support.getSetAttribute ? name : propName );

						if ( isBool && propName in ele ) {
							ele[ propName ] = false;
						}
					}
				}
			}
			return this;
		},
		/**
		 * @param {Element}
		 * @param {String}
		 * @param {String|Number}
		 * @returns {this}
		 */
		setAttr: function( ele, name, value ) {
			if ( value == null ) {
				return attrUtil.removeAttr( ele, name );
			}
			if ( !support.getSetAttribute ) {
				var ret = ele.getAttributeNode( name );
				if ( !ret ) {
					ret = document.createAttribute( name );
					ele.setAttributeNode( ret );
				}
				ret.nodeValue = value + "";
			} else {
				ele.setAttribute( name, value );
			}
			return this;
		},
		/**
		 * Exception select, checkbox, radio. <br/>
		 * If select is multiple choice and value equals inner HTML of one element.
		 * @param {Element}
		 * @param {String|Boolean|Number}
		 * @returns {this}
		 */
		setVal: function( ele, value ) {
			var type = ele.type.toUpperCase();
			if ( typed.isNode( ele, "select" ) ) {
				if ( typed.isString( value ) || typed.isNumber( value ) )
					value = [ value ];
				$( ele ).find( "option" ).each( function( ele ) {
					ele.selected = false;
				} ).each( function( ele, index ) {
					$.each( value, function( val ) {
						if ( index === val || ele.innerHTML === val )
							ele.selected = true;
					}, this );
				} );
			} else if ( typed.isNode( ele, "input" ) && ( type == "CHECKBOX" || type == "RADIO" ) ) {
				if ( value === "checked" || value === "true" || value === true )
					ele.checked = true;
				else
					ele.value = value.toString();
			} else
				ele.value = value.toString();
			return this;
		}
	};

	$.fn.extend( /** @lends aQuery.prototype */ {
		/**
		 * Set or get attribute.
		 * @example
		 * $("#img").attr({
		 *   width: "100px",
		 *   height: "100px"
		 * }).attr("title", "Flower");
		 * $("#div1").attr("title", "Hello");
		 * $("#div2").attr("title", "World");
		 * $("#div1, #div2").attr("title"); // return "Hello"
		 * @param {String|Object}
		 * @param {String|Number} [value]
		 * @returns {this|String}
		 */
		attr: function( attr, value ) {
			if ( typed.isObject( attr ) ) {
				for ( var i in attr ) {
					this.each( function( ele ) {
						attrUtil.setAttr( ele, i, attr[ i ] );
					} );
				}
			} else if ( typed.isString( attr ) ) {
				if ( value == undefined ) {
					return attrUtil.getAttr( this[ 0 ], attr );
				} else {
					this.each( function( ele ) {
						attrUtil.setAttr( ele, attr, value );
					} );
				}
			}
			return this;
		},
		/**
		 * Remove attribute.
		 * @param {String}
		 * @returns {this}
		 */
		removeAttr: function( name ) {
			return this.each( function( ele ) {
				attrUtil.removeAttr( ele, name );
			} );
		},
		/**
		 * Get or set value.
		 * @param {String|Boolean|Number} [value]
		 * @returns {this|String}
		 */
		val: function( value ) {
			return value ? this.each( function( ele ) {
				attrUtil.setVal( ele, value );
			} ) : attrUtil.getVal( this[ 0 ] );
		}
	} );

	return attrUtil;
} );