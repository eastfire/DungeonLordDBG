define(function(require,exports,module){
	var Deck = require("./deck");
	exports.DungeonDiscardDeckView = Deck.DeckView.extend({
		initLayout : function(){
			Deck.DeckView.prototype.initLayout.apply(this);
			var self = this;
			this.$el.droppable({
				tolerance: "touch",
				over: function(event,ui){
					if ( $(this).hasClass("animating") )
						return;
					$(this).data("oldShadow", $(this).css("box-shadow"));
					$(this).css({"box-shadow":"0 0 10px green"})
				},
				out: function(event,ui){
					$(this).css({"box-shadow":$(this).data("oldShadow")})
				},
				accept: function(draggable){
					var cardView = $(draggable).data("view");
					if ( cardView.$el.hasClass("buyable") && self.options.player.get("money") >= cardView.model.get("cost") )
						return true;
					return false;
				},
				drop: function(event,ui){
					$(this).css({"box-shadow":$(this).data("oldShadow")})
					var cardView = $(ui.draggable).data("view");
					self.options.player.changeMoney( -cardView.model.get("cost") );
					var x = cardView.model.get("x");
					var y = cardView.model.get("y");
					var w = cardView.model.get("width");
					var h = cardView.model.get("height");
					cardView.model.get("row").removeView(cardView);
					cardView.moveAndResizeTo(self.model.get("x"), self.model.get("y"), self.model.get("width"), self.model.get("height"),200, function(){
						/*self.options.deck.drawCard(function(cardView){
							if ( cardView ) {
								self.$el.parent().append(cardView.render().el);
								cardView.moveAndResizeTo(x, y, w, h, 200, function(){
									cardView.flip(function(){
										cardView.setBuyable();
									});							
								});					
							}
						});*/
						cardView.model.set({cost:cardView.model.origin.cost,row:null});
						self.addCardToTop(cardView.model);
						cardView.remove();
						self.options.player.reCalScore();
					});
				}
			});
		}
	});
});