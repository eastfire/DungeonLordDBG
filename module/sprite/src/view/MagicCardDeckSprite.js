define(function(require,exports,module){
	
	var Sprite = require("./Sprite").Sprite;
	exports.MagicCardDeckSprite = Sprite.extend({
		initClass:function(){
			this.MagicCardCollection = require("../model/MagicCardModel").MagicCardCollection;
		},
		
		initData:function(){
			this.cards = new this.MagicCardCollection();
			this.cards.on("add",this.onAddCard, this);
			this.cards.on("reset",this.onResetCards, this);
			this.cards.on("remove",this.onRemoveCard, this);
		},
		
		onResetCards:function(collection, options){
			this.rearrangeCards();
		},

		onAddCard:function(model, collection, options){
			for ( var i =0; i < model.get("count"); i++) {
				model.set({x:options.index*75, z:1});
				var cardSprite = new window.creatureCardSpriteClass[model.get("idName")]({player:this.options.player,model:model, index:i});
				this.$el.append(cardSprite.render().el);
			}
		},

		onRemoveCard:function(model, collection, options){

		},

		initStyle:function(){

		},

		initLayout:function(){
			this.$el.addClass("magic-card-deck");
		},
		
		render: function(){
			Sprite.prototype.render.apply(this);
			return this;
		},
	});
})


