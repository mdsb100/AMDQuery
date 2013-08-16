aQuery.define( "app/Controller", [ "base/ClassModule", "base/typed", "base/Promise", "main/query", "main/attr", "main/object", "main/CustomEvent", "app/View", "app/Model" ], function( $, ClassModule, typed, Promise, query, attr, object, CustomEvent, View, Model, undefined ) {
  "use strict"; //启用严格模式
  var Controller = CustomEvent.extend( "Controller", {
    init: function( src, contollerElement, View, Models ) {
      this._super( );
      this.src = src;

      this.id = attr.getAttr( contollerElement, "id" );

      this.view = new View( contollerElement );
      // 生成Models
      //this.models = Models || [ ];

      Controller.collection.add( this );

      var selfController = this;

      this.promise = new Promise( function( ) {
        var promise = this;
        selfController.view.domready( function( ) {
          promise.resolve( );
        } );
        return this;
      } ).then( function( ) {
        var promise = this;
        Controller.loadController( selfController.view.topElement, function( controllers ) {
          promise.resolve( controllers );
        } );
        return this;
      } ).then( function( controllers ) {
        var self = this;

        var promise = new Promise( function( ) {
          self.resolve( );
        } );

        $.each( controllers, function( controller ) {
          if ( controller.getId( ) ) {
            selfController[ controller.getId( ) ] = controller;
          }

          promise.and( function( ) {
            var self = this;
            controller.ready( function( ) {
              self.together( this );
            } );
          } );
        } );

        return this;
      } ).then( function( ) {
        selfController.onReady( );
        selfController.trigger( "ready", {
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
    onReady: function( ) {

    }
  }, {
    loadController: function( container, callback ) {
      var contollersElement = query.find( "Require", container ),
        controller = [ ];

      if ( contollersElement.length ) {
        var
        element = contollersElement[ 0 ],
          src = attr.getAttr( element, "src" ),
          i = 1,
          len = contollersElement.length,
          module = require( src );

        controller.push( {
          module: module,
          element: element
        } );

        for ( ; i < len; i++ ) {
          element = contollersElement[ i ];
          src = attr.getAttr( element, "src" );
          module = module.require( src );
          controller.push( {
            module: module,
            element: element,
            src: src
          } );
        }

        module.addHandler( function( ) {
          var i = 0,
            len = controller.length,
            item,
            ret = [ ];

          for ( ; i < len; i++ ) {
            item = controller[ i ];
            ret.push( new item.module( item.module.id, item.element ) );
          }

          callback( ret );
          contollersElement = controller = null;

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