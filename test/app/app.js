aQuery.define( "@app/app", [ "app/Application" ], function( $, Application ) {
  "use strict"; //启用严格模式
  //必须依赖index controller
  var app = Application.extend( "TestApplication", {
    init: function( promiseCallback ) {
      this._super( promiseCallback );
    },
    launch: function( ) {

    },
    beforeLoad: function( promise ) {
      this.addRouter("default", "@app/controller/index.js");
      this.addRouter("router", "@app/controller/router.js");
      promise.resolve( );
    }
  }, {

  }, Application );

  return app;
} );