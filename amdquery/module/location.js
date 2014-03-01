aQuery.define( "module/location", [ "base/extend", "main/parse" ], function( $, utilExtend, parse ) {
	this.describe( "Location to Hash" );

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

	/**
	 * @exports module/location
	 * @describe window.location to hash
	 * @example
	 * // http://mdsb100.github.io/homepage/amdquery/document/document/app.html#navmenu=guide_Build!swapIndex=1
	 * {
	 *   swapIndex: "1",
	 *   scrollTo:  "#Config"
	 * }
	 */
	var location = {
		/**
     * Get value form hash.
     * @param {String}
		 * @returns {String}
		 */
		getHash: function( key ) {
			this.toHash();
			return this.hash[ key ];
		},
    /**
     * Set value to hash by key.
     * @param {String}
     * @param {*}
     * @returns {this}
     */
		setHash: function( key, value ) {
			this.hash[ key ] = value + "";
			_location.hash = hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
			return this;
		},
    /**
     * Remove key from hash.
     * @param {String}
     * @returns {this}
     */
		removeHash: function( key ) {
			if ( this.hash[ key ] !== undefined ) {
				delete this.hash[ key ];
				_location.hash = hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
			}
			return this;
		},
    /**
     * Clear window.location.hash
     * @returns {this}
     */
		clearHash: function() {
			window.location.hash = "";
			this.hash = {};
			return this;
		},
    /**
     * Parse window.location.hash to object for this.hash.
     * @returns {this}
     */
		toHash: function() {
			this.hash = parse.QueryString( _location.hash.replace( "#", "" ), SPLIT_MARK, EQUALS_MARK );
			return this;
		},
    /**
     * An object of window.location.hash.
     * @type {Object}
     */
		hash: {}
	};

	location.toHash();

	return location;
} );