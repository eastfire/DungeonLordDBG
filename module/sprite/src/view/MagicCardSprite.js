define(function(require,exports,module){
	var CardSprite = require("./CardSprite").CardSprite;
	exports.MagicCardSprite = CardSprite.extend({
		initClass:function(){
			var SpriteModel = require("../model/MagicCardModel").MagicCardModel;
			this.SpriteModel = SpriteModel;
		},
		initStyle:function(){
			require.async("../../css/magic-card.css");
		},
		initLayout:function(){
			this.$el.addClass("magic-card");
			this.$el.addClass(this.options.player);
			this.$el.addClass(this.model.get("type")+"-card");
			this.$el.draggable({
			revert: true});
		},
		render:function(){
			this.$el.css({left:this.model.get("x"), top:this.model.get("y"), width:this.model.get("width"),height:this.model.get("height"), 'z-index':this.model.get("z"),position:"absolute"});
			return this;
		}
	});
})

