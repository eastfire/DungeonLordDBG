define(function(require,exports,module){
	var MagicCardSprite = require("../../../sprite/src/view/MagicCardSprite").MagicCardSprite;
	exports.CreatureCardSprite = MagicCardSprite.extend({
		initStyle:function(){
			MagicCardSprite.prototype.initStyle.apply(this);
			require.async("../../css/undead.css");
		},
		initLayout:function(){
			MagicCardSprite.prototype.initLayout.apply(this);
			this.$el.addClass("undead skeleton-card");
		},
	});
})

