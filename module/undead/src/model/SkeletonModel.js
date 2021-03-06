define(function(require,exports,module){
	var SpriteModel = require("../../../sprite/src/model/SpriteModel").SpriteModel;
	exports.CreatureModel = SpriteModel.extend({
		defaults: function() {
			var def = SpriteModel.prototype.defaults.apply(this);
			return _.extend(def,
			{
				width: 150,
				height: 130,
			});
		}
	});
})