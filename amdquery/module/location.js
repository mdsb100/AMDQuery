aQuery.define( "module/location", [ "base/extend", "main/parse" ], function( $, utilExtend, parse ) {
	this.describe( "Location to Hash" );
	/**
	 * @pubilc
	 * @module module/location
	 * @describe window.location to hash
	 * @example
	 * // http://localhost:8080/document/app/asset/source/guide/AMDQuery.html#swapIndex=1!scrollTo=#Config
	 * {
	 *   swapIndex: "1",
	 *   scrollTo:  "#Config"
	 * }
	 */
	var
	SPLIT_MARK = "!",
		EQUALS_MARK = "=",
		_location = window.location;

	function hashToString( hash, split1, split2 ) {
		var key, value, strList = [];
		for ( key in hash ) {
			value = hash[ key ];
			strList.push( key + split2 + value );
		}
		return strList.join( split1 );
	}

	var location = {
		getHash: function( key ) {
			this.toHash();
			return this.hash[ key ];
		},
		setHash: function( key, value ) {
			this.hash[ key ] = value + "";
			_location.hash = hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
			return this;
		},
		removeHash: function( key ) {
			if ( this.hash[ key ] !== undefined ) {
				delete this.hash[ key ];
				_location.hash = hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
			}
			return this;
		},
		clearHash: function() {
			window.location.hash = "";
			this.hash = {};
			return this;
		},
		toHash: function() {
			this.hash = parse.QueryString( _location.hash.replace( "#", "" ), SPLIT_MARK, EQUALS_MARK );
			return this;
		},
		hash: {}
	};

	location.toHash();

	return location;
} );