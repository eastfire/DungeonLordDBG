define(function(require,exports,module){
	var CardSprite = require("./CardSprite").CardSprite;
	exports.PokerCardSprite = CardSprite.extend({
		events:{
			"click": "onSelected",
		},
		initClass:function(){
			var SpriteModel = require("../model/PokerCardModel").PokerCardModel;
			this.SpriteModel = SpriteModel;
		},
		initStyle:function(){
			require.async("../../css/poker.css");
		},
		initLayout:function(){
			this.$el.addClass("poker-card "+this.model.get("player"));
			this.$el.css({'background-position':"-"+(71*(this.model.get("number")-1))+"px"+" -"+(96*this.model.get("type"))+"px", });
			if ( this.options.draggable )
			{
				this.$el.draggable({
				helper:function(event){
					var div = $(event.currentTarget).clone();
					$("body").append(div);
					return div;
				}});
			}
		},
		onSelected:function(){
			this.model.set({selected:!this.model.get("selected")});
		},
		render:function(){
			this.$el.css({left:this.model.get("x"), top:this.model.get("y"), width:this.model.get("width"),height:this.model.get("height"), 'z-index':this.model.get("z"),position:"absolute"});
			return this;
		}

	});
})

