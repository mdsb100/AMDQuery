define( "", [ "base/ClassModule", "main/communicate", "module/utilEval" ], function( ClassModule, communicate, utilEval ) {
  var syncLoadJs = function( url, id, error ) {
    var module = ClassModule.getModule( id );

    if ( ClassModule.resource[ url ] || ( module && ( module.getStatus() > 2 ) ) ) {
      return this;
    }

    ClassModule.resource[ url ] = id;

    communicate.ajax( {
      url: url,
      async: false,
      dataType: "text",
      complete: function( js ) {
        utilEval.functionEval( js );
      },
      timeout: _config.amd.timeout,
      fail: error
    } );

    return this;
  };

  var asyncLoadJs = ClassModule.loadJs;

  require.sync = function() {
    ClassModule.loadJs = syncLoadJs;
  };

  require.async = function() {
    ClassModule.loadJs = asyncLoadJs;
  };

  if ( _config.amd.sync ) {
    require.sync();
  }

  return require;

} );