 var buildConfig = {
   debug: false
 }

 var argvs = process.argv;

 var argvsMap = {
   "-d": function( ) {
     buildConfig.debug = true;
   }
 }

 var buildConfigFile = process.argv[ 2 ];
 if ( buildConfigFile ) {
   if ( !( /^\.*\//.test( buildConfigFile ) ) ) {
     buildConfigFile = './' + buildConfigFile;
   }
 } else {
   buildConfigFile = './buildjs_config.js';
 }
 console.log(buildConfigFile)
 require( buildConfigFile );


 for ( var i = 0, len = argvs.length, fn; i < len; i++ ) {
   fn = argvsMap[ argvs[ i ] ];
   if ( fn ) {
     fn( argvs[ i ] );
   }
 }


 var logger = buildConfig.debug ? console.info : function( ) {};

 var relativePath = process.argv[ 1 ].replace( /([\\\/])[^\\\/]*$/, '$1' );

 logger( relativePath )