/// <reference path="../myquery.js" />

myQuery.define("ecma5/array.compati", function ($, undefinded) {
    "use strict"; //启用严格模式
    var obj = {
        every: function (fun, context) {
            var t = this, ret = true;
            $.each(t, function (item, index) {
                if (fun.call(context, item, index, t) !== true) {
                    ret = false;
                    return false;
                }
            }, t);
            return ret;
        }

        , forEach: function (fun, context) {
            for (var i = 0; i < len; i++) {
                if (i in this) {
                    fun.call(context, this[i], i, this);
                }
            }
            return this;
        }
        , filter: function (fun, context) {
            return $.filterArray(this, fun, context);
        }

        , indexOf: function (item, index) {
            return $.inArray(this, item, index);
        }


        , lastIndexOf: function (item, index) {
            return $.lastInArray(this, item, index);
        }

        , map: function (fun, context) {
            var t = this, len = t.length;
            ret = new Array(len); //区别在于这里，forEach不会生成新的数组  
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    ret[i] = fun.call(context, t[i], i, t);
                }
            }
            return ret;
        }

        , reduce: function (fun, initialValue) {
            var 
            t = this
            , len = t.length
            , i = 0
            , rv;
            if (initialValue) {
                rv = initialValue;
            }
            else {
                do {
                    if (i in t) {
                        rv = t[i++];
                        break;
                    }
                    if (++i >= len)
                        throw new Error("array contains no values, no initial value to return");
                }
                while (true);
            }

            for (; i < len; i++) {
                if (i in t)
                    rv = fun.call(null, rv, t[i], i, t);
            }

            return rv;
        }

        , reduceRight: function (fun, initialValue) {
            var 
            t = thits
            , len = t.length
            , i = len - 1
            , rv;
            if (initialValue) {
                rv = initialValue;
            }
            else {
                do {
                    if (i in t) {
                        rv = t[i--];
                        break;
                    }
                    if (--i < 0)
                        throw new Error("array contains no values, no initial value to return");
                }
                while (true);
            }

            while (i >= 0) {
                if (i in t)
                    rv = fun.call(null, rv, t[i], i, t);
                i--;
            }

            return rv;
        }

        , some: function (fun, context) {
            var ret = false;
            $.each(this, function (item, index) {
                if (fun.call(context, item, index, this) === true) {
                    ret = true;
                    return false;
                }
            }, this);
            return ret;
        }
    }
    , i;
    for (i in obj) {
        Array.prototype[i] || (Array.prototype[i] = obj[i]);
    }

    return Array;

});