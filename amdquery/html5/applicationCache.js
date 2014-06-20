define( "html5/applicationCache", function( undefined ) {
  "use strict";
  this.describe( "HTML5 applicationCache" );

  /**
   * @pubilc
   * @exports html5/applicationCache
   */
  var applicationCache = null;

  if ( window.applicationCache ) {
    var aCache = window.applicationCache;

    applicationCache = /** @lends module:html5/applicationCache */ {
      /**
       * @param {String} - Event name.
       * @param {Function}
       * @returns {this}
       */
      addEventListener: function( type, fun ) {
        aCache.addEventListener( type, fun, true );
        return this;
      },
      /**
       * @returns {this}
       */
      swapCache: function() {
        aCache.swapCache();
        return this;
      },
      /**
       * @param {String} - Event name.
       * @param {Function}
       * @returns {this}
       */
      removeEventListener: function( type, fun ) {
        aCache.removeEventListener( type, fun );
        return this;
      },
      /**
       * @param {Function}
       * @returns {this}
       */
      checking: function( fun ) {
        return this.addEventListener( arguments[ 1 ] || "checking", function() {
          fun.apply( this, arguments );
        } );
      },
      /**
       * @param {Function}
       * @returns {this}
       */
      noupdate: function( fun ) {
        return this.checking( fun, "noupdate" );
      },
      /**
       * @param {Function}
       * @returns {this}
       */
      downloading: function( fun ) {
        return this.checking( fun, "downloading" );
      },
      /**
       * @param {Function}
       * @returns {this}
       */
      progress: function( fun ) {
        return this.checking( fun, "progress" );
      },
      /**
       * @param {Function}
       * @returns {this}
       */
      updateready: function( fun ) {
        return this.checking( fun, "updateready" );
      },
      /**
       * @param {Function}
       * @returns {this}
       */
      cached: function( fun ) {
        return this.checking( fun, "cached" );
      },
      /**
       * @param {Function}
       * @returns {this}
       */
      error: function( fun ) {
        return this.checking( fun, "error" );
      }
    };
  }
  return applicationCache;
} );