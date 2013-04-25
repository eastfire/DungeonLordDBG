define(function(require,exports,module){
	var CardModel = require("./CardModel").CardModel;
	exports.PokerCardModel = CardModel.extend({
		defaults: function() {			
			return _.extend(CardModel.prototype.defaults.apply(this),
			{
				number: 1,
				type: 0,
				player: "",
				selected: false,
			});
		}
	});

	exports.PokerCardCollection = Backbone.Collection.extend({
		model: exports.PokerCardModel,
		comparator : function(model){
			return model.get("number")*4+model.get("type");
		}
	});
})
