myQuery.define("event/mouseinteraction", ["main/event"], function($, event) {
	function mouseinteraction(e) {
		switch(e.type){
			case "mousedown":
			case "touchstart":
				break;
			case "mousemove":
			case "touchmove":
				break;
			case "mouseup":
			case "touchend":
				break;
		}
	}

	$.fn.extend {
		mouseinteraction: function(down,move,up) {
			return this.each(function(ele) {
				event
				.on(ele, "mouseinteractiondown", down)
				.on(ele, "mouseinteractionmove", move)
				.on(ele, "mouseinteractionup", up)
				.on(ele, "mousedown", mouseinteraction)
				.on(ele, "mousemove", mouseinteraction)
				.on(ele, "mouseup", mouseinteraction);
			});
		},
		unMouseinteraction:function(down,move,up) {
			return this.each(function(ele) {
				event
				.off(ele, "mouseinteractiondown", down)
				.off(ele, "mouseinteractionmove", move)
				.off(ele, "mouseinteractionup", up)
				.off(ele, "mousedown", mouseinteraction)
				.off(ele, "mousemove", mouseinteraction)
				.off(ele, "mouseup", mouseinteraction);
			});
		}
	}
	return mouseinteraction;
});