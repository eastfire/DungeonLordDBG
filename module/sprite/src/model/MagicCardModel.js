define(function(require,exports,module){
	var CardModel = require("./CardModel").CardModel;
	exports.MagicCardModel = CardModel.extend({
		idAttribute: "idName",
		defaults: function() {			
			return _.extend(CardModel.prototype.defaults.apply(this),
			{
				name: "",
				description: "",
				package: "",//undead, elf, human, and so on
				type: "creature",//creature, enchantment, sorcery
				cost: "",//1-pair,2-pair,3-of-a-kind,4-of-a-kind,flush,straight,full-house
				lastTime: 0,
				player: "",
			});
		}
	});

	exports.MagicCardCollection = Backbone.Collection.extend({
		model: exports.MagicCardModel,
	});
})
