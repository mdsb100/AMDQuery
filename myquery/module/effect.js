/// <reference path="../myquery.js" />
// quote from colo.js by Andrew Brehaut, Tim Baumann

myQuery.define('module/effect', ['module/animate'], function ($, animate, undefined) {
    "use strict"; //启用严格模式
    var effect = {
        _show: $.show
        , _hide: $.hide

        , fadeIn: function (ele, option) {
            /// <summary>淡入</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if ($.isVisible(ele)) { return this; }

            var o, opt = $._getAnimateOpt(option);
            o = $.data(ele, "slideOriginOpacity");
            o = o != null ? o : ($.style(ele, "opacity") || 1);

            $.data(ele, "slideOriginOpacity", o);
            opt.complete = function () {
                $.data(ele, "slideOriginOpacity", null);
                option && option.complete && option.complete();
                option = opt = ele = o = null;
            }
            return $.setOpacity(ele, 0)._show(ele).animate(ele, { opacity: o }, opt);
        }
        , fadeOut: function (ele, option) {
            /// <summary>淡出</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if (!$.isVisible(ele)) { return this; }
            option = option || { visible: 0 }
            
            var o, opt = $._getAnimateOpt(option);
            o = $.data(ele, "slideOriginOpacity");
            o = o != null ? o : $.style(ele, "opacity");

            $.data(ele, "slideOriginOpacity", o);
            opt.complete = function () {
                $._hide(ele, opt.visible).setOpacity(ele, o);
                $.data(ele, "slideOriginOpacity", null);
                option && option && option.complete && option.complete();
                option = opt = ele = o = null;
            }
            return $._show(ele).animate(ele, { opacity: 0 }, opt);
        }

        , hide: function (ele, type, option) {
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
            }
            else {
                $._hide(ele);
            }
            return this;
        }

        , show: function (ele, type, option) {
            /// <summary>显示元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if ($.isStr(type) && $[type]) {
                $[type](ele, option);
            }
            else {
                $._show(ele);
            }
            return this;
        }
        , slideDown: function (ele, option) {
            /// <summary>滑动淡入</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if ($.isVisible(ele)) { return this; }

            var h = $.data(ele, "slideOriginHeight") || $.getInnerH(ele), opt = $._getAnimateOpt(option);
            $.data(ele, "slideOriginHeight", h);
            opt.complete = function () {
                $.data(ele, "slideOriginHeight", null);
                option && option.complete && option.complete();
                option = opt = ele = h = null;
            }
            return $.css(ele, "height", 0)._show(ele).animate(ele, { height: h + "px" }, opt);

            //            { duration: "slow", queue: queue
            //                , complete: function () {

            //                }
            //            }
        }
        , slideUp: function (ele, option) {
            /// <summary>滑动淡出</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            if (!$.isVisible(ele) || $.data(ele, "_sliedeDown")) { return this; }

            var h = $.data(ele, "slideOriginHeight") || $.getInnerH(ele), opt = $._getAnimateOpt(option);
            $.data(ele, "slideOriginHeight", h);
            opt.complete = function () {
                $._hide(ele, opt.visible).setInnerH(ele, h);
                $.data(ele, "slideOriginHeight", null);
                option && option.complete && option.complete();
                option = opt = ele = h = null;
            }
            return $._show(ele).animate(ele, { height: "0px" }, opt);
        }
    }
    $.extend(effect);

    $.fn.extend({
        fadeIn: function (option) {
            /// <summary>淡入</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.fadeIn(ele, option)
            });
        }
        , fadeOut: function (option) {
            /// <summary>淡出</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.fadeOut(ele, option);
            });
        }

        , hide: function (type, option) {
            /// <summary>隐藏元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.hide(ele, type, option);
            })
        }

        , show: function (type, option) {
            /// <summary>显示元素
            /// <para>type:slide fade</para>
            /// </summary>
            /// <param name="type" type="String/undefined">动画类型</param>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.show(ele, type, option);
            });
        }
        , slideDown: function (option) {
            /// <summary>滑动淡入</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.slideDown(ele, option);
            });
        }
        , slideUp: function (option) {
            /// <summary>滑动淡出</summary>
            /// <param name="option" type="Object">动画选项</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.slideUp(ele, option);
            });
        }
    });
    return effect;
});