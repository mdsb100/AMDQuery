aQuery.define( "app/View", [
  "base/config",
  "base/ClassModule",
  "base/Promise",
  "base/typed",
  "main/communicate",
  "main/query",
  "main/object",
  "main/attr",
  "main/CustomEvent",
  "main/parse",
  "module/Widget",
  "module/src"
   ], function( $,
  config,
  ClassModule,
  Promise,
  typed,
  communicate,
  query,
  object,
  attr,
  CustomEvent,
  parse,
  Widget,
  src, undefined ) {
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

  var View = CustomEvent.extend( "View", {
    init: function( contollerElement, src ) {
      this._super( );
      this.topElement = this.initTopElement( src ).cloneNode( true );
      config.app.debug && console.log( this.topElement );
      attr.setAttr( this.topElement, "html-src", this.htmlSrc );
      View.collection.add( this );

      if ( typed.isNode( contollerElement, "controller" ) ) {
        this.replaceTo( contollerElement );
      } else {
        this.appendTo( contollerElement );
      }


    },
    initTopElement: function( src ) {
      src = src || ( getHtmlSrc( this.constructor._AMD.id ) + ".xml" );
      return View.getHtml( src );
    },
    destroy: function( ) {
      View.collection.remove( this );
      self.remove( );
      this.topElement = null;
    },
    appendTo: function( parent ) {
      //必须appendTo 或 replaceTo 才能触发ready
      parent.appendChild( this.topElement );
      this._initWidget( );
      config.app.debug && console.log( "View " + this.constructor._AMD.id + " appendTo" );
      return this;
    },
    replaceTo: function( element ) {
      var parentNode = element.parentNode;
      parentNode.replaceChild( this.topElement, element );
      try {
        //fix ie7
        for ( var i = parentNode.childNodes.length - 1, node; i >= 0; i-- ) {
          node = parentNode.childNodes[ i ];
          if ( typed.isNode( node, "/controller" ) ) {
            parentNode.removeChild( node );
          }
        };
      } catch ( e ) {}
      var self = this;

      self._initWidget( );

      config.app.debug && console.log( "View " + this.constructor._AMD.id + " replaceTo" );
      return this;
    },
    remove: function( ) {
      if ( this.topElement && this.topElement.parentNode ) {
        Widget.destroyWidgets( this.topElement.parentNode );
        $( this.topElement ).remove( );
      }
      return this;
    },
    _initWidget: function( ) {
      var self = this;

      if ( this.topElement && this.topElement.parentNode ) {
        Widget.initWidgets( this.topElement.parentNode );
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
    _getControllerElement: function( ) {
      return query.find( ">Controller", this.topElement );
    },
    htmlSrc: "",
    _timeout: 5000,
    _error: function( ) {
      $.console.error( "get " + this.htmlSrc + " error" );
    }
  }, {
    getStyle: function( path ) {
      src.link( {
        href: ClassModule.getPath( path, ".css" )
      } );
    },
    getHtml: function( htmlSrc ) {
      htmlSrc = ClassModule.variable( htmlSrc );
      var url = $.getPath( htmlSrc, ".xml" );
      if ( !ClassModule.contains( htmlSrc ) ) {
        if ( htmlSrc === "" || !htmlSrc ) {
          define( htmlSrc, document.createElement( "div" ) );
        } else {
          var self = this;
          communicate.ajax( {
            url: url,
            async: false,
            dataType: "string",
            complete: function( xml ) {
              define( htmlSrc, parse.HTML( xml ) );
            },
            timeout: View.timeout,
            timeoutFun: View.error
          } );
        }
      }
      return require( htmlSrc ).first;
    }
  } );

  var ViewCollection = object.Collection( View, {} );

  View.collection = new ViewCollection;

  object.providePropertyGetSet( View, {
    id: "-pu -r -w"
  } );

  return View;
} );