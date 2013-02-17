myQuery.define("util/function.extend", [], function ($) {
    "use strict"; //启用严格模式 
    $.easyExtend($.util, {
        defer: function(fun, context){
            var args = $.util.argToArray(arguments, 1);
            return setTimeout(function(){
                fun.apply(context, args);
            }, 1);
        }
    });
    return $.util;
});