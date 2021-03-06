define(function(require,exports,module){
	var Sprite = require("./Sprite").Sprite;
	exports.CreatureSprite = Sprite.extend({
		initClass:function(){
			var SpriteModel = require("../model/CreatureModel").CreatureModel;
			this.SpriteModel = SpriteModel;
		},
		initLayout:function(){
			this.$el.addClass("creature");
			this.$el.addClass(this.model.player);
		},
		render:function(){
			this.$el.css({left:this.model.get("x"), top:this.model.get("y"), width:this.model.get("width"),height:this.model.get("height"), 'z-index':this.model.get("z"),position:"absolute"});
			return this;
		}
	});
})