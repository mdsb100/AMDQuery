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
    Widget.FunctionPrivate = 0;
    Widget.FunctionPublic = 1;
    Widget.FunctionReturn = 2;

    var booleanExtend = function(a, b) {
        for (var i in b) {
            if (b[i] == 0) {
                a[i] = 0;
            } else {
                if ($.isBol(a[i]) || $.isNum(a[i])) {

                } else {
                    a[i] = b[i];
                }
            }
        }
    },
    _extendAttr = function(key, constructor, booleanCheck) {
        /*出了option 其他应该扩展到prototype上*/
        var subValue = constructor.prototype[key],
            superConstructor = constructor.prototype.__superConstructor,
            superValue = superConstructor.prototype[key],
            newValue = {};

        var extend;

        $.easyExtend(newValue, superValue);

        if (subValue != undefined) {
            if (booleanCheck) {
                extend = booleanExtend;
            } else {
                extend = $.easyExtend;
            }
            extend(newValue, subValue);
        }

        constructor.prototype[key] = newValue;
    },
    _initOptionsPurview = function(constructor) {
        var proto = constructor.prototype,
            getter = proto.getter,
            setter = proto.setter,
            options = proto.options || {},
            i;

        if (!$.isObj(getter)) {
            getter = proto.getter = {};
        }
        if (!$.isObj(setter)) {
            setter = proto.setter = {};
        }

        for (i in options) {
            if (getter[i] === undefined) {
                getter[i] = 1;
            }
            if (setter[i] === undefined) {
                setter[i] = 1;
            }
        }

    };


    object.extend(Widget, {
        addTag: function() {
            var tag = this.toString(),
                optionAttr = this.widgetNameSpace + "-" + this.widgetName,
                optionTag = this.target.attr(optionAttr),
                widgetAttr = "myquery-widget",
                widgetTag = this.target.attr(widgetAttr);

            if (widgetTag == undefined) {
                this.target.attr(widgetAttr, tag)
            } else {
                var reg = new RegExp('(\\W|^)' + tag + '(\\W|$)'),
                    result = widgetTag.match(reg),
                    symbol = widgetTag.length ? ";" : "";

                if (!result || !result[0]) {
                    widgetTag = widgetTag.replace(/\W$/, "") + symbol + tag + ";";
                    this.target.attr(widgetAttr, widgetTag);
                }
            }

            if (!optionTag) {
                this.target.attr(optionAttr, "");
            }

            return this;
        },
        removeTag: function() {
            var tag = this.toString(),
                optionAttr = "myquery-" + this.widgetNameSpace + "-" + this.widgetName,
                optionTag = this.target.attr(optionTag),
                widgetAttr = "myquery-widget",
                widgetTag = this.target.attr(widgetAttr);

            if (widgetTag != undefined) {
                var reg = new RegExp('(\\W|^)' + tag + '(\\W|$)', "g");
                widgetTag = widgetTag.replace(reg, ";").replace(/^\W/, "");
                this.target.attr(widgetAttr, widgetTag);
            }

            if (optionTag == "") {
                this.target.removeAttr(optionAttr);
            }

            return this;
        },
        checkAttr: function() {
            var key, attr, value, item, result = {}, i = 0,
                len = 0,
                widgetName = this.widgetName,
                eventNames = this.customEventName;
            /*check event*/
            for (i = 0, len = eventNames.length; i < len; i++) {
                item = eventNames[i];
                key = this.widgetNameSpace + "-" + this.widgetName + "-" + item;
                attr = this.target.attr(key);
                if (attr !== undefined) {
                    value = attr.split(":");
                    result[item] = myEval.functionEval(value[0], value[1] || window);
                }
            }

            attr = this.target.attr(this.widgetNameSpace + "-" + this.widgetName) || this.target.attr(this.widgetName);

            /*check options*/
            if (attr !== undefined) {
                attr = attr.split(/;|,/);
                for (i = 0, len = attr.length; i < len; i++) {
                    item = attr[i].split(":");
                    if (item.length == 2) {
                        key = item[0];
                        if ($.reg.id.test(item[1])) {
                            result[key] = $(item[1])[0];
                        } else if (this.options[key] !== undefined) {
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
        destory: function(key) {
            /*应当返回原先的状态*/
            if (key) {
                //this.destoryChildren();
                this.disable();
                this.removeTag();
                var i = 0,
                    name;
                for (i = this.customEventName.length - 1; i >= 0; i--) {
                    this.target.clearHandlers(this.widgetEventPrefix + "." + this.customEventName[i]);
                }

                this.container && this.options.removeContainer && $(this.container).remove();

                for (i in this) {
                    name = i;
                    !$.isPrototypeProperty(this, name) && (this[name] = null) && delete this[name];
                }

                this.target.removeData(key);
            }
            return this;
        },
        able: function() {
            this.options.disabled === false ? this.disable() : this.enable();
        },
        disable: function() {
            this.options.disabled = false;
            return this;
        },
        enable: function() {
            this.options.disabled = true;
            return this;
        },
        event: function() {},

        init: function(obj, target) {
            //元素本身属性高于obj
            this.options = {};
            $.easyExtend(this.options, this.constructor.prototype.options);

            target._initHandler();
            this.target = target;
            this.addTag();
            obj = obj || {};
            $.extend(obj, this.checkAttr());
            this.option(obj);
            return this;
        },
        instanceofWidget: function(item) {
            var name, constructor = item;
            if ($.isStr(item)) {
                constructor = Widget.get(item);
            }
            if ($.isFun(constructor)) {
                return constructor.instance ? constructor.instance(this) : (this instanceof constructor);
            }
            return false;
        },
        equals: function(item) {
            if (this.instance(item)) {
                return this.getElement() === item.getElement() && this[this.widgetName]("getSelf") === item[this.widgetName]("getSelf");
            }
            return false;
        },
        option: function(key, value) {
            if ($.isObj(key)) {
                for (var name in key) {
                    this.setOption(name, key[name]);
                }
            } else if (value === undefined) {
                return this.getOption(key);
            } else if ($.isStr(key)) {
                this.setOption(key, value);
            }
        },
        customEventName: [],
        options: {
            disabled: 1
        },
        getter: {
            disabled: 1
        },
        setter: {
            disabled: 0
        },
        publics: {
            disable: Widget.FunctionPublic,
            enable: Widget.FunctionPublic,
            toString: Widget.FunctionReturn,
            getSelf: Widget.FunctionReturn,
            instanceofWidget: Widget.FunctionReturn,
            equals: Widget.FunctionReturn,
            beSetter: Widget.FunctionReturn,
            beGetter: Widget.FunctionReturn
        },
        getEventName: function(name) {
            return this.widgetEventPrefix + "." + name;
        },
        render: function() {},
        _initHandler: function() {},

        _isEventName: function(name) {
            return $.inArray(this.customEventName, name) > -1;
        },
        setOption: function(key, value) {
            if (this.beSetter(key) && this.options[key] !== undefined) {
                this.doSpecialSetter(key, value);
            } else if ($.isFun(value) && this._isEventName(key)) {
                this.target.addHandler(this.widgetEventPrefix + "." + key, value);
            }
        },
        getOption: function(key) {
            if (this.beGetter(key)) {
                return this.doSpecialGetter(key);
            } else {
                if (this.options[key] !== undefined) {
                    $.console.error("widget:" + this.toString() + " can not get option " + key + "; please check getter");
                } else {
                    $.console.error("widget:" + this.toString() + " option " + key + "is undefined; please check options");
                }
                return undefined;
            }
        },
        doSpecialGetter: function(key) {
            var fn = this[$.util.camelCase(key, "_get")];
            $.isFun(fn) ? fn.call(this) : this.options[key];
        },
        doSpecialSetter: function(key, value) {
            var fn = this[$.util.camelCase(key, "_set")];
            $.isFun(fn) ? fn.call(this, value) : (this.options[key] = value);
        },
        beGetter: function(key) {
            return !!this.getter[key];
        },
        beSetter: function(key) {
            return !!this.setter[key];
        },
        toString: function() {
            return "ui.widget";
        },
        getSelf: function() {
            return this;
        },
        widgetEventPrefix: "",
        //将来做事件用
        widgetName: "Widget",

        widgetNameSpace: "ui"
    }, {
        extend: function(name, prototype, statics, Super) {
            /// <summary>为$添加部件
            /// <para>作为类得constructor可以这样</para>
            /// <para>function TimePicker(obj, target, base){</para>
            /// <para>      base.call(this, obj, target);</para>
            /// <para>}</para>
            /// <para>方法会被传入3个参数。obj为初始化参数、target为$的对象、base为Widget基类</para>
            /// <para>prototype应当实现的属性:container:容器 options:参数 target:目标$ publics:对外公开的方法 widgetEventPrefix:自定义事件前缀</para>
            /// <para>prototype应当实现的方法:返回类型 方法名 this create, this init, this render,Object event</para>
            /// <para>prototype.publics为对外公开的方法，父类覆盖子类遵从于private</para>
            /// <para>prototype.returns 为对外共开方法是否返回一个自己的值 否则将会默认返回原 $对象</para>
            /// <para>prototype.options为参数子类扩展父类</para>
            /// <para>prototype.getter属性器，子类扩展与父类，但遵从于private</para>
            /// <para>prototype.setter属性器，子类扩展与父类，但遵从于private</para>
            /// <para>prototype.customEventName事件列表，子类覆盖父类</para>
            /// <para>对外公开的方法返回值不能为this只能使用getSelf</para>
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
            if (!Widget[nameSpace]) Widget[nameSpace] = {};

            if ($.isFun(arguments[arguments.length - 1])) {
                Super = arguments[arguments.length - 1];
            } else {
                Super = Widget;
            }

            if (!$.isObj(statics)) {
                statics = {};
            }

            var constructor = object.extend(name, prototype, statics, Super);
            constructor.prototype.widgetName = name;
            constructor.prototype.widgetNameSpace = nameSpace;

            Widget[nameSpace][name] = constructor;

            /*如果当前prototype没有定义setter和getter将自动生成*/
            _initOptionsPurview(constructor);

            _extendAttr("publics", constructor, prototype, true);
            _extendAttr("returns", constructor, prototype, true);
            _extendAttr("options", constructor);

            /*遵从父级为false 子集就算设为ture 最后也会为false*/
            _extendAttr("getter", constructor, true);
            _extendAttr("setter", constructor, true);


            var key = nameSpace + "." + name + $.now();

            var ret = function(a, b, c) {
                /// <summary>对当前$的所有元素初始化某个UI控件或者修改属性或使用其方法</summary>
                /// <para>返回option属性或returns方法时，只返回第一个对象的</para>
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
                            if (a === "option") {
                                if (c !== undefined) {
                                    /*若可set 则全部set*/
                                    data.option(b, c);
                                    data.render();
                                } else {
                                    /*若可get 则返回第一个*/
                                    result = data.option(b, c);
                                    return false;
                                }
                            } else if (a === "destory") {
                                data[a].call(data, key);
                            } else if (!!data.publics[a]) {
                                var temp = data[a].apply(data, $.util.argToArray(arg, 1));
                                if (data.publics[a] == Widget.FunctionReturn) {
                                    result = temp;
                                    return false;
                                }
                            }
                        }
                    }
                });
                return result;
            }

            ret.extend = function(tName, prototype, statics) {
                if ($.isObj(statics)) {
                    return Widget.extend(tName, prototype, statics, this);
                } else {
                    return Widget.extend(tName, prototype, this);
                }
            }

            if (!$.prototype[name]) {
                $.prototype[name] = ret;
            }

            $.prototype[$.util.camelCase(name, nameSpace)] = ret;

            return ret;
        },
        is: function(item, widgetName) {
            /// <summary>是否含某个widget实例</summary>
            /// <param name="item" type="$"></param>
            /// <param name="name" type="String">widget名字 如ui.navmenu</param>
            /// <returns type="Boolean" />
            var widgetTag = item.attr("myquery-widget");
            return $.is$(item) && item.attr(widgetName.replace(".", "-")) != undefined && widgetTag != undefined && widgetTag.indexOf(widgetName) > -1;
        },
        get: function(name) {
            /// <summary>获得某个widget</summary>
            /// <param name="name" type="String">widget名字</param>
            /// <returns type="Function" />
            var tName = name.split("."),
                tNameSpace = tName[0],
                tName = tName[1];
            return Widget[tNameSpace][tName];
        }
    });

    $.Widget = Widget;

    return Widget;
});