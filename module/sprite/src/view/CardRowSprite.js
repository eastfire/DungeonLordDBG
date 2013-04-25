define(function(require,exports,module){
	
	var Sprite = require("./Sprite").Sprite;
	exports.CardRowSprite = Sprite.extend({
		initClass:function(){
			this.PokerCardSprite = require("./PokerCardSprite").PokerCardSprite;
			this.PokerCardCollection = require("../model/PokerCardModel").PokerCardCollection;
		},
		
		initData:function(){
			this.cards = new this.PokerCardCollection();
			this.cards.on("add",this.onAddCard, this);
			this.cards.on("reset",this.onResetCards, this);
			this.cards.on("remove",this.onRemoveCard, this);
		},
		
		onResetCards:function(collection, options){
			this.rearrangeCards();
		},

		rearrangeCards: function(){
			var increaseX = Math.min((this.$el.width()- this.cards.at(0).get("width"))/this.cards.length, this.cards.at(0).get("width"));
			for (var i =0 ;i < this.cards.length; i++){
				var card = this.cards.at(i);
				card.set({x:increaseX*i,z:i+1});
			}
			this.render();
		},

		onAddCard:function(model, collection, options){
			model.on("change:selected",this.judgeSelectedType, this);
			var cardSprite = new this.PokerCardSprite({model:model, player: this.options.player, draggable:this.options.draggable});
			this.$(".cards").append(cardSprite.render().el);
			this.rearrangeCards();
		},

		onRemoveCard:function(model, collection, options){
			var array = this.$(".poker-card");
			for ( var i=0; i< array.length; i++)
			{
				if ( $(array[i]).data("view").model == model ) {
					$(array[i]).data("view").remove();
					break;
				}
			}
			this.rearrangeCards();
		},

		initStyle:function(){
		},

		initLayout:function(){
			this.$el.addClass("hands-of-poker");
			if ( this.options.showCount )
			{
				this.$el.append("<div class='card-number'/>");
				this.$el.append("<div class='cards' style='position:absolute;top:20px'/>");
			} else 
				this.$el.append("<div class='cards' style='position:absolute;top:0px'/>");
		},
		
		render: function(){
			Sprite.prototype.render.apply(this);
			if ( this.options.showCount )
			{
				this.$(".card-number").html(this.cards.length);
			}
			return this;
		},
	});
})


