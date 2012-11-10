/// <reference path="../myquery.js" />

myQuery.define("html5/css3.transition.animate", ["base/client", "html5/css3", "module/FX", "html5/animate.transform"]
, function ($, client, css3, FX, transform, undefined) {
    "use strict"; //启用严格模式

    //无法识别em这种

    if ($.support.transition) {
        var 
         transitionEndType = (function () {
             var type = "";
             if (client.engine.ie)
                 type = "MS";
             else if (client.engine.webkit || client.system.mobile)
                 type = "webkit";
             else if (client.engine.gecko)
                 type = "";
             else if (client.engine.opera)
                 type = "o";
             return type + 'TransitionEnd';
         })()
        , animateByTransition = function (ele, property, option) {
            /// <summary>给所有元素添加一个动画
            /// <para>obj property:{ width: "50em", top: "+=500px" }</para>
            /// <para>obj option</para>
            /// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
            /// <para>fun option.complete:结束时要执行的方法</para>
            /// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
            /// <para>默认只有linear</para>
            /// <para>没有complete</para>
            /// </summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="property" type="Object">样式属性</param>
            /// <param name="option" type="Object">参数</param>
            /// <returns type="self" />
            var opt = {}, p, self = ele, defaultEasing = option.easing, easing;

            $.easyExtend(opt, option);
            opt._transitionList = [];

            opt._transitionEnd = function (event) {
                for (var i = 0, len = opt._transitionList.length, that = this; i < len; i++) {
                    css3.removeTransition(this, opt._transitionList[i]);
                }
                this.removeEventListener(transitionEndType, opt._transitionEnd);

                setTimeout(function () {
                    opt.complete.call(that);
                    that = opt = null;
                }, 0);

            };

            for (var p in property) {
                var name = $.unCamelCase(p);
                if (p !== name) {
                    property[name] = property[p];
                    //把值复制给camelCase转化后的属性  
                    delete property[p];
                    //删除已经无用的属性  
                    p = name;
                }

                if ((p === "height" || p === "width") && ele.style) {
                    opt.display = ele.style.display; //$.css(ele, "display");

                    opt.overflow = ele.style.overflow;

                    ele.style.display = "block"; //是否对呢？
                }
            }

            //css3.removeTransition(ele);
            ele.addEventListener(transitionEndType, opt._transitionEnd, false);

            $.each(property, function (value, key) {
                var ret, i, temp, value, tran = [];

                easing = opt.specialEasing && opt.specialEasing[key] ? $.getTransitionEasing(opt.specialEasing[key]) : defaultEasing;
                if ($.isFun($.fx.custom[key])) {
                    ret = $.fx.custom[key](ele, opt, value, key);
                    temp = ret[0]._originCss;
                    opt._transitionList.push(temp);
                    tran.push(temp, (opt.duration / 1000) + "s", easing);
                    opt.delay && tran.push((opt.delay / 1000) + "s");
                    css3.addTransition(ele, tran.join(" "));
                    value = ret[0].update();
                    for (i = 0; i < ret.length; i++) {
                        value = ret[i].update(value, ret[i].end);
                    }
                } else {
                    ret = new FX(ele, opt, value, key);
                    opt._transitionList.push(key);
                    //temp = $.camelCase(key);
                    //ele.style[temp] = ret.from + ret.unit;
                    tran.push(key, (opt.duration / 1000) + "s", easing);
                    opt.delay && tran.push((opt.delay / 1000) + "s");

                    css3.addTransition(ele, tran.join(" "));
                    ele.style[$.camelCase(key)] = ret.end + ret.unit;
                }
            });
        }
        , easingList = {
            "linear": 1
            , "ease": 1
            , "ease-in": 1
            , "ease-out": 1
            , "ease-in-out": 1
            , "cubic-bezier": 1
        };

        $.extend({
            animateByTransition: function (ele, property, option) {
                var option = $._getAnimateByTransitionOpt(option);

                if ($.isEmptyObj(property)) {
                    return option.complete(ele);
                }
                else {
                    if (option.queue === false) {
                        animateByTransition(ele, property, option);
                    }
                    else {
                        $.queue(ele, "fx", function () {
                            animateByTransition(ele, property, option);
                            $.dequeue(ele, [ele]);
                            property = option = null;
                        });
                        //                        var queue = $.queue(ele, "fx", function (ele, dequeue) {
                        //                            animateByTransition(ele, property, option);
                        //                            dequeue();
                        //                            easingList = property = option = null;
                        //                        });

                        //                        if (queue[0] !== "inprogress") {
                        //                            $.dequeue(ele, "fx");
                        //                        }
                    }
                }
                return this;
            }
            , _getAnimateByTransitionOpt: function (opt) {
                opt = opt || {};
                var duration = FX.getDuration(opt.duration)
                    , delay = FX.getDelay(opt.delay)
                    , ret = {
                        delay: delay
                        , duration: duration
                        , easing: $.getTransitionEasing(opt.easing)
                        , complete: function (fx) {
                            opt.complete && opt.complete();
                            $(this).dequeue(); // this is ele
                            opt = duration = null;
                        }
                        , specialEasing: opt.specialEasing
                        , queue: opt.queue === false ? false : true
                    };

                return ret;
            }
            , getTransitionEasing: function (easing) {
                if (easing) {
                    if ($.isArr(easing)) {
                        var name = easing.slice(0, 1)[0];
                        if ($.unCamelCase(name) == "cubic-bezier") {
                            return "cubic-bezier(" + easing.join(",") + ")";
                        }
                        else {
                            easing = name;
                        }
                    }
                    easing = $.unCamelCase(easing);
                    if (easing.indexOf(".") > -1) {
                        easing = easing.replace(".", "-");
                    }
                }
                return (easingList[easing] && easing) || "linear"
            }
        });

        $.fn.extend({
            animateByTransition: function (property, option) {
                // <summary>给所有元素添加一个动画
                /// <para>obj property:{ width: "50em", top: "+=500px" }</para>
                /// <para>obj option</para>
                /// <para>num/str option.duration:持续时间 也可输入"slow","fast","normal"</para>
                /// <para>fun option.complete:结束时要执行的方法</para>
                /// <para>str/fun option.easing:tween函数的路径:"quad.easeIn"或者直接的方法</para>
                /// <para>默认只有linear</para>
                /// <para>没有complete</para>
                /// </summary>
                /// <param name="property" type="Object">样式属性</param>
                /// <param name="option" type="Object">参数</param>
                /// <returns type="self" />
                var option = $._getAnimateByTransitionOpt(option);
                if ($.isEmptyObj(property)) {
                    return this.each(option.complete);
                }
                else {
                    return this[option.queue === false ? "each" : "queue"](function (ele) {
                        animateByTransition(ele, property, option);
                    });
                }
            }
        });

        //        $.support.transition = (function () {
        //            var result = false;
        //            (
        //            client.browser.chrome ||
        //            client.browser.firefox >= 16 ||
        //            client.browser.ie >= 10 ||
        //            client.browser.opera >= 10.5 ||
        //            client.browser.sarfari >= 3.2
        //            ) && (result = true);
        //            return result;
        //        })();

        if ($.config.model.transitionToAnimation) {
            if ($.support.transition) {
                $.animate = $.animateByTransition;
                $.fn.animate = $.fn.animateByTransition;
            }
            else {
                $.console.log({ msg: "browser is not support transitionEnd", fn: "css3.transition.animate load" });
            }
        }
    }

});
