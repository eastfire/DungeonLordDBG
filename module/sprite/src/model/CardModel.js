define(function(require,exports,module){
	var SpriteModel = require("./SpriteModel").SpriteModel;
	exports.CardModel = SpriteModel.extend({
		defaults: function() {			
			return _.extend(SpriteModel.prototype.defaults.apply(this),
			{
			});
		}
	});
})
