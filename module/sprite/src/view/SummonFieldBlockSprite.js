define(function(require,exports,module){
	
	var BattleFieldBlockSprite = require("./BattleFieldBlockSprite").BattleFieldBlockSprite;
	exports.SummonFieldBlockSprite = BattleFieldBlockSprite.extend({
		events:{
			"drop":"onPokerCardDrop",
			"dropover":"onPokerCardDropOver",
			"dropout":"onPokerCardDropOut",
		},
		initClass:function(){
			BattleFieldBlockSprite.prototype.initClass.apply(this);
			this.CardRowSprite = require("./CardRowSprite").CardRowSprite;
		},
		initData:function(){
		},
		initStyle:function(){

		},

		initLayout:function(){
			BattleFieldBlockSprite.prototype.initLayout.apply(this);
			this.$el.addClass("summon-field-block");
			this.$el.addClass(this.options.player);
			this.$el.droppable({
				accept:".poker-card."+this.options.player,
			});
			this.row = new this.CardRowSprite({draggable:false, 
				model:new this.SpriteModel({
					y:0, 
					x:(this.options.player == "left-player"?-160:this.options.width),
					width:150,
					height:this.options.height})
				});
			this.$el.append(this.row.render().el);
		},

		onPokerCardDrop:function(event,ui){
			if ( this.row.cards.length < 5 )
			{
				var card = $(ui.draggable).data("view").model;
				card.collection.remove(card);
				this.row.cards.add(card);
			}
			event.stopPropagation();
		},
		
		onPokerCardDropOut:function(event,ui){
			event.stopPropagation();
		},
		
		onPokerCardDropOver:function(event,ui){
			event.stopPropagation();
		},


		onMagicCardDrop:function(event,ui){
			var card = $(ui.draggable).data("view");
			
			var type = card.model.get("type");
			var package = card.model.get("package");
			var idName = card.model.get("idName");
			var player = card.model.get("player");
			if ( type == "creature")
			{
				var creature = new window.creatureModelClass[idName]({blockX:this.options.x,blockY:this.options.y,x:this.options.width*this.options.x, y:this.options.height*this.options.y, player:this.options.player,z:1,magicCard:card.model});
				window.creatures.add(creature);
			}
			this.trigger("magic-casted",card,this);
			
		},

		onMagicCardDropOut:function(event,ui){
		},
		
		onMagicCardDropOver:function(event,ui){
		},
	});
});