/// <reference path="../myquery.js" />

myQuery.define("html5/canvas", ["module/color"], function ($, color, undefined) {
    "use strict"; //启用严格模式
    var canvas = null;
    if (typeof CanvasRenderingContext2D != "undefined") {
    	canvas = CanvasRenderingContext2D;
        var R = Math.round;
        $.easyExtend(canvas.prototype, {
            a: function (a, b, c, d, e, f) { this.arc(a, b, c, d, e, f); return this; }
            , as: function (a, b) {
                for (var i = 0, len = b.length; i < len; i++) {
                    a.addColorStop(b[i][0], b[i][1]);
                }
            }

		    , b: function (a) { this.beginPath(); return this; }
		    , bc: function (a, b, c, d, e, f) { this.bezierCurveTo(a, b, c, d, e, f); return this; }

		    , c: function (a) { this.closePath(); return this; }
		    , cl: function () { this.clip(); return this; }
		    , cr: function (a, b, c, d) { this.clearRect(a || 0, b || 0, c || 2000, d || 2000); return this; }

		    , di: function () {
		        this.drawImage.apply(this, arguments);
		        return this;
		    }

		    , f: function (a) { if (a) { this.fs(a) } this.fill(); return this; }
            , ff: function (con, fns) { fns.apply(con, [].slice.call(arguments, 2)); return this; }
		    , fg: function () { this.f(this.grad); return this; }
		    , fo: function (a) { this.font = a; return this; }
		    , fr: function (a, b, c, d) { this.fillRect(a, b, c, d); return this; }
		    , fs: function (a) { this.fillStyle = a; return this; }
		    , ft: function (a, b, c) { this.fillText(a, b, c); return this; }

		    , gc: function (a) { this.globalCompositeOperation = a; return this; }

		    , i: function () { this.cr().lc().lj().ml().b(); return this; }

		    , l: function (a, b) { this.lineTo(a, b); return this; }
		    , lc: function (a) { this.lineCap = a || 'round'; return this; }
		    , lg: function (a, b, c, d, e, f) {
		        var grad = this.createLinearGradient(a, b, c, d);
		        this.as(grad, e);
		        if (f == true) {
		            this.ss(grad);
		        }
		        else {
		            this.fs(grad);
		        }
		        return this;
		    }
		    , lj: function (a) { this.lineJoin = a || 'round'; return this; }
		    , lw: function (a) { this.lineWidth = a || 1; return this; }

		    , m: function (a, b) { this.moveTo(a, b); return this; }
		    , ml: function (a) { this.miterLimit = a || 5; return this; }

		    , qc: function (a, b, c, d) { this.quadraticCurveTo(a, b, c, d); return this; }

            , r: function (a, b, c, d) { this.rect(a, b, c, d); return this; }
		    , rg: function (a, b, c, d, e, f, g, h) {
		        var grad = this.createRadialGradient(a, b, c, d, e, f);
		        this.as(grad, g);
		        if (h == true) {
		            this.ss(grad);
		        }
		        else {
		            this.fs(grad);
		        }
		        return this;
		    }
		    , rs: function () { this.restore(); return this; }
		    , rt: function (a) { this.rotate(a); return this; }


		    , s: function (a) { if (a) { this.ss(a) } this.stroke(); return this; }
            , sa: function (x, y) { this.scale(x, y); return this; }
		    , sd: function (a, b, c, d) {
		        a && (this.shadowOffsetX = a);
		        b && (this.shadowOffsetY = b);
		        c && (this.shadowColor = c);
		        d && (this.shadowBlur = d);
		        return this;
		    }
		    , sr: function (a, b, c, d) { this.strokeRect(a, b, c, d); return this; }
		    , ss: function (a) { this.strokeStyle = a; return this; }
		    , sv: function () { this.save(); return this; }

            , ts: function (a, b, c) { this.font = a; this.textBaseline = b || 'top'; this.textAlign = c || 'left'; return this; }
		    , tl: function (a, b) { this.translate(a, b); return this; }

        });
    }
    return canvas;
}); 
