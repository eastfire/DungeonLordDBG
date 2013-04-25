define(function(require,exports,module){
	var Deck = require("./deck");
	exports.DungeonDeckView = Deck.DeckView.extend({
		initData : function(){
			Deck.DeckView.prototype.initData.apply(this);
			this.model.cards.on("reset",this.reScore, this);
			this.model.cards.on("add",this.reScore, this);
			this.model.cards.on("remove",this.reScore, this);
		},
		getScore: function() {
		},
		reScore: function(){
			this.trigger("change:")
		},
	});
});