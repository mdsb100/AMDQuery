aQuery.define( "app/View", [ "base/ClassModule", "main/communicate", "main/query", "main/object", "main/attr", "main/CustomEvent", "module/Widget", ], function( $, ClassModule, communicate, query, object, attr, CustomEvent, Widget, undefined ) {
  "use strict"; //启用严格模式
  var View = object.extend( "View", {
    init: function( ) {
      this._super( );
      this.topElement = View.getHTML( );
      // this.src = viewSrc;
      this.id = attr.getAttr( this.topElement, "id" ) || null;
      //不能有相同的两个src

      View.addView( this );
    },
    _getModelsElement: function( ) {
      //可能会错 找直接子元素
      //Collection
      return query.find( ">Model", this.topElement );
    },
    _getModelsSrc: function( ) {
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
      View.removeView( this );
    },
    htmlSrc: "",
    _timeout: 5000,
    _error: function( ) {
      $.console.error( "get " + this.htmlSrc + " error" );
    },
    getHtml: function( ) {
      if ( !ClassModule.contains( this.htmlSrc ) ) {
        if ( this.htmlSrc === "" ) {
          define( this.htmlSrc, function( ) {
            return document.createElement( "div" );
          } );
        } else {
          var self = this,
            element;
          communicate.ajax( {
            url: this.htmlSrc,
            async: false,
            dataType: "xml",
            complete: function( xml ) {
              define( this.htmlSrc, xml );
            },
            timeout: View.timeout,
            timeoutFun: View.error
          } );
        }
      }
      return require( this.htmlSrc ).first.cloneNode( );
    }
  }, {
    views: [ ],
    // getInstance: function( viewElement, ViewObject ) {
    //   return ViewObject ? new ViewObject( viewElement ) : new View( viewElement );
    // },
    getView: function( id ) {
      var result;
      this.views.forEach( function( view ) {
        if ( view.getId( ) === id ) {
          result = view;
        }
      } );
      return result;
    },
    addView: function( view ) {
      if ( this.views.indexOf( ) === -1 ) {
        this.views.push( view );
      }
    },
    removeView: function( ) {
      var index = this.views.indexOf( );
      if ( index > -1 ) {
        this.views.splice( index, 1 );
      }
    }
  }, CustomEvent );

  object.providePropertyGetSet( View, {
    id: "-pu -r"
  } );

  return View;
} );