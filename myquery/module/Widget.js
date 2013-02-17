﻿/// <reference path="../myquery.js" />
myQuery.define("module/Widget", ["main/data", "main/query", "main/event", "main/attr", "module/object", "module/myEval"], function($, data, query, event, attr, object, myEval, undefined) {
    "use strict"; //启用严格模式
    function Widget(obj, target) {
        /// <summary>组件的默认基类</summary>
        /// <para></para>
        /// <param name="obj" type="Object">构造函数</param>
        /// <param name="target" type="$">$对象</param>
        /// <returns type="Widget" />
        // var tmp = this.options;
        // this.options = {};
        // $.extend(this.options, tmp);
        // //event.custom.call(this);
        // target._initHandler();
        // this.target = target;
        this.init(obj.target);
        //this._init_(obj, target)._create_()._render_();
    }

    object.Class(Widget, {
        able: function() {
            this.options.disabled === false ? this.disable() : this.enable();
        },
        checkAttr: function() {
            var key, attr, value, item, result = {},
                i = 0,
                len = 0;
            attr = this.target.attr("myquery-" + this.widgetName);
            if(attr !== undefined) {
                attr = attr.split(/;|,/);
                for(len = attr.length; i < len; i++) {
                    item = attr[i].split(":");
                    if(item.length == 2) {
                        key = item[0];
                        if(this.options[key] !== undefined) {
                            result[key] = myEval.evalBasicDataType(item[1]);
                        }
                        else if($.inArray(this.customEventName, key) > -1){
                             result[key] = myEval.functionEval(item[1], $);
                        }
                    }
                }
            }

            return result;
        },
        create: function() {},
        container: null,
        constructor: Widget
        // , _create_: function () {
        //     $.isFun(this.create) && this.create();
        //     //this.options.disabled === false ? this.disable() : this.enable();
        //     this.able();
        //     return this;
        // }
        ,
        customEventName: [],
        destory: function(key) {
            if(key) {
                this.disable();
                for(var i = this.customEventName.length-1; i>=0 ;i--) {
                    this.target.clearHandlers(this.widgetEventPrefix + "." + this.customEventName[i]);
                }
                
                this.container && this.options.removeContainer && $(this.container).remove();
                this.target.removeData(key);
                $.each(this, function(value, name) {
                    !$.isPrototypeProperty && delete this[name];
                }, this);
            }
        },
        disable: function() {
            //            $.each(this.event, function (control, name) {
            //                $.each(control, function (value, key) {
            //                    this[name].removeHandler(key, value);
            //                }, this);
            //            }, this);
        },
        enable: function() {
            //            $.each(this.event, function (control, name) {
            //                $.each(control, function (value, key) {
            //                    this[name].removeHandler(key, value);
            //                    this[name].addHandler(key, value);
            //                }, this);
            //            }, this);
        },
        event: function() {},

        init: function(obj, target) {
            //元素本身属性高于obj
            var defaultOptions = this.constructor.prototype.options;
            this.options = {};
            $.extend(this.options, Widget.prototype.options, defaultOptions);
            //event.custom.call(this);
            target._initHandler();
            this.target = target;
            //obj = $.extend(obj || {}, this.checkAttr());
            //$.isFun(this.init) && this.init(obj);
            obj = $.extend(this.checkAttr(), obj);
            this.option(obj);
            return this;
        },
        option: function(key, value) {
            if($.isObj(key)) $.each(key, function(value, name) {
                this.setOption(name, value);
            }, this);
            else if(value === undefined) return this.options[key];
            else if($.isStr(key)) this.setOption(key, value);
            //return this;
            //this._render_();
        },
        options: {
            disabled: 1,
            removeContainer: 1
        },
        public: {
            disable: 1,
            enable: 1,
            widget: 1,
            toString: 1,
            getSelf: 1
        },
        render: function() {},
        _initHandler: function() {},

        _isEventName: function(name) {
            return $.inArray(this.customEventName, name) > -1;
        },
        // , _render_: function () {//不应该由这个来绑定事件
        //     $.isFun(this.render) && this.render();
        //     return this;
        // }
        setOption: function(key, value) {
            if(this.options[key] !== undefined) {
                this.options[key] = value;
            } else if($.isFun(value) && this._isEventName(key)) {
                this.target.addHandler(this.widgetEventPrefix + "." + key, value);
            }
        },
        toString: function() {
            return "ui.widget";
        },
        widget: function() {
            return this.container;
        },
        getSelf: function() {
            return this;
        },
        widgetEventPrefix: "",
        //将来做事件用
        widgetName: "Widget"
    });

    Widget.factory = function(name, constructor, prototype, statics) {
        /// <summary>为$添加部件
        /// <para>作为类得constructor可以这样</para>
        /// <para>function TimePicker(obj, target, base){</para>
        /// <para>      base.call(this, obj, target);</para>
        /// <para>}</para>
        /// <para>方法会被传入3个参数。obj为初始化参数、target为$的对象、base为Widget基类</para>
        /// <para>prototype应当实现的属性:container:容器 options:参数 target:目标$ public:对外公开的方法 widgetEventPrefix:自定义事件前缀</para>
        /// <para>prototype应当实现的方法:返回类型 方法名 this create, this init, this render,Object event</para>
        /// <para>对外公开的方法返回值不能为this</para>
        /// </summary>
        /// <param name="name" type="String">格式为"ui.scorePicker"ui为命名空间，scorePicer为方法名，若有相同会覆盖</param>
        /// <param name="constructor" type="Function/Object">若为constructor则为类，若为obj则为类prototype</param>
        /// <param name="prototype" type="Object">类的prototype</param>
        /// <param name="statics" type="Object">类的静态方法</param>
        /// <returns type="Function" />
        //consult from jQuery.ui
        if(!$.isStr(name)) return null;
        var name = name.split("."),
            nameSpace = name[0],
            name = name[1],
            type;
        if(!nameSpace || !name) return;
        if(!$.widget[nameSpace]) $.widget[nameSpace] = {};

        if(!$.isFun(constructor)) {
            //    prototype = $.isPlainObj(constructor) ? constructor : {};
            //constructor = function (obj, target, base) { base.call(this, obj, target); };
            statics = prototype;
            prototype = constructor;
            constructor = name;
        }
        constructor = object.Class(constructor, prototype, statics, Widget);
        //object.inheritProtypeWidthParasitic(constructor, Widget, "Widget");
        //constructor.prototype = $.extend(true, {}, constructor.prototype, prototype);
        constructor.prototype.widgetName = name;

        $.widget[nameSpace][name] = constructor;

        var key = nameSpace + "." + name + $.now();

        return $.prototype[name] = function(a, b, c) {
            /// <summary>对当前$的所有元素初始化某个UI控件或者修改属性或使用其方法</summary>
            /// <para>返回option属性时，只返回第一个对象的</para>
            /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
            /// <param name="b" type="str/nul">属性option子属性名</param>
            /// <param name="c" type="any">属性option子属性名的值</param>
            /// <returns type="self" />
            var result = this,
                arg = arguments;
            this.each(function(ele) {
                var data = $.data(ele, key); //key = nameSpace + "." + name,
                if(data == undefined) data = $.data(ele, key, new constructor(a, $(ele))); //完全调用基类的构造函数 不应当在构造函数 create render
                else {
                    if($.isObj(a)) {
                        data.option(a);
                        data.render();
                    } else if($.isStr(a)) {
                        //if (b === undefined) {
                        if(a === "option") {
                            result = data.option(b, c);
                            if(result === undefined) {
                                data.render();
                                result = this;
                            }
                        } 
                        else if(a === "destory") {
                            data[a].call(data, key);
                        } 
                        else if(data.public[a]) {
                            data[a].apply(data, $.util.argToArray(arg, 1));
                        }
                    }

                }
            });
            return result;
        }

    }
    $.widget = Widget.factory;
    return Widget;
});