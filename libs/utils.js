define(function(require,exports,module){
	
	exports.judgeType: function(selected) {
		if ( selected.length == 2 ) {
		//a pair
			if ( selected[0].get("number") == selected[1].get("number") )
				return "1-pair";
		} else if ( selected.length == 3 ) {
			if ( selected[0].get("number") == selected[1].get("number") &&
				 selected[0].get("number") == selected[2].get("number") )
				return "3-of-a-kind";
		} else if ( selected.length == 4 ) {
			if ( selected[0].get("number") == selected[1].get("number") &&
				 selected[0].get("number") == selected[2].get("number") &&
				 selected[0].get("number") == selected[3].get("number") )
				return "3-of-a-kind";
		} else if ( selected.length == 5 ) {
			if ( selected[0].get("number") == selected[1].get("number") &&
				 selected[0].get("number") == selected[2].get("number") &&
				 selected[0].get("number") == selected[3].get("number") &&
				 selected[0].get("number") == selected[4].get("number"))
				this.trigger("set-selected",{set:"5-of-a-kind", selected:selected});
			if ( selected[0].get("type") == selected[1].get("type") &&
				 selected[0].get("type") == selected[2].get("type") &&
				 selected[0].get("type") == selected[3].get("type") &&
				 selected[0].get("type") == selected[4].get("type"))
				this.trigger("set-selected",{set:"flush", selected:selected});
		}
		return null;
	}
});