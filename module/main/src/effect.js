define(function(require,exports,module){
	exports.POPING_WIDTH = 32;
	exports.poping = function(parent, x,y,icon,value){
		var div = $("<div class='effect effect-icon detail "+icon+"' style='z-index:80;line-height:"+exports.POPING_WIDTH+"px;font-size:24;position:absolute;left:"+x+"px;top:"+y+"px'>"+(value>0?"+":"")+value+"</div>");
		parent.append(div);
		div.animate({top:y-15, opacity:0.6},1000, "linear", function(){
			div.remove();
		});
	}
});