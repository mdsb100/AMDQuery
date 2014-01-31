define( "html5/localStorage", [ "html5/Storage" ], function( Storage, undefined ) {
  "use strict";
  this.describe( "Local Storage" );
  var localStorage = window.localStorage || window.globalStorage[ location.host ];
  /**
   * Return a Storage instance of local.
   * @pubilc
   * @module html5/localStorage
   * @requires module:html5/Storage
   */
  return new Storage( localStorage );
} );