define(function(require,exports,module){
	var Sprite = require("./Sprite").Sprite;
	exports.CardSprite = Sprite.extend({
		initClass:function(){
			var SpriteModel = require("../model/CardModel").CardSpriteModel;
			this.SpriteModel = SpriteModel;
		},
	});
})

