aQuery.define( "main/object", [ "base/typed", "base/array", "base/extend" ], function( $, typed, array, utilExtend ) {
  //依赖extend
  "use strict"; //启用严格模式

  var
  pushSuperStack = function( self ) {
    var stack;
    if ( !self.__superStack ) {
      self.__superStack = [ ];
    }

    stack = self.__superStack;

    if ( stack.length ) {
      stack.push( stack[ stack.length - 1 ].prototype.__superConstructor );
    } else {
      stack.push( self.constructor.prototype.__superConstructor );
    }
  },
    popSuperStack = function( self ) {
      var stack = self.__superStack;
      if ( stack.length ) {
        stack.pop( );
      }
    },
    _getSuperConstructor = function( self ) {
      var stack = self.__superStack,
        tempConstructor;

      if ( stack && stack.length ) {
        tempConstructor = stack[ stack.length - 1 ];
      } else {
        tempConstructor = self.constructor.prototype.__superConstructor;
      }
      return tempConstructor;
    },
    _superInit = function( ) {
      var tempConstructor;

      pushSuperStack( this );
      tempConstructor = _getSuperConstructor( this );

      tempConstructor.prototype.init ? tempConstructor.prototype.init.apply( this, arguments ) : tempConstructor.apply( this, arguments );
      popSuperStack( this );
      return this;
    },
    _invoke = function( name, context, args ) {
      var fn = this.prototype[ name ];
      return fn ? fn.apply( context, typed.isArguments( args ) ? args : $.util.argToArray( arguments, 2 ) ) : undefined;
    },
    _inheritTemplate = function( Super ) {
      inerit( this, Super );
      return this;
    },
    _getFunctionName = function( fn ) {
      if ( fn.name !== undefined ) {
        return fn.name;
      } else {
        var ret = fn.toString( ).match( /^function\s*([^\s(]+)/ );
        return ( ret && ret[ 1 ] ) || "";
      }
    },

    _extendTemplate = function( name, prototype, statics ) {
      var arg = $.util.argToArray( arguments );
      if ( typed.isObj( name ) ) {
        arg.splice( 0, 0, _getFunctionName( this ) || name.name || "anonymous" );
      }
      arg.push( this );
      /*arg = [name, prototype, statics, constructor]*/
      return object.extend.apply( object, arg );
    },
    _joinPrototypeTemplate = function( ) {
      for ( var i = 0, len = arguments.length, obj; i < len; i++ ) {
        obj = arguments[ i ];
        typed.isPlainObj( obj ) && utilExtend.extend( this.prototype, obj );
      }
      return this;
    },
    _forinstance = function( target ) {
      var constructor = this,
        ret = target instanceof this;

      if ( ret == false ) {
        constructor = target.constructor;
        while ( !! constructor ) {
          constructor = constructor.prototype.__superConstructor;
          if ( constructor === target ) {
            ret = true;
            break;
          }
        }
      }
      return ret;
    },
    _createGetterSetter = function( object ) {
      object.providePropertyGetSet( this, object );
    },
    defaultValidate = function( ) {
      return 1;
    },
    inerit = function( Sub, Super, name ) {
      $.object.inheritProtypeWithParasitic( Sub, Super, name );
      Sub.prototype.__superConstructor = Super;
      Sub.prototype._super = _superInit;
      if ( !Super.invoke ) {
        Super.invoke = _invoke;
      }
    },
    extend = function( Sub, Super ) {
      object.inheritProtypeWithExtend( Sub, Super );
    },
    defaultPurview = "-pu -w -r";
  var object = {
    //继承模块 可以自己实现一个 function模式 单继承
    _defaultPrototype: {
      init: function( ) {
        return this;
      }
    },
    extend: function( name, prototype, statics, Super ) {
      /// <summary>定义一个类</summary>
      /// <para>构造函数会执行init和render</para>
      /// <param name="name" type="String/Function/null">函数名或构造函数</param>
      /// <param name="prototype" type="Object">prototype原型</param>
      /// <param name="static" type="Object">静态方法</param>
      /// <param name="Super" type="Function">父类</param>
      /// <returns type="self" />
      var anonymous;
      switch ( arguments.length ) {
        case 0:
        case 1:
          return null;
        case 3:
          if ( typeof statics == "function" ) {
            Super = statics;
            statics = null;
          }
          break;
      }

      switch ( typeof name ) {
        case "function":
          anonymous = name;
          break;
        case "string":
          anonymous = ( eval(
            [
              "(function ", name, "() {\n",
              "    this.init.apply(this, arguments);\n",
              "});\n"
            ].join( "" ) ) || eval( "(" + name + ")" ) ) //fix ie678
          break;
        default:
          anonymous = function anonymous( ) {
            this.init.apply( this, arguments );
          };
      }

      if ( Super ) {
        inerit( anonymous, Super );
      }

      prototype = utilExtend.extend( {}, $.object._defaultPrototype, prototype );
      prototype.constructor = anonymous;
      utilExtend.easyExtend( anonymous.prototype, prototype );

      anonymous.inherit = _inheritTemplate;
      anonymous.extend = _extendTemplate;
      anonymous.joinPrototype = _joinPrototypeTemplate;
      anonymous.forinstance = _forinstance;
      anonymous.createGetterSetter = _createGetterSetter;
      anonymous.fn = anonymous.prototype;

      utilExtend.easyExtend( anonymous, statics );

      return anonymous;
    },
    Collection: function( model, prototype, statics, Super ) {
      switch ( arguments.length ) {
        case 0:
        case 1:
          return null;
        case 3:
          if ( typeof statics == "function" ) {
            Super = statics;
            statics = null;
          }
          break;
      }

      var _expendo = 0,
        _prototype = utilExtend.extend( {}, prototype, {
          init: function( ) {
            this.models = [ ];
            this.__modelMap = {};
            prototype.init ? prototype.init.apply( this, arguments ) : this.add.apply( this, arguments );
            return this;
          },
          //getByCid: function () { },
          add: function( model ) {
            /// <summary>添加对象</summary>
            /// <param name="model" type="model<arguments>">对象</param>
            /// <returns type="self" />
            var arg = $.util.argToArray( arguments ),
              len = arg.length,
              i = 0;

            for ( ; i < len; i++ ) {
              model = arg[ i ];
              if ( !this.__modelMap[ model.id ] ) {
                this.models.push( model );
                this.__modelMap[ model.id || ( model.constructor.name + _expendo++ ) ] = model;
              }
            }
            return this;
          },
          pop: function( ) {
            /// <summary>移除最后个对象</summary>
            /// <returns type="Model" />
            return this.remove( this.models[ this.models.length - 1 ] );
          },
          remove: function( id ) {
            /// <summary>移除某个对象</summary>
            /// <param name="id" type="Object/Number/String">对象的索引</param>
            /// <returns type="Model" />
            var model = null,
              i;
            switch ( typeof id ) {
              case "number":
                model = this.models[ id ];
                break;
              case "string":
                model = this.__modelMap[ id ];
                break;
              case "object":
                model = id;
                break;
            }
            if ( model ) {
              this.models.splice( array.inArray( this.models, model ), 1 );
              for ( i in this.__modelMap ) {
                if ( this.__modelMap[ i ] == model ) {
                  delete this.__modelMap[ i ];
                }
              }
            }
            return model;
          },
          get: function( id ) {
            /// <summary>获得某个model</summary>
            /// <param name="id" type="Number/Object">方法</param>
            /// <returns type="self" />
            switch ( typeof id ) {
              case "number":
                model = this.models[ id ];
                break;
              case "string":
                model = this.__modelMap[ id ];
                break;
            }
            return model;
          },
          clear: function( ) {
            /// <summary>重置所含对象</summary>
            /// <returns type="self" />
            this.models = [ ];
            this.__modelMap = {};
            return this;
          },

          each: function( fn, context ) {
            /// <summary>遍历整个model</summary>
            /// <param name="fn" type="Function">方法</param>
            /// <param name="context" type="Object">上下文</param>
            /// <returns type="self" />
            for ( var i = 0, model = this.models, item; item = model[ i++ ]; )
              fn.call( context || item, item, i );
            return this;
          }
        } ),
        _statics = utilExtend.extend( {}, statics ),
        name = typeof model == "string" ? model : model.name + "Collection";

      return object.extend( name, _prototype, _statics, Super );
    },

    getObjectAttrCount: function( obj, bool ) {
      /// <summary>获得对象属性的个数</summary>
      /// <param name="obj" type="Object">对象</param>
      /// <param name="bool" type="Boolean">为true则剔除prototype</param>
      /// <returns type="Number" />
      var count = 0;
      for ( var i in obj ) {
        bool == true ? typed.isPrototypeProperty( obj, i ) || count++ : count++;
      }
      return count;
    },

    inheritProtypeWithExtend: function( Sub, Super ) {
      /// <summary>继承prototype 使用普通添加模式 不保有统一个内存地址 也不会调用多次构造函数</summary>
      /// <para>如果anotherPrototype为false对子类的prototype添加属性也会添加到父类</para>
      /// <para>如果Sub不为空也不会使用相同引用</para>
      /// <param name="Sub" type="Object">子类</param>
      /// <param name="Super" type="Object">父类</param>
      /// <returns type="self" />
      var con = Sub.prototype.constructor;
      utilExtend.easyExtend( Sub.prototype, Super.prototype );
      Sub.prototype.constructor = con || Super.prototype.constructor;
      return this;
    },
    inheritProtypeWithParasitic: function( Sub, Super, name ) { //加个SuperName
      /// <summary>继承prototype 使用寄生 不会保有同一个内存地址</summary>
      /// <param name="Sub" type="Object">子类</param>
      /// <param name="Super" type="Object">父类</param>
      /// <param name="name" tuype="String">可以再原型链中看到父类的名字 而不是Parasitic</param>
      /// <returns type="self" />
      if ( !Super ) {
        return this;
      }
      var
      originPrototype = Sub.prototype,
        name = Super.name || name,
        Parasitic = typeof name == "string" ? ( eval( "(function " + name + "() { });" ) || eval( "(" + name + ")" ) ) : function( ) {};
      Parasitic.prototype = Super.prototype;
      Sub.prototype = new Parasitic( );
      //var prototype = Object(Super.prototype);
      //Sub.prototype = prototype;
      utilExtend.easyExtend( Sub.prototype, originPrototype );
      //Sub.prototype.constructor = Sub;

      return this;
    },
    inheritProtypeWithCombination: function( Sub, Super ) {
      /// <summary>继承prototype 使用经典组合继承 不会保有同一个内存地址</summary>
      /// <para>如果Sub不为空也不会使用相同引用</para>
      /// <param name="Sub" type="Object">子类</param>
      /// <param name="Super" type="Object">父类</param>
      /// <returns type="self" />
      Sub.prototype = new Super( );
      return this;
    },
    isPrototypeProperty: function( obj, name ) {
      /// <summary>是否是原型对象的属性</summary>
      /// <param name="obj" type="any">任意对象</param>
      /// <param name="name" type="String">属性名</param>
      /// <returns type="Boolean" />
      return !obj.hasOwnProperty( name ) && ( name in obj );
    },
    providePropertyGetSet: function( obj, object ) {
      /// <summary>提供类的属性get和set方法</summary>
      /// <param name="obj" type="Object">类</param>
      /// <param name="object" type="Object">属性名列表</param>
      /// <returns type="String" />
      if ( !typed.isPlainObj( object ) ) {
        return this;
      }
      //这里加个验证a
      return $.each( object, function( value, key ) {
        var purview = defaultPurview,
          validate = defaultValidate,
          defaultValue,
          edit;
        switch ( typeof value ) {
          case "string":
            purview = value;
            break;
          case "object":
            if ( typed.isStr( value.purview ) ) {
              purview = value.purview;
            }
            if ( typed.isFun( value.validate ) ) {
              validate = value.validate;
            }
            if ( typed.isFun( value.edit ) ) {
              edit = value.edit;
            }
            defaultValue = value.defaultValue; //undefinded always undefinded
            break;
          case "function":
            validate = value;
            break;

        }
        this[ key ] = defaultValue;

        var prefix = /\-pa[\s]?/.test( purview ) ? "_" : "",
          setPrefix, getPrefix;

        if ( purview.match( /\-w([u|a])?[\s]?/ ) ) {
          getPrefix = RegExp.$1 == "a" ? "_" : "";
          this[ ( getPrefix || prefix ) + $.util.camelCase( key, "set" ) ] = function( a ) {
            if ( validate.call( this, a ) ) {
              this[ key ] = a;
            } else if ( defaultValidate !== undefined ) {
              this[ key ] = defaultValue;
            }

            return this;
          };
        }
        if ( purview.match( /\-r([u|a])?[\s]?/ ) ) {
          setPrefix = RegExp.$1 == "a" ? "_" : "";
          this[ ( setPrefix || prefix ) + $.util.camelCase( key, "get" ) ] = function( ) {
            return edit ? edit.call( this, this[ key ] ) : this[ key ];
          };
        }
      }, obj.prototype );
    }
  };

  $.object = object;

  return object;
}, "1.0.0" );