defing( "module/PageRouting", [ "base/Promise", "main/CustomEvent" ], function( Promise, CustomEvent ) {
  "use strict"; //启用严格模式
  var PageRouting = CustomEvent.extend( "PageRouting", {
    init: function( originString ) {
      this._super( );
      this.originString = null;
      this.ruleList = [ ];
      this.accept( originString );
    },
    accept: function( originString ) {
      if ( originString.indexOf( "#" ) === 0 ) {
        this.originString = originString.replace( "#", "" );
      }
      return this;
    },
    parse: function( rule ) {
      if ( this.originString ) {
        var
        item,
          i = 0,
          list = this.originString.split( rule )
          self = this;
        var promise = new Promise( );

        $.each( list, function( item ) {
          self.trigger( "iteration", self, {
            type: "iteration",
            name: item
          } );
        } );


        this.trigger( this.originString );
      }
      return this;
    }
  }, {
    assignThisLocationHash: function( ) {
      return new PageRouting( window.location.hash );
    }
  } );
  return PageRouting;
} );