define( "html5/sessionStorage", [ "html5/Storage" ], function( Storage, undefined ) {
  "use strict";
  this.describe( "Session Storage" );
  var sessionStorage = window.sessionStorage;
  /**
   * Return a Storage instance of session.
   * @pubilc
   * @module html5/sessionStorage
   * @requires module:html5/Storage
   */
  return new Storage( sessionStorage );
} );