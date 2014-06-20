define( "ecma5/function", function() {
  "use strict";
  this.describe( "ECMA Function" );
  /**
   * Extend Function.prototype.bind
   * @pubilc
   * @exports ecma5/function
   */
  if ( !Function.prototype.bind ) {
    Function.prototype.bind = function( context ) {
      var self = this;
      return function() {
        return self.apply( context || window, arguments );
      };
    };
  }

  return Function;

} );