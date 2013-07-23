define( "ecma5/function.compati", function( ) {
  "use strict"; //启用严格模式
  if ( !Function.prototype.bind ) {
    Function.prototype.bind = function( context ) {
      var self = this;
      return function( ) {
        return self.apply( context || window, arguments );
      };
    };
  }

  return Function;

} );