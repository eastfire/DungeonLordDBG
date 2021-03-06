define(function(require,exports,module){
	var Sprite = require("./Sprite");
	var Card = require("./card");
	exports.DeckModel = Sprite.SpriteModel.extend ({
		defaults: function() {
			var opt = Sprite.SpriteModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name : "",
				description : "",
				side : "front",//back
				tap : false,
			});
		},
		initialize:function(){
			this.CardCollection = Card.CardCollection;
			this.cards = new this.CardCollection();
		},
		shuffle:function(){
			this.cards.each(function(card){
				card.set("order",Math.random());
			});
			this.cards.sort();
			this.cards.each(function(card){
				card.set("order",0);
			});
		},
	});

	exports.DeckView = Sprite.Sprite.extend({
		initLayout:function(){
			Sprite.Sprite.prototype.initLayout.apply(this);
			this.$el.addClass("deck");
			this.$el.addClass(this.model.get("name"));
			this.$el.attr("title", this.model.get("description"));
			this.$el.append("<label title='剩余牌数' class='card-number' style='width:100%;text-align:center;position:absolute;bottom:-20px;'>"+this.model.cards.length+"</label>");
		},
		initClass : function() {
			Sprite.Sprite.prototype.initClass.apply(this);
			this.CardView = Card.CardView;
			this.DeckModel = exports.DeckModel;
		},
		initData : function() {
			Sprite.Sprite.prototype.initData.apply(this);
			this.model.cards.on("reset",this.render, this);
			this.model.cards.on("add",this.render, this);
			this.model.cards.on("remove",this.render, this);
		},
		renderTopCard:function(){
			var card = this.model.cards.at(0);
			if ( !card ) {
				this.$(".top-card").remove();
				this.$el.addClass("empty-deck");
				return;
			}
			this.$el.removeClass("empty-deck");

			this.$(".top-card").remove();
			if ( Card[card.get("cardViewClass")] ){
				card.set({width:this.model.get("width"),height:this.model.get("height"),x:0,y:0})
				var v = new Card[card.get("cardViewClass")]({model:card});
				this.$el.append(v.render().el);
				v.$el.addClass("top-card");
			} else {
				this.$el.append("<div class='top-card card'/>");
				this.$(".top-card").css({width:this.model.get("width"), height:this.model.get("height")});
				this.$(".top-card").addClass(card.get(card.get("side")));
			}
			if ( this.options.isDiscard ) {
				this.$(".top-card").addClass("discarded");
			}
		},
		render:function(){
			Sprite.Sprite.prototype.render.apply(this);
			var depth = Math.ceil(this.model.cards.length/10);

			this.$el.css({"box-shadow":depth+"px "+depth+"px "+depth+"px black"});
			this.$(".card-number").html(this.model.cards.length>0?this.model.cards.length:"");
			this.renderTopCard();
			return this;
		},
		addCard:function(cardModel){
			cardModel.set("order",0);
			this.model.cards.add(cardModel);
		},
		addCardToTop:function(cardModel){
			cardModel.set("order",0);
			this.model.cards.unshift(cardModel);
		},
		flip:function(){
			this.model.cards.each(function(card){
				card.set({side:card.get("side") == "front"?"back":"front"});
			});			
		},
		flipDown:function(){
			this.model.cards.each(function(card){
				card.set({side:"back"});
			});			
		},
		flipUp:function(){
			this.model.cards.each(function(card){
				card.set({side:"front"});
			});			
		},
		canDrawCard: function(){
			return this.model.cards.length > 0;
		},
		drawCard:function(callback){
			var card = this.model.cards.shift();
			if ( !card ){
				if ( this.discardTo && this.discardReshuffle )	{
					if ( this.discardTo.model.cards.length <= 0 ) {
						callback(null);
						return;
					}
					this.discardTo.flipDown();
					var oldx = this.discardTo.model.get("x");
					var oldy = this.discardTo.model.get("y");
					var self = this;
					this.discardTo.moveTo(this.model.get("x"),this.model.get("y"), null, function(){
						self.model.cards.add(self.discardTo.model.cards.models);
						self.model.shuffle();
						self.discardTo.model.set({x:oldx,y:oldy});
						self.discardTo.model.cards.reset();
						card = self.model.cards.shift();
						card.set({x:self.model.get("x"),y:self.model.get("y"),width:self.model.get("width"),height:self.model.get("height")});
						var cardView;
						if ( Card[card.get("cardViewClass")] )	{
							cardView = new Card[card.get("cardViewClass")]({model:card,discardTo:self.discardTo});
						} else
							cardView = new self.CardView({model:card,discardTo:self.discardTo});

						if ( callback ){
							callback(cardView);
						}
					});
				} else {
					if ( callback )
						callback(cardView);
				}
			} else {
				card.set({x:this.model.get("x"),y:this.model.get("y"),width:this.model.get("width"),height:this.model.get("height")});
				var cardView;
				if ( Card[card.get("cardViewClass")] )	{
					cardView = new Card[card.get("cardViewClass")]({model:card,discardTo:this.discardTo});
				} else
					cardView = new this.CardView({model:card,discardTo:this.discardTo});
				if ( callback )
					callback(cardView);
			}
		},
		setDiscardTo:function(deck, reshuffle){
			this.discardTo = deck;
			this.discardReshuffle = reshuffle;
		}
	});

	exports.HeroDeckView = exports.DeckView.extend({
		initClass : function() {
			exports.DeckView.prototype.initClass.apply(this);
			this.CardView = Card.HeroCardView;
		},
	});

	exports.DungeonDeckView = exports.DeckView.extend({
		initClass : function() {
			exports.DeckView.prototype.initClass.apply(this);
			this.CardView = Card.DungeonCardView;
		},
	});
});