aQuery.define( "app/View", [ "base/ClassModule", "main/communicate", "main/query", "main/object", "main/attr", "main/CustomEvent", "module/Widget", "module/src" ], function( $, ClassModule, communicate, query, object, attr, CustomEvent, Widget, src, undefined ) {
  //View need require depend on Widget
  //get Style
  "use strict"; //启用严格模式
  var View = object.extend( "View", {
    init: function( ) {
      this._super( );
      this.topElement = View.getHTML( );
      attr.setAttr( this.topElement, "html-src", this.htmlSrc );
      this._initDomFlag = false;
      this.id = attr.getAttr( this.topElement, "id" ) || null;
      //不能有相同的两个src

      View.collection.add( this );
    },
    appendTo: function( parent ) {
      parent.appendChild( this.topElement );
      initDom( );
      return this;
    },
    replaceTo: function( parent, element ) {
      parent.replaceChild( this.topElement, element );
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
      if ( !this._initDomFlag && this.topElement && this.topElement.parentNode ) {
        Widget.initWidgets( this.topElement.parentNode, function( ) {
          self._initDomFlag = true
          self.onDomReady( );
          self.trigger( "domReady" );
        } );
      }
    },
    _getModelsElement: function( ) {
      //可能会错 找直接子元素
      //Collection
      return query.find( ">Model", this.topElement );
    },
    getModelsSrc: function( ) {
      return this._getModelsElement( ).map( function( ele ) {
        var src = attr.getAttr( ele, "src" );
        if ( !src ) {
          $.console.error( {
            fn: "require model",
            msg: "src must exist"
          }, true );
        }
        return src;
      } );
    },
    destory: function( ) {
      View.collection.remove( this );
      if ( this._initDomFlag && this.topElement && this.topElement.parentNode ) {
        var self = this;
        Widget.destoryWidgets( this.topElement.parentNode );
        self.removeTo( );
      }
    },
    htmlSrc: "",
    _timeout: 5000,
    _error: function( ) {
      $.console.error( "get " + this.htmlSrc + " error" );
    },
    getHtml: function( ) {
      if ( !ClassModule.contains( this.htmlSrc ) ) {
        if ( this.htmlSrc === "" ) {
          define( this.htmlSrc, document.createElement( "div" ) );
        } else {
          var self = this;
          communicate.ajax( {
            url: this.htmlSrc,
            async: false,
            dataType: "xml",
            complete: function( xml ) {
              define( self.htmlSrc, xml );
            },
            timeout: View.timeout,
            timeoutFun: View.error
          } );
        }
      },

      onDomReady: function( ) {

      }
      return require( this.htmlSrc ).first.cloneNode( );
    }
  }, {
    getStyle: function( path ) {
      src.link( {
        href: $.getPath( ClassModule.variable( path ), ".css" );
      } );
    }
  }, CustomEvent );

  var ViewCollection = object.Collection( View );

  View.collection = new ViewCollection;

  object.providePropertyGetSet( View, {
    id: "-pu -r"
  } );

  return View;
} );