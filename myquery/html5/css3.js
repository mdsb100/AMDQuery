/// <reference path="../myquery.js" />

myQuery.define("html5/css3", ["base/client", "main/dom"], function ($, client, dom, undefined) {
    "use strict"; //启用严格模式
    var css3Head = (function () {
        var head = "";
        if (client.engine.ie)
            head = "ms";
        else if (client.engine.webkit || client.system.mobile)
            head = "webkit";
        else if (client.engine.gecko)
            head = "Moz";
        else if (client.engine.opera)
            head = "O";
        return head;
    })()
    , transformCssName = ""
    , transitionCssName = ""
    , hasCss3 = false
    , hasTransform = false
    , hasTransform3d = false
    , hasTransition = false
    , domStyle = document.documentElement.style
    , getCss3Support = function (type) {
        return ($.camelCase(type) in domStyle || $.camelCase(type, css3Head) in domStyle);
    }
    , css3Support = (function () {
        var result = {};

        result.css3 = hasCss3 = getCss3Support("boxShadow");

        if ("transform" in domStyle) {
            transformCssName = "transform";
        }
        else if ((css3Head + "Transform") in domStyle) {
            transformCssName = css3Head + "Transform";
        }
        result.transform = hasTransform = !!transformCssName;

        if (hasTransform) {
            hasTransform3d = getCss3Support("transformStyle");
        }

        result.transform3d = hasTransform3d;

        result.animation = getCss3Support("animationName");

        if ("transition" in domStyle) {
            transitionCssName = "transition";
        }
        else if ((css3Head + "Transition") in domStyle) {
            transitionCssName = css3Head + "Transition";
        }
        result.transition = hasTransition = !!transitionCssName;

        try {
            domStyle["background"] = "-" + css3Head + "-linear-gradient" + "(left, white, black)";
            result.gradientGrammar = domStyle["background"].indexOf("gradient") > -1;
            domStyle["background"] = "";
        } catch (e) {

        }

        return result;
    })()
    , isFullCss = function (value) {
        return value != "" && value !== "none" && value != null;
    }

    if (hasTransform) {
        var transformReg = {
            translate3d: /translate3d\([^\)]+\)/
            , translate: /translate\([^\)]+\)/
            , rotate: /rotate\([^\)]+\)/
            , rotateX: /rotateX\([^\)]+\)/
            , rotateY: /rotateY\([^\)]+\)/
            , rotateZ: /rotateZ\([^\)]+\)/
            , scale: /scale\([^\)]+\)/
            , scaleX: /scaleX\([^\)]+\)/
            , scaleY: /scaleY\([^\)]+\)/
            , skew: /skew\([^\)]+\)/
        }
        , transform3dNameMap = {
            translateX: 1,
            translateY: 2,
            translateZ: 3,
            scaleX:1,
            scaleY:1

        }
        , editScale = function (obj) {
            var sx = obj.sx != undefined ? obj.sx : obj.scaleX || 1
            , sy = obj.sy != undefined ? obj.sy : obj.scaleY || 1;

            return [
                     'scale(', Math.max(0, sx)
                        , ',', Math.max(0, sy), ') '
               ];
        }
        , editTranslate3d = function (obj) {
            return ['translate3d(',
                    obj.tx ? obj.tx + "px" : obj.translateX || 0, ', ',
                    obj.ty ? obj.ty + "px" : obj.translateY || 0, ', ',
                    obj.tz ? obj.tz + "px" : obj.translateZ || 0, ') ']
        }
        , editRotate3d = function (obj) {
            return ['rotateX(', obj.rx ? obj.rx + "deg" : obj.rotateX || 0, ') ',
		        'rotateY(', obj.ry ? obj.ry + "deg" : obj.rotateY || 0, ') ',
		        'rotateZ(', obj.rz ? obj.rz + "deg" : obj.rotateZ || 0, ') ']
        }
        , regTransform = /[^\d\w\.\-\+]+/
        , getTransformValue = function (transform, name) {
            var result = [], transType = transform.match(transformReg[name]);
            if (transType) {
                result = transType[0].replace(")", "").split(regTransform);
            }
            return result;
        }
        , getTransformValues = function (transform) {
            var result = []
            transform = transform.split(") ");
            $.each(transform, function (value) {
                result.push(value.replace(")", "").split(regTransform));
            });
            return result;
        }
        , editCss3Type = function (name) {
            var temp, unit = '';
            switch (name) {
                case "transform": name = this.transform; break;
                case "transform3d": name = this.transform3d; break;
                case "transformOrigin": name = this.transformOrigin; break;
            }
            if ((temp = $.interfaces.trigger.call(this, "editCss3Type", name))) {
                name = temp.name;
                unit = temp.unit;
            }
            return { name: name, unit: unit };
        }
    }
    if (hasTransition) {
        var getTransitionValue = function (transition, name) {
            var result = {}, temp, transType = transition.match(name + ".*,");
            if (transType) {
                temp = transType[0].replace(",", "").split(" ");
                result.name = temp[0];
                result.duration = temp[1];
                result["function"] = temp[2];
                result.delay && (result.delay = temp[3]);
            }
            return result;
        }
        , getTransitionValues = function (transition) {
            var result = [], temp;
            $.each(transition.split(/,\s?/), function (transType) {
                temp = transType.split(" ");
                temp = {
                    name: temp[0]
                    , duration: temp[1]
                    , "function": temp[2]

                }
                temp.delay && (temp.delay = temp[3]);
                result[temp["name"]] = temp;
                result.push(temp);
            })
            return result;
        }
    }

    $.interfaces.handlers.editCss3Type = null;
    var css3 = {
        addTransition: function (ele, style) {
            /// <summary>添加transition属性
            /// <para>可以如下方式设置</para>
            /// <para>$.addTransition(ele, "background-color 1s linear")</para>
            /// <para>$.addTransition(ele, {name:"width"}) 为obj时可缺省duration,function</para>
            /// <para>$.addTransition(ele, [{name:"width",duration:"1s",function:"linear"}, {name:"height"])</para>
            /// <para>$.addTransition(ele, ["background-color 1s linear", "width 1s linear"])</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="Array/Object/String">值得数组或值</param>
            /// <returns type="self" />
            return $.setTransition(ele, style, dom.css(ele, transitionCssName));
        }
        , bindTransition: function (ele, style) {
            /// <summary>添加transition属性并绑定事件
            /// <para>可以如下方式设置</para>
            /// <para>[{ name: "background-color", duration: "1s", "function": "linear"</para>
            /// <para>       , events: {</para>
            /// <para>           mouseover: "#ff0"</para>
            /// <para>           , mouseout: "#00f"</para>
            /// <para>       }</para>
            /// <para>       , toggle: ["#ff0", "#00f"]</para>
            /// <para>}]）</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="Array/Object">值得数组或值</param>
            /// <returns type="self" />
            var eleObj = $(ele);
            if (!$.isArr(style)) {
                style = [style];
            }
            $.each(style, function (item) {
                $.each(item.events, function (value, name) {
                    eleObj.addHandler(name, function () {
                        dom.css(this, $.camelCase(item.name), value);
                    });
                });
                if (item.toggle) {
                    var arr = [ele];
                    $.each(item.toggle, function (value, index) {
                        arr.push(function () {
                            dom.css(this, $.camelCase(item.name, item.head), value);
                        });
                    });
                    $.toggle.apply(this, arr);
                }
            });
            return $.setTransition(ele, style, dom.css(ele, transitionCssName));
        }

        , css3: function (ele, name, value) {
            /// <summary>css3的操作，不需要加浏览器特殊头。如果可以，还是使用css和自己加头的方式，性能更高。
            /// <para>头可以如此获得$.css3Head</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="name" type="String">样式名</param>
            /// <param name="value" type="String/Number/undefined">值</param>
            /// <returns type="self" />
            if (hasCss3) {
                return dom.css(ele, $.camelCase(name, css3Head), value);
            }
            return this;
        }
        , css3Head: css3Head
        , css3Style: function (ele, name) {
            /// <summary>返回样式表css3的属性，其实是默认加了个head</summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="name" type="String">样式名</param>
            /// <returns type="self" />
            return dom.style(ele, name, css3Head);
        }

        , getCss3Support: function (type) {
            /// <summary>是否支持css3的某个特性</summary>
            /// <param name="type" type="String">元素</param>
            /// <returns type="Boolean" />
            return getCss3Support(type);
        }
        , getTransform: function (ele, name) {
            /// <summary>transform有顺序之别 获得transform样式
            /// <para>头可以如此获得$.css3Head</para>
            /// <para>[["translate", "50px", "50px"], ["rotate", "30deg"], ["skew", "30deg", "30deg"]]</para>
            /// <para>如果name存在[["translate", "50px", "50px"]]</para>
            /// <para>如果name不为空则Object只有name那个选项</para>
            /// <para>如果name不是transform的属性名 则返回{"notIn":null}</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="name" type="String">样式名 缺省则返回所有的</param>
            /// <returns type="Array" />
            var result = [];
            if (hasTransform) {
                var transform = dom.css(ele, transformCssName), temp, index = -1;
                if (isFullCss(transform)) {
                    if ($.isStr(name)) {
                        temp = getTransformValue(transform, name);
                        result.push(temp);
                    }
                    else {
                        result = getTransformValues(transform);
                    }
                }
            }
            return result;
        }
        , getTransform3d: function (ele, toNumber) {
            /// <summary>获得css3d
            /// <para>返回的 Object属性</para>
            /// <para>num obj.rotateX:x轴旋转</para>
            /// <para>num obj.rotateY:y轴旋转</para>
            /// <para>num obj.rotateZ:z轴旋转</para>
            /// <para>num obj.translateX:x轴位移</para>
            /// <para>num obj.translateY:y轴位移</para>
            /// <para>num obj.translateZ:z轴位移</para>
            /// <para>num obj.scaleX:缩放（范围0到1）</para>
            /// <para>num obj.scaleY:缩放（范围0到1）</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="toNumber" type="Boolean">是否直接把返回的结果转为数字</param>
            /// <returns type="Object" />
            var obj = {}
            if (hasTransform3d) {
                obj = { rotateX: 0, rotateY: 0, rotateZ: 0, translateX: 0, translateY: 0, translateZ: 0, scaleX: 1, scaleY: 1 };
                var transform = dom.css(ele, transformCssName), result , i;
                if (isFullCss(transform)) {
                    result = getTransformValue(transform, "rotateX");
                    result.length && (obj.rotateX = result[1]);
                    result = getTransformValue(transform, "rotateY");
                    result.length && (obj.rotateY = result[1]);
                    result = getTransformValue(transform, "rotateZ");
                    result.length && (obj.rotateZ = result[1]);
                    result = getTransformValue(transform, "scale");
                    result.length && (obj.scaleX = result[1]) && (obj.scaleY = result[2]);
                    result = getTransformValue(transform, "translate3d");
                    if (result.length) {
                        obj.translateX = result[1];
                        obj.translateY = result[2];
                        obj.translateZ = result[3];
                    }

                    if(toNumber === true){
                        for (i in obj){
                            obj[i] = parseFloat(obj[i]);
                        }
                    }
                }
            }      

            return obj;
        }
        , getTransform3dByName: function (ele, name, toNumber) {
            /// <summary>获得css3d
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="name" type="String">属性名</param>
            /// <param name="toNumber" type="Boolean">是否直接把返回的结果转为数字</param>
            /// <returns type="Object" />
            var result = null;
            if (hasTransform3d) { 
                var transform = dom.css(ele, transformCssName), index;
                if (isFullCss(transform)) {
                    switch(name){
                        case "translateX":
                        case "translateY": 
                        case "translateZ": 
                            result = getTransformValue(transform, "translate3d");
                            index = transform3dNameMap[name];
                        break;
                        case "rotateX":
                        case "rotateY":
                        case "rotateZ":
                            result = getTransformValue(transform, name);
                            index = 1;
                        break;
                        case "scaleX":
                        case "scaleY":
                            result = getTransformValue(transform, "scale");
                            index = transform3dNameMap[name];
                        break;
                    }
                }
            }

            return result && result.length ?( toNumber === true ? parseFloat(result[index]) : result[index] ): null;
        }
        , getTransformOrigin: function (ele) {
            /// <summary>返回元素的运动的基点(参照点)。返回值是百分比。
            /// <para>transform–origin(x,y)</para>
            /// <para>return {x:x,y:y}</para>
            /// <para>x也可指定字符值参数: left,center,right.</para>
            /// <para>y也可指定字符值参数: top,center,right.</para>
            /// <para>left == 0%,center == 50%,right == 100%</para>
            /// <para>top == 0%,center == 50%,right == 100%</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <returns type="Object" />
            var result = {};
            if (hasTransform) {
                var origin = ele.style[transformCssName + "Origin"];
                if (origin) {
                    origin = origin.split(" ");
                    result.x = origin[0];
                    result.y = origin[1]
                }
            }
            return result;
        }
        , getTransition: function (ele, name) {
            /// <summary>获得transition样式
            /// <para>[{name:"width",duration:"1s",function:"leaner"},{name:"height",duration:"1s",function:"linear"}]</para>
            /// <para>如果name是transition包含的</para>
            /// <para>返回数组只有name那个选项[{name:"width",duration:"1s",function:"leaner"}]</para>
            /// <para>如果name不是transition包含的 则返回[{}]</para>
            /// <para>返回的result是数组，但是也可以使用result[name]得到确切的某个name</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="name" type="String">transition包含的样式名 缺省则返回所有的</param>
            /// <returns type="Array" />
            var result = [];
            if (hasTransform) {
                var transition = dom.css(ele, transitionCssName), temp, index = -1;
                if (isFullCss(transition)) {
                    if ($.isStr(name)) {
                        temp = getTransitionValue(transition, name);

                        result.push(temp);
                        result[name] = temp;
                    }
                    else {
                        result = getTransitionValues(transition);
                    }
                }
            }
            return result;
        }

        , initTransform3d: function (ele, perspective, perspectiveOrigin) {
            /// <summary>初始化css3d这样它的子元素才能被set3d</summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="perspective" type="Number">井深</param>
            /// <param name="perspectiveOrigin" type="String">视角；如:'50% 50%'</param>
            /// <returns type="self" />
            if (hasTransform3d) {
                var style = ele.style;
                style[css3Head + 'TransformStyle'] = 'preserve-3d'
                style[css3Head + 'Perspective'] = perspective || 300;
                style[css3Head + 'PerspectiveOrigin'] = perspectiveOrigin || '50% 50%';
            }
            return this;
        }

        , linearGradient: function (ele, option) {
            /// <summary>设置线性渐变
            /// <para>str option.orientation</para>
            /// <para>arr option.colorStops</para>
            /// <para>num option.colorStops[0].stop</para>
            /// <para>str option.colorStops[0].color</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            var str = [], type = "backgroundImage";
            if (option.defaultColor) {
                ele.style.background = option.defaultColor;
            }
            if (css3Support.gradientGrammar) {
                str.push("-", css3Head, "-linear-gradient", "(");
                str.push(option.orientation.normal || option.orientation);
                $.each(option.colorStops, function (value, index) {
                    str.push(",", value.color);
                });
            }
            else if (client.browser.chrome > 10 || client.browser.safari >= 5.1 || client.system.mobile) {
                str.push("-webkit-gradient", "(linear,");
                str.push(option.orientation.webkit);
                $.each(option.colorStops, function (value, index) {
                    str.push(",", "color-stop", "(", value.stop, ",", value.color, ")");
                });
            }
            //            else if (client.browser.firefox >= 3.63) {
            //                str.push("-moz-linear-gradient", "(");
            //                str.push(option.orientation.moz);
            //                $.each(option.colorStops, function (value, index) {
            //                    str.push(",", value.color);
            //                });
            //            }
            else if (client.browser.ie == 10) {
                str.push("-ms-linear-gradient", "(");
                str.push(option.orientation.ms, ",");
                $.each(option.colorStops, function (value, index) {
                    str.push(",", value.color, " ", value.stop * 100, "%");
                })
                str.push(",turquoise");
            }
            else if (client.browser.ie == 9) {
                str.push("progid:DXImageTransform.Microsoft.gradient", "(");
                str.push("startColorstr=", "'", option.colorStops[0].color, "'");
                str.push(",", "endColorstr=", "'", option.colorStops[option.colorStops.length - 1].color, "'");
                type = "filter";
            }
            //            else if (client.browser.opera >= 11.1) {
            //                str.push("-o-linear-gradient", "(");
            //                str.push(option.orientation.o);
            //                $.each(option.colorStops, function (value, index) {
            //                    str.push(",", value.color);
            //                });
            //            }
            str.push(")");
            ele.style[type] = str.join("");
            return this;
        }

        , radialGradient: function (ele, option) {
            /// <summary>设置径向渐变
            /// <para>str option.radial</para>
            /// <para>arr option.colorStops</para>
            /// <para>num option.colorStops[0].stop</para>
            /// <para>str option.colorStops[0].color</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            var str = [];
            if (option.defaultColor) {
                ele.style.background = option.defaultColor;
            }
            if (css3Support.gradientGrammar) {
                str.push("-", css3Head, "-radial-gradient", "(");
                str.push(option.radial.normal.x || option.radial.x, " ", option.radial.normal.y || option.radial.y);
                $.each(option.colorStops, function (value, index) {
                    str.push(",", value.color, " ", value.stop * 100, "%");
                });
            }
            else if (client.browser.chrome > 10 || client.browser.safari >= 5.1 || client.system.mobile) {
                str.push("-webkit-gradient", "(radial");
                $.each(option.radial.webkit, function (value, index) {
                    str.push(",", value.x, " ", value.y, ",", value.r);
                });
                $.each(option.colorStops, function (value, index) {
                    str.push(",", "color-stop", "(", value.stop, ",", value.color, ")");
                });
            }
            else if (client.browser.ie == 10) {
                str.push("-ms-linear-gradient", "(");
                str.push(option.radial.ms.x, ",", "circle cover");
                $.each(option.colorStops, function (value, index) {
                    str.push(",", value.color, " ", value.stop * 100, "%");
                })
                str.push(",turquoise");
            }
            else if (client.browser.opera >= 11.6) {
                str.push("-o-radial-gradient", "(");
                $.each(option.radial.o, function (value, index) {
                    str.push(value.x, " ", value.y, ",");
                });
                var stop = option.colorStops, temp;
                temp = stop.splice(0, 1)[0];
                str.push(temp.color, " ");
                temp = stop.splice(stop.length - 1, 1)[0];
                $.each(stop, function (value, index) {
                    str.push(",", value.color, " ", value.stop * 100, "%");
                });
                str.push(",", temp.color);
            }
            str.push(")");
            ele.style.backgroundImage = str.join("");
            return this;
        }
        , removeTransition: function (ele, style) {
            /// <summary>移除transition属性
            /// <para>可以如下方式设置</para>
            /// <para>$.removeTransition(ele, "background-color")</para>
            /// <para>$.removeTransition(ele, ["background-color", "width"])</para>
            /// <para>$.removeTransition(ele, {name:"background-color"})</para>
            /// <para>$.removeTransition(ele, [{name:"width"},"height"])</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="String/Array/undefined">值得数组或值</param>
            /// <returns type="self" />
            var list, transition = dom.css(ele, transitionCssName), match, n = arguments[2] || "";
            if (style == undefined) {
                transition = "";
            }
            else if ($.isStr(style)) {
                list = [style];
            }
            else if ($.inArray(style)) {
                list = style;
            }
            else if ($.isObj(style)) {
                list = style.name && [style.name];
            }

            $.each(list, function (item) {
                match = transition.match((item || item.name) + ".+?(\\D,|[^,]$)");
                if (match) {
                    if (n && match[1] && match[1].indexOf(",") > -1) {
                        n += ","
                    }
                    transition = transition.replace(match[0], n);
                };
                // match = transition.match((item || item.name) + "[\\w\\s\\d\\.\\-]*((\\,|\\,\\s)|$)");
                // n += n && match[1] ? ", " : "";
                // transition = transition.replace(match[0], n);
                //transition = transition.replace(/(,\s|,)$/, "");
            });

            return dom.css(ele, transitionCssName, transition);
        }
        , replaceTransition: function (ele, name, value) {
            /// <summary>覆盖transition属性
            /// <para>可以如下方式设置</para>
            /// <para>$.replaceTransition(ele, "background-color","background-color 2s linear")</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="String">值得数组或值</param>
            /// <param name="style" type="String">值得数组或值</param>
            /// <returns type="self" />
            return $.removeTransition(ele, name, value);
        }

        , setRotate3d: function (ele, obj) {
            /// <summary>设置所有元素的css3d旋转
            /// <para>num rx:x轴旋转 不带单位</para>
            /// <para>num ry:y轴旋转</para>
            /// <para>num rz:z轴旋转</para>
            /// <para>num rotateX:x轴旋转 带单位</para>
            /// <para>num rotateY:y轴旋转</para>
            /// <para>num rotateZ:z轴旋转</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            if (!obj || !hasTransform3d) return this;
            ele.style[transformCssName] = editRotate3d(obj).join("");
        }
        , setScale: function (ele, obj) {
            /// <summary>设置css3d scale缩放 3d和普通都一样
            /// <para>num scale:缩放（范围0到1）</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            if (!obj || !hasTransform3d) return this;

            ele.style[transformCssName] = editScale(obj).join("");
            return this;
        }
        , setTransform: function (ele, style) {
            /// <summary>设置transform属性 transform有顺序之别
            /// <para>头可以如此获得$.css3Head</para>
            /// <para>数组形式为[["translate","30px","30px"],["skew","30px","30px"]]</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="Array">样式名数组或样式名</param>
            /// <returns type="self" />
            if (hasTransform && $.isArr(style)) {
                var result = [], obj = { transform: "" };

                $.each(style, function (value, index) {
                    if (transformReg[value[0]]) {
                        result.push(value[0], "(", value.slice(1, value.length).join(","), ") ");
                    }
                }, this);

                dom.css(ele, transformCssName, result.join(""));
                // dom.css(ele, transformCssName, result.join(""));
            }
            return this;
        }
        , setTransform3d: function (ele, obj) {
            /// <summary>设置css3d 默认是先translate ==> rotate ==> scale
            /// <para>如果要改变顺序 请使用setTransform</para>
            /// <para>设置的Object属性:</para>
            /// <para>num obj.rx:x轴旋转 不带单位</para>
            /// <para>num obj.ry:y轴旋转</para>
            /// <para>num obj.rz:z轴旋转</para>
            /// <para>num obj.tx:x轴位移</para>
            /// <para>num obj.ty:y轴位移</para>
            /// <para>num obj.tz:z轴位移</para>
            /// <para>num obj.sx:缩放（范围0到1）</para>
            /// <para>num obj.sy:缩放（范围0到1）</para>
            /// <para>num obj.rotateX:x轴旋转 带单位</para>
            /// <para>num obj.rotateY:y轴旋转</para>
            /// <para>num obj.rotateZ:z轴旋转</para>
            /// <para>num obj.translateX:x轴位移</para>
            /// <para>num obj.translateY:y轴位移</para>
            /// <para>num obj.translateZ:z轴位移</para>
            /// <para>num obj.scaleX:缩放（范围0到1）</para>
            /// <para>num obj.scaleY:缩放（范围0到1）</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            if (!obj || !hasTransform3d) return this;

            ele.style[transformCssName] = editTranslate3d(obj).concat(editRotate3d(obj)).concat(editScale(obj)).join('');
            return this;
        }
        , setTransformByCurrent: function (ele, style) {
            /// <summary>设置transform属性 transform有顺序之别
            /// <para>如果已有transform样式，将会按照原先顺序赋值 没有的将按顺序push进去</para>
            /// <para>数组形式为[["translate","30px","30px"],["skew","30px","30px"]]</para>
            /// </summary>
            /// <param name="style" type="Array">样式名数组</param>
            /// <returns type="self" />
            if (hasTransform && style) {
                var transform = $.getTransform(ele)
                , len1 = style.length || 0
                , len2 = transform.length || 0
                , item1 = null
                , item2 = null
                , i = len1 - 1, j = len2 - 1;
                for (; i > -1; i--) {
                    item1 = style[i]
                    if (transformReg[item1[0]]) {
                        for (; j > -1; j--) {
                            item2 = transform[j];
                            if (item1[0] == item2[0]) {
                                transform.splice(j, 1, item1);
                                style.splice(i, 1)
                                break;
                            }
                        }
                    }
                    else {
                        style.splice(i, 1);
                    }
                }
                $.each(style, function (value) {
                    transform.push(value)
                });

                $.setTransform(ele, transform);
            }
            return this;
        }
        , setTransformOrigin: function (ele, style) {
            /// <summary>用来设置元素的运动的基点(参照点).默认为元素中心点.
            /// <para>transform–origin(x,y)</para>
            /// <para>style.x style.y</para>
            /// <para>x也可指定字符值参数: left,center,right.</para>
            /// <para>y也可指定字符值参数: top,center,right.</para>
            /// <para>left == 0%,center == 50%,right == 100%</para>
            /// <para>top == 0%,center == 50%,right == 100%</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="Object">参数</param>
            /// <returns type="self" />
            if (hasTransform && style) {
                ele.style[transformCssName + "Origin"] = [style.x || "left", " ", style.y || "top"].join("");
            }
            return this;
        }
        , setTransition: function (ele, style) {
            /// <summary>设置transition属性
            /// <para>可以如下方式设置</para>
            /// <para>$.setTransition(ele, "background-color 1s linear")</para>
            /// <para>$.setTransition(ele, {name:"width"}) 为obj时可缺省duration,function</para>
            /// <para>$.setTransition(ele, [{name:"width",duration:"1s",function:"linear"}, {name:"height"])</para>
            /// <para>$.setTransition(ele, ["background-color 1s linear", "width 1s linear"])</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="Array/Object/String">值得数组或值</param>
            /// <returns type="self" />
            if (hasTransition) {
                var result = "", origin = arguments[2] ? arguments[2] : ""; //原始origin一样的 替换掉 或许不应该改由浏览器自己控制
                if ($.isStr(style)) {
                    result = style;
                }
                else if ($.isObj(style)) {
                    style["name"] && (result = [$.unCamelCase(value["name"], value["head"]), style["duration"] || "1s", style["function"] || "linear", style["delay"] || ""].join(" "));
                }
                else if ($.isArr(style)) {
                    var list = [];
                    $.each(style, function (value) {
                        if ($.isStr(value)) {
                            list.push(value);
                        }
                        else if ($.isObj(value)) {
                            value["name"] && list.push([$.unCamelCase(value["name"], value["head"]), value["duration"] || "1s", value["function"] || "linear", value["delay"] || ""].join(" "));
                        }
                    });
                    result = list.join(",");
                }
                dom.css(ele, transitionCssName, (origin ? origin + "," : "") + result);
            }
            return this;
        }
        , setTranslate3d: function (ele, obj) {
            /// <summary>设置css3d的translate3d
            /// <para>num tx:x轴位移 不带单位</para>
            /// <para>num ty:y轴位移</para>
            /// <para>num tz:z轴位移</para>
            /// <para>num translateX:x轴位移 带单位</para>
            /// <para>num translateY:y轴位移</para>
            /// <para>num translateZ:z轴位移</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            if (!obj || !hasTransform3d) return this;
            ele.style[transformCssName] = editTranslate3d(obj).join("");
            return this;
        }
    };
    $.easyExtend($.support, css3Support);
    $.extend(css3);
    $.fn.extend({
        addTransition: function (style) {
            /// <summary>添加transition属性
            /// <para>可以如下方式设置</para>
            /// <para>$.addTransition(ele, "background-color 1s linear")</para>
            /// <para>$.addTransition(ele, {name:"width"}) 为obj时可缺省duration,function</para>
            /// <para>$.addTransition(ele, [{name:"width",duration:"1s",function:"linear"}, {name:"height"])</para>
            /// <para>$.addTransition(ele, ["background-color 1s linear", "width 1s linear"])</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="Array/Object/String">值得数组或值</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.addTransition(ele, style);
            });
        }
        , bindTransition: function (style) {
            /// <summary>添加transition属性并绑定事件
            /// <para>可以如下方式设置</para>
            /// <para>[{ name: "background-color", duration: "1s", "function": "linear"</para>
            /// <para>       , events: {</para>
            /// <para>           mouseover: "#ff0"</para>
            /// <para>           , mouseout: "#00f"</para>
            /// <para>       }</para>
            /// <para>       , toggle: ["#ff0", "#00f"]</para>
            /// <para>}]）</para>
            /// </summary>
            /// <param name="style" type="Array/Object">值得数组或值</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.bindTransition(ele, style);
            });
        }
        , css3: function (style, value) {
            /// <summary>css3的操作，不需要加浏览器特殊头。如果可以，还是使用css和自己加头的方式，性能更高。
            /// <para>头可以如此获得$.css3Head</para>
            /// <para>如果要获得样式 返回为String 返回为第一元素</para>
            /// </summary>
            /// <param name="style" type="Object/String">obj为赋样式 str为获得一个样式</param>
            /// <param name="value" type="String/Number/undefined">当为style为string时 存在则赋值 不存在则返回值</param>
            /// <returns type="self" />
            if (!hasCss3) {
                return this;
            }
            var b = style, result, tmp;
            if ($.isObj(b)) {
                for (var i in b) {
                    result = editCss3Type.call(this, i);
                    this.each(function (ele) {
                        if ($.isFun(result.name))
                            result.name.call(this, b[i]);
                        else
                            result.name && $.css3(ele, result.name, b[i] + result.unit);
                    });
                }
            }
            else if ($.isStr(b)) {
                result = editCss3Type.call(this, b);
                if (value === undefined) {
                    if ($.isFun(result.name))
                        return result.name.call(this);
                    else
                        return $.css3(this[0], result.name);
                }
                else {
                    this.each(function (ele) {
                        if ($.isFun(result.name))
                            result.name.call(this, value);
                        else
                            result.name && $.css3(ele, result.name, value + result.unit);
                    });
                }
            }
            return this;
        }
        , css3Style: function (name) {
            /// <summary>返回样式表的css3的属性，其实是默认加了个head</summary>
            /// <param name="name" type="String">样式名</param>
            /// <returns type="self" />
            return dom.style(this[0], name, css3Head);
        }

        , initTransform3d: function (perspective, perspectiveOrigin) {
            /// <summary>所有元素初始化css3d这样它的子元素才能被set3d</summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="perspective" type="Number">井深</param>
            /// <param name="perspectiveOrigin" type="String">视角；如:'50% 50%'</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.initTransform3d(ele, perspective, perspectiveOrigin);
            });
        }

        , linearGradient: function (option) {
            /// <summary>设置线性渐变
            /// <para>str option.orientation</para>
            /// <para>arr option.colorStops</para>
            /// <para>num option.colorStops[0].stop</para>
            /// <para>str option.colorStops[0].color</para>
            /// </summary>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.linearGradient(ele, option);
            });
        }

        , radialGradient: function (option) {
            /// <summary>设置径向渐变
            /// <para>str option.radial</para>
            /// <para>arr option.colorStops</para>
            /// <para>num option.colorStops[0].stop</para>
            /// <para>str option.colorStops[0].color</para>
            /// </summary>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.radialGradient(ele, option);
            });
        }
        , removeTransition: function (style) {
            /// <summary>移除transition属性
            /// <para>可以如下方式设置</para>
            /// <para>$.removeTransition(ele, "background-color")</para>
            /// <para>$.removeTransition(ele, ["background-color", "width"])</para>
            /// <para>$.removeTransition(ele, {name:"background-color"})</para>
            /// <para>$.removeTransition(ele, [{name:"width"},"height"])</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="String/Array/undefined">值得数组或值</param>
            /// <returns type="self" />

            return this.each(function (ele) {
                $.removeTransition(ele, style);
            });
        }
        , replaceTransition: function (name, value) {
            /// <summary>覆盖transition属性
            /// <para>可以如下方式设置</para>
            /// <para>$.replaceTransition(ele, "background-color","background-color 2s linear")</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="style" type="String">值得数组或值</param>
            /// <param name="style" type="String">值得数组或值</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.replaceTransition(ele, name, value);
            });
        }

        , setRotate3d: function (obj) {
            /// <summary>设置所有元素的css3d旋转
            /// <para>num rx:x轴旋转 不带单位</para>
            /// <para>num ry:y轴旋转</para>
            /// <para>num rz:z轴旋转</para>
            /// <para>num rotateX:x轴旋转 带单位</para>
            /// <para>num rotateY:y轴旋转</para>
            /// <para>num rotateZ:z轴旋转</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            this.each(function (ele) {
                $.setRotate3d(ele, obj)
            });
        }
        , setScale: function (obj) {
            /// <summary>设置css3d scale缩放 3d和普通都一样
            /// <para>num scale:缩放（范围0到1）</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.setScale(ele, obj);
            });
        }
        , setTransformByCurrent: function (style) {
            /// <summary>设置transform属性 transform有顺序之别
            /// <para>如果已有transform样式，将会按照原先顺序赋值 没有的将按顺序push进去</para>
            /// <para>数组形式为[["translate","30px","30px"],["skew","30px","30px"]]</para>
            /// </summary>
            /// <param name="style" type="Array">样式名数组</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.setTransformByCurrent(ele, style);
            });
        }
        , setTranslate3d: function (obj) {
            /// <summary>设置css3d的translate3d
            /// <para>num tx:x轴位移 不带单位</para>
            /// <para>num ty:y轴位移</para>
            /// <para>num tz:z轴位移</para>
            /// <para>num translateX:x轴位移 带单位</para>
            /// <para>num translateY:y轴位移</para>
            /// <para>num translateZ:z轴位移</para>
            /// </summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="obj" type="Object">参数</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.setTransform3d(ele, obj);
            });
        }

        , transform: function (style) {
            /// <summary>设置所元素transform属性或返回transform属性 transform有顺序之别
            /// <para>如果style为string 将会返回第一个元素某个值 如"translate"</para>
            /// <para>头可以如此获得$.css3Head</para>
            /// <para>name缺省则返回所有存在的[["translate", "50px", "50px"], ["rotate", "30deg"], ["skew", "30deg", "30deg"]]</para>
            /// <para>name存在并且是属性返回[["translate", "50px", "50px"]]</para>
            /// <para>如果name不是transform的属性名 则返回[[]]</para>
            /// </summary>
            /// <param name="style" type="Array/String/undefined">样式名数组或样式名或不输入</param>
            /// <returns type="self" />
            return $.isArr(style) ? this.each(function (ele) {
                $.setTransform(ele, style);
            }) : $.getTransform(this[0], style);
        }
        , transform3d: function (obj, toNumber) {
            /// <summary>设置或返回css3d 默认是先translate ==> rotate ==> scale
            /// <para>如果要改变顺序 请使用setTransform</para>
            /// <para>设置的Object属性:</para>
            /// <para>num obj.rx:x轴旋转 不带单位</para>
            /// <para>num obj.ry:y轴旋转</para>
            /// <para>num obj.rz:z轴旋转</para>
            /// <para>num obj.tx:x轴位移</para>
            /// <para>num obj.ty:y轴位移</para>
            /// <para>num obj.tz:z轴位移</para>
            /// <para>num obj.sx:缩放（范围0到1）</para>
            /// <para>num obj.sy:缩放（范围0到1）</para>
            /// <para>设置的Object属性和返回的:</para>
            /// <para>num obj.rotateX:x轴旋转 带单位</para>
            /// <para>num obj.rotateY:y轴旋转</para>
            /// <para>num obj.rotateZ:z轴旋转</para>
            /// <para>num obj.translateX:x轴位移</para>
            /// <para>num obj.translateY:y轴位移</para>
            /// <para>num obj.translateZ:z轴位移</para>
            /// <para>num obj.scaleX:缩放（范围0到1）</para>
            /// <para>num obj.scaleY:缩放（范围0到1）</para>
            /// <para>如果是具名的name则返回具体的值</para>
            /// </summary>
            /// <param name="obj" type="Object/undefined/String">参数</param>
            /// <param name="toNumber" type="Boolean">是否直接把返回的结果转为数字</param>
            /// <returns type="self" />
            if (hasTransform3d) {
                switch(typeof obj){
                    case "boolean":
                        toNumber = obj;
                    case "undefined":
                        return $.getTransform3d(this[0], toNumber);
                    case "string":
                        return $.getTransform3dByName(this[0], obj, toNumber);
                    case "object":
                        return this.each(function (ele) {
                            $.setTransform3d(ele, obj);
                        });
                }
            }
            else {
                return this;
            }
        }
        , transformOrigin: function (style) {
            /// <summary>用来设置元素的运动的基点(参照点)或返回第一个元素的基点.默认为元素中心点.
            /// <para>transform–origin(x,y)</para>
            /// <para>style.x style.y</para>
            /// <para>x也可指定字符值参数: left,center,right.</para>
            /// <para>y也可指定字符值参数: top,center,right.</para>
            /// <para>left == 0%,center == 50%,right == 100%</para>
            /// <para>top == 0%,center == 50%,right == 100%</para>
            /// </summary>
            /// <param name="style" type="Object">参数</param>
            /// <returns type="self" />
            return style ? this.each(function (ele) {
                $.setTransformOrigin(ele, style);
            }) : $.getTransformOrigin(this[0]);
        }
        , transition: function (style) {
            /// <summary>获得transition样式 或 设置transition属性
            /// <para>详见 $.setTransition 或 $.getTransiton</para>
            /// </summary>
            /// <param name="style" type="String/Array/Object/undefined">为Array Object为设置;String看情况获得或设置;undefined为获得</param>
            /// <returns type="self" />
            if (style == undefined || $.isStr(style) && style.indexOf(" ") < 0) {
                return $.getTransition(this[0], style);
            }
            else if ($.isArr(style) || $.isObj(style) || $.isStr(style)) {
                return this.bindTransition(style);
            }
        }
    });

    return css3;
});
