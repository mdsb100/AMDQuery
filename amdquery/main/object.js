﻿aQuery.define( "main/object", [ "base/typed", "base/array", "base/extend" ], function( $, typed, array, utilExtend ) {
	"use strict";
	this.describe( "Define Class" );
	var
	pushSuperStack = function( self ) {
		var stack;
		if ( !self.__superStack ) {
			self.__superStack = [];
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
				stack.pop();
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
		_superInit = function() {
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
		_getFunctionName = function( fn ) {
			if ( fn.name !== undefined ) {
				return fn.name;
			} else {
				var ret = fn.toString().match( /^function\s*([^\s(]+)/ );
				return ( ret && ret[ 1 ] ) || "";
			}
		},
		_defaultPrototype = {
			init: function() {
				return this;
			}
		},
		defaultValidate = function() {
			return 1;
		},
		inerit = function( Sub, Super, name ) {
			object.inheritProtypeWithParasitic( Sub, Super, name );
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

	/**
	 * @callback CollectionEachCallback
   * @param item {*}
   * @param index {Number}
	 */

	/**
	 * This provides methods used for method "extend" handling. It will be mixed in constructor.
	 * This methods is static.
	 * @public
	 * @mixin ObjectClassStaticMethods
	 */
	var ObjectClassStaticMethods = /** @lends ObjectClassStaticMethods */ {
		/**
		 * This constructor inherit Super constructor if you define a class which has not inherit Super.
		 * @public
		 * @method
		 * @param {Function} Super - Super constructor.
		 * @returns {this}
		 */
		inherit: function( Super ) {
			inerit( this, Super );
			return this;
		},
		/**
		 * Define a Sub Class. This constructor is Super Class.
		 * @param {Function|String} name - Sub constructor or Sub name.
		 * @param {Object} prototype - Instance methods.
		 * @param {Object} statics - Static methods.
		 * @returns {Function}
		 */
		extend: function( name, prototype, statics ) {
			var arg = $.util.argToArray( arguments );
			if ( typed.isObj( name ) ) {
				arg.splice( 0, 0, _getFunctionName( this ) || name.name || "anonymous" );
			}
			arg.push( this );
			/*arg = [name, prototype, statics, constructor]*/
			return object.extend.apply( object, arg );
		},
		/**
		 * Join Object into prototype.
		 * @param {...Object}
		 * @returns {this}
		 */
		joinPrototype: function() {
			for ( var i = 0, len = arguments.length, obj; i < len; i++ ) {
				obj = arguments[ i ];
				typed.isPlainObj( obj ) && utilExtend.extend( this.prototype, obj );
			}
			return this;
		},
		/**
		 * Determine whether the target is a instance of this constructor or this ancestor constructor.
		 * @param {Object} - A new instance.
		 * @returns {this}
		 */
		forinstance: function( target ) {
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
		/**
		 * Create Getter or Setter for this constructor.prototype.

		 * @param {Object<String,Object>|String|Function}
		 */
		createGetterSetter: function( object ) {
			object.createPropertyGetterSetter( this, object );
		},
		/** fn is pointer of this.prototype */
		fn: null
	};

	/**
	 * This provides methods used for method "collection" handling. It will be mixed in constructor.prototype
	 * This methods is prototype.
	 * @public
	 * @mixin CollectionClassPrototypeMethods
	 */

	/**
	 * @pubilc
	 * @exports main/object
	 * @requires module:base/typed
	 * @requires module:base/array
	 * @requires module:base/extend
	 */
	var object = {
		/**
		 * Define a Class.
		 * <br /> Mixin {@link ObjectClassStaticMethods} into new Class.
		 * <br /> see {@link module:main/object.createPropertyGetterSetter}
		 * @example
		 * var Super = object.extend( "Super", {
		 *   init: function( name ){
		 *     console.log( "Super", name );
		 *     this.name = name;
		 *   },
		 *   checkName: function( name ){
		 *     console.log( "Super", this.name == name );
		 *     return this.name == name;
		 *   }
		 * }, {
		 *   doSomething: function( ){ };
		 * } );
		 *
		 * function Sub( name ){
		 *   this._super( name );
		 *   this.name = name;
		 *   console.log( "Sub", name );
		 * };
		 *
		 * Super.extend( Sub, { // extend is created by mixin
		 *   checkName: function( name ){
		 *     // The invoke is created by object.extend
		 *     Super.invoke( "checkName", name );
		 *     console.log( "Sub", this.name == name );
		 *     return this.name == name;
		 *   }
		 * }, {
		 *   doSomething: function( ){ };
		 * } );
		 *
		 * var super = new Super( "Lisa" );
		 * // Super Lisa
		 * var sub = new Sub( "Iris" );
		 * // Super Iris
		 * // Sub Iris
		 * sub.checkName( "Iris" );
		 * // Super true
		 * // Sub true
		 * Sub.doSomething();
		 * Super.doSomething();
		 *
		 * //mixin
		 * Sub.joinPrototype( {
		 *   foo: function() {}
		 * }, {
		 *   pad: function() {}
		 * } );
		 * sub.foo();sub.pad();
		 *
		 * Super.forinstance( sub ) // true
		 *
		 * Sub.createGetterSetter( {
		 *   name: "-pa"
		 * } );
		 *
		 * @param {String|Function} - Name or Function.
		 * @param {Object} - Instance methods.
		 * @param {Object} - Static methods.
		 * @param {Function} [Super] - Super Class.
		 * @returns {Function}
		 */
		extend: function( name, prototype, statics, Super ) {
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
					anonymous = function anonymous() {
						this.init.apply( this, arguments );
					};
			}

			if ( Super ) {
				inerit( anonymous, Super );
			}

			prototype = utilExtend.extend( {}, _defaultPrototype, prototype );
			prototype.constructor = anonymous;

			utilExtend.easyExtend( anonymous.prototype, prototype );

			utilExtend.easyExtend( anonymous, ObjectClassStaticMethods );

			utilExtend.easyExtend( anonymous, statics );

			anonymous.fn = anonymous.prototype;

			return anonymous;
		},
		/**
		 * If model is a function, you should call "this.init()".
		 * <br /> Mixin {@link CollectionClassPrototypeMethods} into new Collection.
		 * @param {String|Function} - If model is a function, then will use model.name. Then class name is name + "Collection".
		 * @param {Object} - Instance methods.
		 * @param {Object} - Static methods.
		 * @param {Function} [Super]
		 */
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

			var CollectionClassPrototypeMethods = /** @lends CollectionClassPrototypeMethods */ {
				/** A constructor of class */
				init: function() {
					this.models = [];
					this.__modelMap = {};
					prototype.init ? prototype.init.apply( this, arguments ) : this.add.apply( this, arguments );
					return this;
				},
				/**
				 * Add model into collection
				 * @param {...model}
				 * @returns {this}
				 */
				add: function( model ) {
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
				/**
				 * Pop model from collection
				 * @returns {model}
				 */
				pop: function() {
					return this.remove( this.models[ this.models.length - 1 ] );
				},
				/**
				 * Remove model from collection
				 * @param {model|Number|String} - String means id. Number means index. model is a model.
				 * @returns {model}
				 */
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
				/**
				 * Get model from collection
				 * @param {String|Number} - String means id. Number means index.
				 * @returns {model}
				 */
				get: function( id ) {
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
				/**
				 * Clear all model
				 * @returns {this}
				 */
				clear: function() {
					this.models = [];
					this.__modelMap = {};
					return this;
				},
				/**
				 * Iteration the list of model.
				 * @param {CollectionEachCallback}
				 * @param {Object} [context] - Context.
				 * @returns {this}
				 */
				each: function( fn, context ) {
					/// <summary>遍历整个model</summary>
					/// <param name="fn" type="Function">方法</param>
					/// <param name="context" type="Object">上下文</param>
					/// <returns type="self" />
					for ( var i = 0, model = this.models, item; item = model[ i++ ]; )
						fn.call( context || item, item, i );
					return this;
				}
			};

			var _expendo = 0,
				_prototype = utilExtend.extend( {}, prototype, CollectionClassPrototypeMethods ),
				_statics = utilExtend.extend( {}, statics ),
				name = typeof model == "string" ? model : model.name + "Collection";

			return object.extend( name, _prototype, _statics, Super );
		},
		/**
		 * Get the object properties count.
		 * @param {Object}
		 * @param {Boolean} - If true , does not count prototype.
		 * @returns {Number}
		 */
		getObjectPropertiesCount: function( obj, bool ) {
			var count = 0;
			for ( var i in obj ) {
				bool == true ? object.isPrototypeProperty( obj, i ) || count++ : count++;
			}
			return count;
		},
		/**
		 * Does not contain the same memory address, the constructor will not be called multiple times.
		 * @param {Sub}
		 * @param {Super}
		 * @returns {this}
		 */
		inheritProtypeWithExtend: function( Sub, Super ) {
			var con = Sub.prototype.constructor;
			utilExtend.easyExtend( Sub.prototype, Super.prototype );
			Sub.prototype.constructor = con || Super.prototype.constructor;
			return this;
		},
		/**
		 * Use parasitic to inherit prototype. Does not contain the same memory address.
		 * @param {Sub}
		 * @param {Super}
		 * @param {String} - You can see the name of the parent class in the prototype chain instead "Parasitic".
		 * @returns {this}
		 */
		inheritProtypeWithParasitic: function( Sub, Super, name ) {
			if ( !Super ) {
				return this;
			}
			var
			originPrototype = Sub.prototype,
				name = Super.name || name,
				Parasitic = typeof name == "string" ? ( eval( "(function " + name + "() { });" ) || eval( "(" + name + ")" ) ) : function() {};
			Parasitic.prototype = Super.prototype;
			Sub.prototype = new Parasitic();
			//var prototype = Object(Super.prototype);
			//Sub.prototype = prototype;
			utilExtend.easyExtend( Sub.prototype, originPrototype );
			//Sub.prototype.constructor = Sub;

			return this;
		},
		/**
		 * Use classic combination to inherit prototype. Contains the same memory address.
		 * @param {Sub}
		 * @param {Super}
		 * @returns {this}
		 */
		inheritProtypeWithCombination: function( Sub, Super ) {
			Sub.prototype = new Super();
			return this;
		},
		/**
		 * Whether it is the prototype property.
		 * @param {*}
		 * @param {String}
		 * @returns {Boolean}
		 */
		isPrototypeProperty: function( obj, name ) {
			/// <summary>是否是原型对象的属性</summary>
			/// <param name="obj" type="any">任意对象</param>
			/// <param name="name" type="String">属性名</param>
			/// <returns type="Boolean" />
			return "hasOwnProperty" in obj && !obj.hasOwnProperty( name ) && ( name in obj );
		},
		/**
		 * Create Getter or Setter for this constructor.prototype.
		 * @link module:main/object.createPropertyGetterSetter
		 * @example
		 * function Person(){};
		 * // "u" means public, "a" means private.
		 * object.createPropertyGetterSetter(Person, {
		 *  id: "-pu -r",
		 *  name: "-pu -w -r",
		 *  age: "-pa -w -r",
		 *  Weight: "-wa -ru",
		 *  mark: {
		 *    purview: "-wa -ru",
		 *    defaultValue: 0, // set prototype.mark = 0.
		 *    validate: function( mark ){ return mark >= 0 && mark <= 100; } // validate param when setting.
		 *    edit: function( value ){ return value + ""; } // edit value when getting.
		 *  },
		 *  height: function( h ){ return h >= 100 && h <= 220; } // validate param when setting.
		 * } );
		 * var person = new Person();
		 * person.getId();
		 * person.getName(); person.setName();
		 * person._getAge(); person._setAge();
		 * person._getWeight(); person.setWeight();
		 * person.getMark(); // "0"
		 * person._setMark( 110 );
		 * person.getMark(); // "0"
		 * person._setMark( 100 );
		 * person.getMark(); // "100"
		 *
		 * @param {Function} obj - A constructor.
		 * @param {Object<String,Object>|String|Function}
		 * return {obj.prototype}
		 */
		createPropertyGetterSetter: function( obj, object ) {
			if ( !typed.isPlainObj( object ) ) {
				return this;
			}

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
					this[ ( setPrefix || prefix ) + $.util.camelCase( key, "get" ) ] = function() {
						return edit ? edit.call( this, this[ key ] ) : this[ key ];
					};
				}
			}, obj.prototype );
		}
	};

	return object;
} );