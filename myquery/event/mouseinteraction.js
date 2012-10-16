myQuery.define("event/mouseinteraction", ["main/event"], function($, event) {
	function mouseinteraction(e,temp) {
		switch(e.type) {
		case "mousedown":
		case "touchstart":
			temp.isDown = 1;
			event.trigger(temp.target,"mouseinteractiondown",this,e);
			break;
		case "mousemove":
			if(e.which === 0 || (client.browser.ie678 && e.button != 1) || temp.isDown == 0) {
                self.isDown = 0;
                event.trigger(temp.target,"mouseinteractionmove",this,e);
                break;
            }
		case "touchmove":
			event.trigger(temp.target,"mouseinteractiondrag",this,e);
			break;
		case "mouseup":
		case "touchend":
			temp.isDown = 0;
			event.trigger(temp.target,"mouseinteractionup",this,e);
			break;
		}
	}

	$.fn.extend {
		mouseinteraction: function(down,drag,up,move) {
			return this.each(function(ele) {
				var temp = {
					isDown: 0,
					target: ele
				},
				anonymous = $.data(ele, "mouseinteraction", function(e) {
					mouseinteraction.call(this, e, temp)
				});
				event
				.on(ele, "mouseinteractiondown", down)
				.on(ele, "mouseinteractiondrag", drag)
				.on(ele, "mouseinteractionup", up)
				.on(ele, "mouseinteractionmove", move)
				.on(ele, "mousedown", anonymous)
				.on(ele, "mousemove", anonymous)
				.on(ele, "mouseup", anonymous);
			});
		},
		unMouseinteraction: function(down,drag,up,move) {
			return this.each(function(ele) {
				var anonymous = $.data(ele, "mouseinteraction");
				event
				.off(ele, "mouseinteractiondown", down)
				.off(ele, "mouseinteractiondrag", drag)
				.off(ele, "mouseinteractionup", up)
				.off(ele, "mouseinteractionmove", move)
				.off(ele, "mousedown", anonymous)
				.off(ele, "mousemove", anonymous)
				.off(ele, "mouseup", anonymous);
				$.data(ele, "mouseinteraction", null);
			});
		}
	}
	return mouseinteraction;
});