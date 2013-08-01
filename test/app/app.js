aQuery.define( "@app/app", [ "app/Application" ], function( $, Application ) {
  "use strict"; //启用严格模式
  var app = Application.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( promiseCallback );
    },
    launch: function( ) {

    }
  }, {

  }, Application );

  return app;
} );