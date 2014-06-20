aQuery.define( "module/location", [ "base/extend", "main/parse" ], function( $, utilExtend, parse ) {
  this.describe( "Location to Hash" );

  var
    SPLIT_MARK = "&",
    EQUALS_MARK = "=",
    SHARP = "#",
    _location = window.location;

  function hashToString( hash, split1, split2 ) {
    var key, value, strList = [];
    for ( key in hash ) {
      if ( key === SHARP ) {
        continue;
      }
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
   *   "#": navmenu=guide_Build!swapIndex=1 // The "#" alway equals whole hash string.
   *   "swapIndex": "1",
   *   "scrollTo":  "#Config"
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
      var str = key === SHARP ? value : hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
      _location.hash = str;
      this.hash[ SHARP ] = str;
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
        var str = hashToString( this.hash, SPLIT_MARK, EQUALS_MARK );
        _location.hash = str;
        this.hash[ SHARP ] = str;
      }
      return this;
    },
    /**
     * Clear window.location.hash
     * @returns {this}
     */
    clearHash: function() {
      window.location.hash = "";
      this.hash = {
        "#": ""
      };
      return this;
    },
    /**
     * Parse window.location.hash to object for this.hash.
     * @returns {this}
     */
    toHash: function() {
      var hash = _location.hash.replace( SHARP, "" );
      this.hash = parse.QueryString( hash, SPLIT_MARK, EQUALS_MARK );
      this.hash[ SHARP ] = hash;
      return this;
    },
    /**
     * An object of window.location.hash.
     * @type {Object}
     */
    hash: {},
    /**
     * Change location if you want to use window.top
     * @param {Location}
     */
    changeLocation: function( location ) {
      _location = location;
    }
  };

  location.toHash();

  return location;
} );