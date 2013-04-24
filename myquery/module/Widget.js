myQuery.define("module/Widget", ["main/data", "main/query", "main/event", "main/attr", "module/object", "module/myEval"], function($, data, query, event, attr, object, myEval, undefined) {
    "use strict"; //启用严格模式

    function Widget(obj, target) {
        /// <summary>组件的默认基类</summary>
        /// <para></para>
        /// <param name="obj" type="Object">构造函数</param>
        /// <param name="target" type="$">$对象</param>
        /// <returns type="Widget" />

        this.init(obj.target);
    }

    object.Class(Widget, {
        able: function() {
            this.options.disabled === false ? this.disable() : this.enable();
        },
        addTag: function() {
            var
            attr = "myquery-ui-" + this.widgetName,
                origin = this.target.attr(attr);
            if (!origin) {
                this.target.attr(attr, "");
            }
            return this;
        },
        checkAttr: function() {
            var key, attr, value, item, result = {}, i = 0,
                len = 0,
                widgetName = this.widgetName,
                eventNames = this.customEventName;

            for (i = 0, len = eventNames.length; i < len; i++) {
                item = eventNames[i];
                key = $.util.unCamelCase(item, widgetName);
                attr = this.target.attr(key);
                if (attr !== undefined) {
                    value = attr.split(":");
                    result[item] = myEval.functionEval(value[0], value[1] || window);
                }
            }

            attr = this.target.attr("myquery-ui-" + this.widgetName) || this.target.attr(this.widgetName);

            if (attr !== undefined) {
                attr = attr.split(/;|,/);
                for (i = 0, len = attr.length; i < len; i++) {
                    item = attr[i].split(":");
                    if (item.length == 2) {
                        key = item[0];
                        if (this.options[key] !== undefined) {
                            result[key] = myEval.evalBasicDataType(item[1]);
                        } else if ($.inArray(this.customEventName, key) > -1) {
                            result[key] = myEval.functionEval(item[1], $);
                        }
                    }
                }
            }

            return result;
        },
        create: function() {},
        container: null,
        constructor: Widget,
        customEventName: [],
        destory: function(key) {
            if (key) {
                this.disable();
                var i = 0,
                    name;
                for (i = this.customEventName.length - 1; i >= 0; i--) {
                    this.target.clearHandlers(this.widgetEventPrefix + "." + this.customEventName[i]);
                }

                this.container && this.options.removeContainer && $(this.container).remove();
                this.target.removeData(key);

                for (i in this) {
                    name = i;
                    !$.isPrototypeProperty(this, name) && (this[name] = null) && delete this[name];
                }
            }
        },
        disable: function() {

        },
        enable: function() {

        },
        event: function() {},

        init: function(obj, target) {
            //元素本身属性高于obj
            var defaultOptions = this.constructor.prototype.options,
                defulatPublic = this.constructor.prototype.public,
                customEventName = this.constructor.prototype.customEventName;

            if (!customEventName) {
                customEventName = [];
            }

            this.options = {};
            this.public = {};

            $.extend(this.options, Widget.prototype.options, defaultOptions);
            $.extend(this.public, Widget.prototype.public, defulatPublic);
            customEventName = customEventName.concat(Widget.prototype.customEventName);
            //event.custom.call(this);
            target._initHandler();
            this.target = target;
            this.addTag();

            obj = $.extend(this.checkAttr(), obj);
            this.option(obj);
            return this;
        },
        instance: function(item) {
            return $.is$(item) ? item.attr("myquery-" + this.widgetName) !== undefined : false;
        },
        equals: function(item) {
            if (this.instance(item)) {
                return this.getElement() === item.getElement() && this[this.widgetName]("getSelf") === item[this.widgetName]("getSelf");
            }
            return false;
        },
        option: function(key, value) {
            if ($.isObj(key)) $.each(key, function(value, name) {
                this.setOption(name, value);
            }, this);
            else if (value === undefined) return this.options[key];
            else if ($.isStr(key)) this.setOption(key, value);
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
            getSelf: 1,
            instance: 1,
            equals: 1
        },
        render: function() {},
        _initHandler: function() {},

        _isEventName: function(name) {
            return $.inArray(this.customEventName, name) > -1;
        },
        setOption: function(key, value) {
            if (this.options[key] !== undefined) {
                this.options[key] = value;
            } else if ($.isFun(value) && this._isEventName(key)) {
                this.target.addHandler(this.widgetEventPrefix + "." + key, value);
            }
        },
        toString: function() {
            return "ui.widget";
        },
        widget: function() {
            return this.constructor;
        },
        getSelf: function() {
            return this;
        },
        widgetEventPrefix: "",
        //将来做事件用
        widgetName: "Widget",

        widgetNameSpace: "ui"
    });

    Widget.extend = function(name, prototype, statics, Super) {
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
        /// <param name="prototype" type="Object">类的prototype 或者是基widget的name</param>
        /// <param name="statics" type="Object">类的静态方法</param>
        /// <param name="Super" type="Function/undefined">基类</param>
        /// <returns type="Function" />
        //consult from jQuery.ui
        if (!$.isStr(name)) return null;
        var name = name.split("."),
            nameSpace = name[0],
            name = name[1],
            type;

        if (!nameSpace || !name) return;
        if (!$.widget[nameSpace]) $.widget[nameSpace] = {};

        if ($.isFun(arguments[arguments.length - 1])) {
            Super = arguments[arguments.length - 1];
        } else {
            Super = Widget;
        }

        if (!$.isObj(statics)) {
            statics = {};
        }

        var constructor = object.Class(name, prototype, statics, Super);
        constructor.prototype.widgetName = name;
        constructor.prototype.widgetNameSpace = nameSpace;

        $.widget[nameSpace][name] = constructor;

        var key = nameSpace + "." + name + $.now();

        var ret = $.prototype[name] = function(a, b, c) {
            /// <summary>对当前$的所有元素初始化某个UI控件或者修改属性或使用其方法</summary>
            /// <para>返回option属性时，只返回第一个对象的</para>
            /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
            /// <param name="b" type="String/nul">属性option子属性名</param>
            /// <param name="c" type="any">属性option子属性名的值</param>
            /// <returns type="self" />
            var result = this,
                arg = arguments;
            this.each(function(ele) {
                var data = $.data(ele, key); //key = nameSpace + "." + name,
                if (data == undefined) data = $.data(ele, key, new constructor(a, $(ele))); //完全调用基类的构造函数 不应当在构造函数 create render
                else {
                    if ($.isObj(a)) {
                        data.option(a);
                        data.render();
                    } else if ($.isStr(a)) {
                        //if (b === undefined) {
                        if (a === "option") {
                            result = data.option(b, c);
                            if (result === undefined) {
                                data.render();
                                result = this;
                            }
                        } else if (a === "destory") {
                            data[a].call(data, key);
                        } else if (data.public[a]) {
                            data[a].apply(data, $.util.argToArray(arg, 1));
                        }
                    }

                }
            });
            return result;
        }

        ret.extend = function(tName, prototype, statics, isExtendStatic) {
            return $.widget.inherit(tName, nameSpace + "." + name, prototype, statics, isExtendStatic);
        }

        return ret;
    }
    $.widget = Widget.extend;

    $.widget.is = function(item, thisName, name, nameSpace) {
        /// <summary>是否含某个widget实例</summary>
        /// <param name="item" type="Object"></param>
        /// <param name="name" type="String">widget名字</param>
        /// <param name="nameSpace" type="String/undefined">widget命名空间</param>
        /// <returns type="Boolean" />
        nameSpace = nameSpace || "ui";
        return $.is$(item) && item.attr("myquery-" + nameSpace + "-" + name) !== undefined;
    };

    $.widget.inherit = function(name, SuperName, prototype, statics, isExtendStatic) {
        /// <summary>继承某个widget实例</summary>
        /// <param name="constructor" type="Function"></param>
        /// <param name="name" type="String">widget名字</param>
        /// <param name="SuperName" type="String">基类widget名字</param>
        /// <param name="prototype" type="Object">类的prototype 或者是基widget的name</param>
        /// <param name="statics" type="Object">类的静态方法</param>
        /// <param name="isExtendStatic" type="Bolean">是否扩展静态public customeEventName option 默认true</param>
        /// <returns type="Function" />

        var tName = SuperName.split("."),
            tNameSpace = tName[0],
            tName = tName[1],
            arg;

        var Super = $.widget[tNameSpace][tName];
        if (!Super) {
            $.console.error({
                fn: "$.widget.inherit",
                msg: "Super undefined"
            }, true);
        }
        var len = arguments.length;

        if (isExtendStatic !== undefined) {
            len - 1;
        }

        if (isExtendStatic !== false) {
            var options = {}, pub = {};
            if ($.isObj(prototype.options)) {
                prototype.options = $.extend(options, Super.prototype.options, prototype.options);
            }

            if ($.isArr(prototype.customEventName)) {
                prototype.customEventName = prototype.customEventName.concat(Super.prototype.customEventName);
            }

            if ($.isObj(prototype.public)) {
                prototype.public = $.extend(pub, Super.prototype.public, prototype.public);
            }
        }

        arg = [name];
        arg = arg.concat($.util.argToArray(arguments, 2, len));
        arg.push(Super);

        return Widget.extend.apply(null, arg);

    }
    return Widget;
});