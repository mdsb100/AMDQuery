/// <reference path="../myquery.js" />
// quote from colo.js by Andrew Brehaut, Tim Baumann

myQuery.define('module/effect', ['module/animate'], function($, animate, undefined) {
    "use strict"; //启用严格模式
    var slideDownComplete = function(opt) {
        $.data(this, "slideOriginHeight", null);
    },
    slideUpComplete = function(opt) {
        $._hide(this, opt.visible).css(this, "height", $.data(this, "slideOriginHeight"));
        $.data(this, "slideOriginHeight", null);
    },
    fadeInComplete = function(opt) {
        $.data(this, "slideOriginOpacity", null);
    },
    fadeOutComplete = function(opt) {
        $._hide(this, opt.visible).setOpacity(this, $.data(this, "slideOriginOpacity"));
        $.data(this, "slideOriginOpacity", null);
    }

    var effect = {
        _show: $.show,
        _hide: $.hide,

        fadeIn: function(ele, option) {
            /// <summary>淡入</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if ($.isVisible(ele)) {
                return this;
            }

            var o, opt = $._getAnimateOpt(option);
            o = $.data(ele, "slideOriginOpacity");
            o = o != null ? o : ($.css(ele, "opacity") || 1);

            $.data(ele, "slideOriginOpacity", o);
            opt.complete = fadeInComplete;
            return $.setOpacity(ele, 0)._show(ele).animate(ele, {
                opacity: o
            }, opt);
        },
        fadeOut: function(ele, option) {
            /// <summary>淡出</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if (!$.isVisible(ele)) {
                return this;
            }
            option = option || {
                visible: 0
            }

            var o, opt = $._getAnimateOpt(option);
            o = $.data(ele, "slideOriginOpacity");
            o = o != null ? o : $.css(ele, "opacity");

            $.data(ele, "slideOriginOpacity", o);
            opt.complete = fadeOutComplete;
            return $._show(ele).animate(ele, {
                opacity: 0
            }, opt);
        },

        hide: function(ele, type, option) {
            /// <summary>隐藏元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            ///  name="visible" type="Boolean/undefined">true:隐藏后任然占据文档流中
            if ($.isStr(type) && $[type]) {
                $[type](ele, option);
            } else {
                $._hide(ele);
            }
            return this;
        },

        show: function(ele, type, option) {
            /// <summary>显示元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if ($.isStr(type) && $[type]) {
                $[type](ele, option);
            } else {
                $._show(ele);
            }
            return this;
        },
        slideDown: function(ele, option) {
            /// <summary>滑动淡入</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if ($.isVisible(ele)) {
                return this;
            }

            var h = $.data(ele, "slideOriginHeight") || $.css(ele, "height"),
                opt = $._getAnimateOpt(option);
            $.data(ele, "slideOriginHeight", h);
            $.css(ele, "height", 0);
            opt.complete.push(slideDownComplete);
            return $.css(ele, "height", 0)._show(ele).animate(ele, {
                height: h
            }, opt);
        },
        slideUp: function(ele, option) {
            /// <summary>滑动淡出</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if (!$.isVisible(ele) || $.data(ele, "_sliedeDown")) {
                return this;
            }

            var h = $.data(ele, "slideOriginHeight") || $.css(ele, "height"),
                opt = $._getAnimateOpt(option);
            $.css(ele, "height", h);
            $.data(ele, "slideOriginHeight", h);
            opt.complete.push(slideUpComplete);
            return $._show(ele).animate(ele, {
                height: "0px"
            }, opt);
        }
    }
    $.extend(effect);

    $.fn.extend({
        fadeIn: function(option) {
            /// <summary>淡入</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function(ele) {
                $.fadeIn(ele, option)
            });
        },
        fadeOut: function(option) {
            /// <summary>淡出</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function(ele) {
                $.fadeOut(ele, option);
            });
        }

        ,
        hide: function(type, option) {
            /// <summary>隐藏元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function(ele) {
                $.hide(ele, type, option);
            })
        }

        ,
        show: function(type, option) {
            /// <summary>显示元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function(ele) {
                $.show(ele, type, option);
            });
        },
        slideDown: function(option) {
            /// <summary>滑动淡入</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function(ele) {
                $.slideDown(ele, option);
            });
        },
        slideUp: function(option) {
            /// <summary>滑动淡出</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function(ele) {
                $.slideUp(ele, option);
            });
        }
    });
    return effect;
});