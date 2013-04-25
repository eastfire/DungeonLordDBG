define(function(require,exports,module){
	
	var Sprite = require("./Sprite").Sprite;
	exports.BattleFieldSprite = Sprite.extend({
		width:5,
		height:3,
		initData:function(){
		},
		initClass:function(){
			this.BattleFieldBlockSprite = require("./BattleFieldBlockSprite").BattleFieldBlockSprite;
			this.SummonFieldBlockSprite = require("./SummonFieldBlockSprite").SummonFieldBlockSprite;
		},

		initStyle:function(){
			require.async("../../css/battle-field.css");
		},

		initLayout:function(){
			this.$el.addClass("battle-field");
			for ( var i = 0; i < this.height; i++) {
				for ( var j = 0; j < this.width; j++ ) {
					var block
					if ( j == 0) {
						block = new this.SummonFieldBlockSprite({x:j,y:i,z:0,width:this.options.blockWidth, height:this.options.blockHeight,player:"left-player"});
					} else if ( j == this.width-1 )	{
						block = new this.SummonFieldBlockSprite({x:j,y:i,z:0,width:this.options.blockWidth, height:this.options.blockHeight,player:"right-player"});
					} else {
						block = new this.BattleFieldBlockSprite({x:j,y:i,z:0,width:this.options.blockWidth, height:this.options.blockHeight});
					}
					this.$el.append(block.render().el);
					block.on("creature-summoned",this.onCreatureSummoned,this);
				}
			}
		},
		render:function(){
			this.$el.css({left:this.options.x, top:this.options.y, width:this.options.width,height:this.options.height,position:"absolute"});
			return this;
		},
		onCreatureSummoned:function(creatureModel, fieldBlock) {
			console.log("adsf");
			
		}
	});
});