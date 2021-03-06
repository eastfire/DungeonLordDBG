define(function(require,exports,module){
	var CreatureSprite = require("../../../sprite/src/view/CreatureSprite").CreatureSprite;
	exports.CreatureSprite = CreatureSprite.extend({
		initClass:function(){
			var SpriteModel = require("../model/SkeletonModel").SkeletonModel;
			this.SpriteModel = SpriteModel;
		},
		initStyle:function(){
			require.async("../../css/undead.css");
		},
		initLayout:function(){
			CreatureSprite.prototype.initLayout.apply(this);
			this.$el.addClass("skeleton undead");
			
		},
	});
})

