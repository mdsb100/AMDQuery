aQuery.define( "app/Controller", [ "base/ClassModule", "base/typed", "base/Promise", "main/query", "main/attr", "main/object", "main/CustomEvent", "app/View", "app/Model" ], function( $, ClassModule, typed, Promise, query, attr, object, CustomEvent, View, Model, undefined ) {
  "use strict"; //启用严格模式
  var Controller = CustomEvent.extend( "Controller", {
    init: function( src, contollerElement, View, Models ) {
      this._super( );
      this.src = src;

      this.id = attr.getAttr( contollerElement, "id" ) || null;

      this.view = new View( contollerElement );
      // 生成Models
      //this.models = Models || [ ];

      Controller.collection.add( this );

      var selfController = this;

      this.promise = new Promise( function( ) {
        var promise = new Promise;
        selfController.view.domReady( function( ) {
          promise.resolve( );
        } );
        return promise;
      } ).then( function( ) {
        var promise = new Promise;
        Controller.loadController( selfController.view.topElement, function( controllers ) {
          promise.resolve( controllers );
        } );
        return promise;
      } ).then( function( controllers ) {
        if ( controllers.length ) {
          for ( var i = controllers.length - 1, controller; i >= 0; i-- ) {
            controller = controllers[ i ]
            if ( controller.getId( ) ) {
              selfController[ controller.getId( ) ] = controller;
            }
          };
          return controllers;
        }
      } ).then( function( ) {
        selfController.onReady( );
        selfController.trigger( "ready", selfController, {
          type: "ready"
        } );

      } );

      this.promise.rootResolve( );

    },
    event: function( ) {

    },
    /*super*/
    _initHandler: function( ) {
      var self = this;
      this.event = function( e ) {
        switch ( e.type ) {

        }
      };
    },
    addModels: function( models ) {
      if ( !typed.isArr( models ) ) {
        models = $.util.argToArray( arguments );
      }
      this.models = this.models.concat( models );
    },
    destory: function( ) {
      this.onDestroy( );

      this.promise.destoryFromRoot( );

      this.promise = null;

      Controller.collection.removeController( this );

      this.view.destory( );
    },
    ready: function( fn ) {
      // var self;
      // setTimeout( function( ) {
      this.promise.and( fn );
      // }, 0 );
      return this;
    },
    onDestroy: function( ) {

    },
    onReady: function( ) {

    }
  }, {
    loadController: function( node, callback ) {
      var contollersElement = typed.isNode( node, "controller" ) ? $(node) : query.find( "controller", node ),
        controller = [ ];

      if ( contollersElement.length ) {
        var
        element,
          src,
          i = 0,
          len = contollersElement.length,
          depend = [ ];

        for ( ; i < len; i++ ) {
          element = contollersElement[ i ];
          element.style.display = "block";
          src = attr.getAttr( element, "src" );
          src = $.util.removeSuffix( src );
          depend.push( src );
        }

        require( depend, function( ) {
          var Controllers = $.util.argToArray( arguments ),
            ret = [ ],
            i = 0,
            len = Controllers.length;

          for ( ; i < len; i++ ) {
            ret.push( new Controllers[ i ]( depend[ i ], contollersElement[ i ] ) );
            ret[ i ].ready( function( ) {
              i--;
              if ( i === 0 ) {
                callback( ret );
                depend = contollersElement = null;
              }
            } );
          }
          //这里必须等controllers ready

        } );
      } else {
        callback && callback( [ ] );
      }

    }
  } );

  var ControllerCollection = object.Collection( Controller, {} );

  Controller.collection = new ControllerCollection;

  object.providePropertyGetSet( Controller, {
    id: "-pu -r"
  } );

  return Controller;
} );