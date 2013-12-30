aQuery.define( "html5/css3.position", [ "base/support", "main/position", "html5/css3" ], function( $, support, position, css3 ) {
  "use strict";
  this.describe( "Get positionX: left + translateX" );
  var css3Position = {
    getPositionX: function( ele ) {
      var x = position.getOffsetL( ele );
      if ( support.transform3d ) {
        x += css3.getTransform3dByName( ele, "translateX", true );
      }
      return x;
    },
    setPositionX: function( ele, isTransform3d, x ) {
      if ( isTransform3d && support.transform3d ) {
        css3.setTranslate3d( ele, {
          tx: x
        } );
      } else {
        position.setOffsetL( ele, x );
      }
      return this;
    },
    getPositionY: function( ele ) {
      var y = position.getOffsetT( ele );
      if ( support.transform3d ) {
        y += css3.getTransform3dByName( ele, "translateY", true );
      }
      return y;
    },
    setPositionY: function( ele, isTransform3d, y ) {
      if ( isTransform3d && support.transform3d ) {
        css3.setTranslate3d( ele, {
          ty: y
        } );
      } else {
        position.setOffsetT( ele, y );
      }
      return this;
    },
    getPositionXY: function( ele ) {
      return {
        x: this.getPositionX( ele ),
        y: this.getPositionY( ele )
      }
    },
    setPositionXY: function( ele, isTransform3d, pos ) {
      if ( isTransform3d && support.transform3d ) {
        var opt = {};
        pos.x !== undefined && ( opt.tx = pos.x );
        pos.y !== undefined && ( opt.ty = pos.y );
        css3.setTranslate3d( ele, opt );
      } else {
        pos.x !== undefined && position.setOffsetL( ele, pos.x );
        pos.y !== undefined && position.setOffsetT( ele, pos.y );
      }
      return this;
    },
    getLeftWithTranslate3d: function( ele ) {
      var t = this.getPositionX( ele ) || 0,
        cur = ele.offsetParent;
      while ( cur != null ) {
        t += this.getPositionX( cur );
        cur = cur.offsetParent;
      }
      return t;
    },
    getTopWithTranslate3d: function( ele ) {
      var t = this.getPositionY( ele ) || 0,
        cur = ele.offsetParent;
      while ( cur != null ) {
        t += this.getPositionY( cur );
        cur = cur.offsetParent;
      }
      return t;
    }
  };

  $.extend( css3Position );

  $.fn.extend( {
    getPositionX: function( ) {
      return css3Position.getPositionX( this[ 0 ] );
    },
    setPositionX: function( isTransform3d, x ) {
      return this.each( function( ele ) {
        css3Position.setPositionX( ele, isTransform3d, x );
      } );
    },
    getPositionY: function( ) {
      return css3Position.getPositionY( this[ 0 ] );
    },
    setPositionY: function( isTransform3d, y ) {
      return this.each( function( ele ) {
        css3Position.setPositionY( ele, isTransform3d, y );
      } );
    },
    getPositionXY: function( ) {
      return {
        x: css3Position.getPositionX( this[ 0 ] ),
        y: css3Position.getPositionY( this[ 0 ] )
      }
    },
    setPositionXY: function( isTransform3d, pos ) {
      return this.each( function( ele ) {
        css3Position.setPositionXY( ele, isTransform3d, pos );
      } );
    },
    getLeftWithTranslate3d: function( ) {
      return css3Position.getLeftWithTranslate3d( this[ 0 ] );
    },
    getTopWithTranslate3d: function( ) {
      return css3Position.getTopWithTranslate3d( this[ 0 ] )
    }
  } );

} );