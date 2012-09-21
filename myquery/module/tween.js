/// <reference path="../myquery.js" />

myQuery.define('module/tween', function ($, undefined) {
    "use strict"; //启用严格模式

    var math = Math,
        pi = math.PI,
        pow = math.pow,
        sin = math.sin,
        sqrt = math.sqrt,
        Tween = {
            getFun: function (name) {
                var fun;
                if ($.isFun(name)) {
                    fun = name
                }
                else if ($.isStr(name)) {
                    name = name.split(".");
                    fun = this;
                    $.each(name, function (str) {
                        if (fun) { fun = fun[str]; }
                        else { fun = null; return false; }
                    }, this);
                }
                return fun || this.linear;
            }
            , linear: function (t, b, c, d) {
                return t / d;
            }
            , swing: function (t) {
                return 0.5 - math.cos(t * math.PI) / 2;
            }
            , ease: function (t) {
                var q = 0.07813 - t / 2,
                Q = sqrt(0.0066 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + 0.25;
                return pow(1 - t, 2) * 3 * t * 0.1 + (1 - t) * 3 * t * t + t * t * t;
            }
            , easeIn: function (t) {
                return pow(t, 1.7);
            }
            , easeOut: function (t) {
                return pow(t, 0.48);
            }
            , easeInOut: function (t) {
                var q = 0.48 - t / 1.04,
                Q = sqrt(0.1734 + q * q),
                x = Q - q,
                X = pow(abs(x), 1 / 3) * (x < 0 ? -1 : 1),
                y = -Q - q,
                Y = pow(abs(y), 1 / 3) * (y < 0 ? -1 : 1),
                t = X + Y + 0.5;
                return (1 - t) * 3 * t * t + t * t * t;
            }
            , cubicBezier: function (t, b, c, d, x1, y1, x2, y2) {
                /*include Ext.js*/
                x1 = $.between(0, 1, x1 || 0);
                y1 = $.between(0, 1, y1 || 0);
                x2 = $.between(0, 1, x2 || 1);
                y2 = $.between(0, 1, y2 || 10);
                var time = t / d;
                var cx = 3 * x1,
                bx = 3 * (x2 - x1) - cx,
                ax = 1 - cx - bx,
                cy = 3 * y1,
                by = 3 * (y2 - y1) - cy,
                ay = 1 - cy - by;
                function sampleCurveX(t) {
                    return ((ax * t + bx) * t + cx) * t;
                }
                function solve(x, epsilon) {
                    var t = solveCurveX(x, epsilon);
                    return ((ay * t + by) * t + cy) * t;
                }
                function solveCurveX(x, epsilon) {
                    var t0, t1, t2, x2, d2, i;
                    for (t2 = x, i = 0; i < 8; i++) {
                        x2 = sampleCurveX(t2) - x;
                        if (Math.abs(x2) < epsilon) {
                            return t2;
                        }
                        d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                        if (Math.abs(d2) < 1e-6) {
                            break;
                        }
                        t2 = t2 - x2 / d2;
                    }
                    t0 = 0;
                    t1 = 1;
                    t2 = x;
                    if (t2 < t0) {
                        return t0;
                    }
                    if (t2 > t1) {
                        return t1;
                    }
                    while (t0 < t1) {
                        x2 = sampleCurveX(t2);
                        if (Math.abs(x2 - x) < epsilon) {
                            return t2;
                        }
                        if (x > x2) {
                            t0 = t2;
                        } else {
                            t1 = t2;
                        }
                        t2 = (t1 - t0) / 2 + t0;
                    }
                    return t2;
                }
                return solve(time, 1 / (200 * d));

            }
        }

    return $.tween = Tween;

});