aQuery.define( "@app/app", [ "app/Application" ], function( $, Application ) {
  "use strict"; //启用严格模式
  //必须依赖index controller
  var app = Application.extend( "Application", {
    init: function( promiseCallback ) {
      this._super( promiseCallback );
    },
    launch: function( ) {
      // this.index.doSomething
    }
  }, {

  }, Application );

  return app;
} );