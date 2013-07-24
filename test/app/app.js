myQuery.define( "$root/app/app", [ "app/Application" ], function( $, Application ) {
  "use strict"; //启用严格模式
  var app = object.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( promiseCallback );
    }
    launch: function( ) {
      
    }
  }, {

  }, Application );

  return app;
} );