aQuery.define( "app/View", [ "base/ClassModule", "main/communicate", "main/query", "main/object", "main/attr", "main/CustomEvent", "module/Widget", "module/src" ], function( $, ClassModule, communicate, query, object, attr, CustomEvent, Widget, src, undefined ) {
  //View need require depend on Widget
  //get Style
  "use strict"; //启用严格模式

  function getHtmlSrc( id ) {
    var index = id.lastIndexOf( "view/" );

    if ( index > -1 ) {
      return id.substring( 0, index ) + id.substring( index, id.length ).replace( /view\//, "xml/" );
    } else {
      throw "View need htmlSrc or path need contains view/'";
    }

  }

  var View = CustomEvent.extend( {
    init: function( contollerElement ) {
      this._super( );
      this.htmlSrc = this.htmlSrc || getHtmlSrc( this.constructor._AMD.id );
      this.topElement = View.getHTML( this.htmlSrc );
      attr.setAttr( this.topElement, "html-src", this.htmlSrc );
      this.id = attr.getAttr( this.topElement, "id" ) || null;

      var self = this;
      this.promise = new Promise( function( ) {
        self.onDomReady( );
        self.trigger( "domready", self, {
          type: "domready"
        } );
        return this;
      } );

      this.replaceTo( contollerElement );

      View.collection.add( this );


    },
    destory: function( ) {
      View.collection.remove( this );
      if ( this.topElement && this.topElement.parentNode ) {
        var self = this;
        Widget.destoryWidgets( this.topElement.parentNode );
        self.removeTo( );
      }
      this.promise.destoryFromRoot( );
      this.promise = null;
      this.topElement = null;
    },
    appendTo: function( parent ) {
      parent.appendChild( this.topElement );
      initDom( );
      return this;
    },
    replaceTo: function( element ) {
      element.parentNode.replaceChild( this.topElement );
      initDom( );
      return this;
    },
    removeTo: function( ) {
      if ( this.topElement.parentNode ) {
        this.topElement.parentNode.removeChild( this.topElement );
      }
      return this;
    },
    initDom: function( ) {
      var self = this;

      if ( this.promise.unfinished( ) && this.topElement && this.topElement.parentNode ) {
        Widget.initWidgets( this.topElement.parentNode, function( ) {
          self.promise.resolve( );
        } );
      }
    },
    _getModelsElement: function( ) {
      //Collection
      return query.find( ">Model", this.topElement );
    },
    getModelsSrc: function( ) {
      return this._getModelsElement( ).map( function( ele ) {
        var src = attr.getAttr( ele, "src" );
        if ( !src ) {
          throw "require model:src must exist";
        }
        return src;
      } );
    },
    _getCtrollerElement: function( ) {
      return query.find( ">Controller", this.topElement );
    },
    htmlSrc: "",
    _timeout: 5000,
    _error: function( ) {
      $.console.error( "get " + this.htmlSrc + " error" );
    },
    domReady: function( fn ) {
      // setTimeout( function( ) {
      this.promise.and( fn );
      // }, 0 );
      return this;
    },
    onDomReady: function( ) {

    }

  }, {
    getStyle: function( path ) {
      src.link( {
        href: $.getPath( ClassModule.variable( path ), ".css" )
      } );
    },
    getHtml: function( htmlSrc ) {
      htmlSrc = ClassModule.variable( htmlSrc );
      if ( !ClassModule.contains( htmlSrc ) ) {
        if ( htmlSrc === "" || !htmlSrc ) {
          define( htmlSrc, document.createElement( "div" ) );
        } else {
          var self = this;
          communicate.ajax( {
            url: htmlSrc,
            async: false,
            dataType: "xml",
            complete: function( xml ) {
              define( htmlSrc, xml );
            },
            timeout: View.timeout,
            timeoutFun: View.error
          } );
        }
      }
      return require( htmlSrc ).first.cloneNode( );
    }
  } );

  var ViewCollection = object.Collection( View, {} );

  View.collection = new ViewCollection;

  object.providePropertyGetSet( View, {
    id: "-pu -r"
  } );

  return View;
} );