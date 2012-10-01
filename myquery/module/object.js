/// <reference path="../myquery.js" />

myQuery.define("module/object", ["base/extend"], function ($, extend) {
    //依赖extend
    "use strict"; //启用严格模式

    var object = {
        //继承模块 可以自己实现一个 function模式 单继承
        _defaultPrototype: {
            init: function () {
                return this;
            }
            , render: function () {
                return this;
            }
        }
        , Class: function (name, prototype, statics, supper) {
            /// <summary>定义一个类</summary>
            /// <para>构造函数会执行init和render</para>
            /// <param name="name" type="String/Function/null">函数名或构造函数</param>
            /// <param name="prototype" type="Object">prototype原型</param>
            /// <param name="static" type="Object">静态方法</param>
            /// <param name="supper" type="Function">父类</param>
            /// <returns type="self" />
            var argLen = arguments.length;
            switch (argLen) {
                case 0:
                case 1:
                    return null;
                case 3:
                    if (typeof statics == "function") {
                        supper = statics;
                        statics = null;
                    }
                    break;

            }

            var anonymous;
            switch (typeof name) {
                case "function":
                    anonymous = name;
                    break;
                case "string":
                    anonymous =
                    (eval(
                    [
                        "(function ", name, "() {\n",
                        "    this.init.apply(this, arguments);\n",
                        "    this.render.apply(this,arguments);\n",
                        "});\n"
                    ].join(""))
                    || eval("(" + name + ")"))//fix ie678
                    break;
                default:
                    anonymous = function () {
                        this.init.apply(this, arguments);
                        this.render.apply(this, arguments);
                    }
            }

            $.object.inheritProtypeWidthParasitic(anonymous, supper, name);
            prototype = $.extend({}, $.object._defaultPrototype, prototype);
            prototype.constructor = anonymous;
            $.easyExtend(anonymous.prototype, prototype);

            $.easyExtend(anonymous, statics);


            anonymous.__tag = "object.Class";

            if (supper) {
                anonymous._SupperConstructor = supper.__tag == "object.Class"
                ? function () {
                    var arg = $.argToArray(arguments), self = arg.splice(0, 1)[0];
                    supper.prototype.init.apply(self, arg);
                    supper.prototype.render.apply(self);
                }
                : function () {
                    var arg = $.argToArray(arguments), self = arg.splice(0, 1)[0];
                    supper.call(self, arg);
                }
            } else {
                anonymous._SupperConstructor = function () { };
            }

            return anonymous;
        }

        , getObjectAttrCount: function (obj, bool) {
            /// <summary>获得对象属性的个数</summary>
            /// <param name="obj" type="Object">对象</param>
            /// <param name="bool" type="Boolean">为true则剔除prototype</param>
            /// <returns type="Number" />
            var count = 0;
            for (var i in obj) {
                bool == true ? $.isPrototypeProperty(obj, i) || count++ : count++
            }
            return count;
        }

        , inheritProtypeWidthExtend: function (child, parent) {
            /// <summary>继承prototype 使用普通添加模式 不保有统一个内存地址 也不会调用多次构造函数</summary>
            /// <para>如果anotherPrototype为false对子类的prototype添加属性也会添加到父类</para>
            /// <para>如果child不为空也不会使用相同引用</para>
            /// <param name="child" type="Object">子类</param>
            /// <param name="parent" type="Object">父类</param>
            /// <returns type="self" />
            var con = child.prototype.constructor;
            $.easyExtend(child.prototype, parent.prototype);
            child.prototype.constructor = con || parent.prototype.constructor;
            return this;
        }
        , inheritProtypeWidthParasitic: function (child, parent, name) {//加个parentName
            /// <summary>继承prototype 使用寄生 不会保有同一个内存地址</summary>
            /// <param name="child" type="Object">子类</param>
            /// <param name="parent" type="Object">父类</param>
            /// <param name="name" tuype="String">可以再原型链中看到父类的名字 而不是Parasitic</param>
            /// <returns type="self" />
            if (!parent) {
                return this;
            }
            var Parasitic =
            typeof name == "string" ?
            (eval("(function " + name + "() { });") || eval("(" + name + ")"))
            : function () { };
            Parasitic.prototype = parent.prototype;
            child.prototype = new Parasitic();
            //var prototype = Object(parent.prototype);
            //child.prototype = prototype;
            child.prototype.constructor = child;

            return this;
        }
        , inheritProtypeWidthCombination: function (child, parent) {
            /// <summary>继承prototype 使用经典组合继承 不会保有同一个内存地址</summary>
            /// <para>如果anotherPrototype为false对子类的prototype添加属性也会添加到父类</para>
            /// <para>如果child不为空也不会使用相同引用</para>
            /// <param name="child" type="Object">子类</param>
            /// <param name="parent" type="Object">父类</param>
            /// <returns type="self" />
            child.prototype = new parent();
            return this;
        }
        , isPrototypeProperty: function (obj, name) {
            /// <summary>是否是原型对象的属性</summary>
            /// <param name="obj" type="any">任意对象</param>
            /// <param name="name" type="String">属性名</param>
            /// <returns type="Boolean" />
            return !obj.hasOwnProperty(name) && (name in obj);
        }

        , providePropertyGetSet: function (obj, list) {
            /// <summary>提供类的属性get和set方法</summary>
            /// <param name="obj" type="Object">类</param>
            /// <param name="list" type="Object/Array">属性名列表</param>
            /// <returns type="String" />
            return $.each(list, function (value, key) {
                this[$.camelCase(value, "set")] = function (a) {
                    this[value] = a;
                    return this;
                }
                this[$.camelCase(value, "get")] = function () {
                    return this[value];
                }
            }, obj.prototype);
        }

    };

    $.object = object;

    return object;
}, "1.0.0");