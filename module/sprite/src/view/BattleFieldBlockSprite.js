define(function(require,exports,module){
	
	var Sprite = require("./Sprite").Sprite;
	exports.BattleFieldBlockSprite = Sprite.extend({
		initData:function(){
		},
		
		initLayout:function(){
			this.$el.addClass("battle-field-block");
		},
		render:function(){
			this.$el.css({'z-index':this.options.z, left:this.options.x*(this.options.width+10), top:this.options.y*(this.options.height+10), width:this.options.width,height:this.options.height,position:"absolute"});
			return this;
		}
	});
});