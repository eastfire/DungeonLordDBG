define(function(require,exports,module){
	var Effect = require("./effect");
	var INITIAL_HAND_COUNT = 7;
	var INITIAL_PLAYER_HP = 100;
	var PLAYER_HAND_LIMIT = 10;
	exports.PlayerView = Backbone.View.extend({
		initialize:function(){
			this.initLayout();
			this.model.on("change",this.render,this);
			this.model.on("change:score",this.onChangeScore,this);
			this.model.on("change:money",this.onChangeMoney,this);			
		},
		initLayout:function(){
			this.$el.addClass("player");
			this.$el.append("<div><div class='player-score-icon icon score-icon' style='float:left' title='你的分数'/><label class='player-score' style='float:left' title='你的分数'/><div title='你的金钱' class='player-money-icon icon money-icon' style='float:left'/><label class='player-money' style='float:left' title='你的金钱' /></div><img class='player-profile' style='clear:both'/><label class='player-name'>");
			this.$(".player-profile").attr("src",require.resolve("../res/image/"+this.model.get("profile")+".jpg#"));
			this.$(".player-name").html(this.model.get("name")+"领主");
			this.$el.css({left:this.options.x, top:this.options.y, width:this.options.width,height:this.options.height, 'z-index':this.options.z,position:"absolute"});
		},
		render:function(){			
			this.$(".player-score").html(this.model.get("score"));
			this.$(".player-money").html(this.model.get("money"));
			return this;
		},
		onChangeScore: function(model){
			var score = model.get("score") - model.previous("score");
			Effect.poping(this.$(".player-score-icon").parent(), this.$(".player-score-icon").position().left,-Effect.POPING_WIDTH,"score-icon", score);
		},
		onChangeMoney: function(model){
			var money = model.get("money") - model.previous("money");
			Effect.poping(this.$(".player-money-icon").parent(), this.$(".player-money-icon").position().left,-Effect.POPING_WIDTH,"money-icon", money);
		}
	});

	exports.PlayerModel = Backbone.Model.extend({
		defaults : function(){
			return {
				money: 6,
				score: 0,
				basicScore : 0,
				name:"player1",
				side:"",
				profile:"",
			};
		},
		initialize: function(){
			this.total = {card:8,magic:0,monster:8,room:0,treasure:0};
			this.on("change:basicScore", this.reCalScore, this);
		},
		changeMoney : function(money) {
			if ( money < 0 && this.get("money") + money < 0) {
				this.changeScore( money + this.get("money") );
				this.set("money", 0 );
			} else {
				this.set("money", this.get("money") + money );
				this.total.earn += money;
			}
		},
		changeScore : function(score) {
			this.set("basicScore", this.get("basicScore") + score );
			this.reCalScore();
		},
		reCalScore: function(){
			this.total.card = this.total.magic = this.total.monster = this.total.room = this.total.treasure = 0;
			var score = this.get("basicScore");
			for ( var i = 0; i < this.deck.cards.length ; i++ ){
				this.total.card++;
				this.total[this.deck.cards.at(i).get("type")] ++;
				score += this.deck.cards.at(i).get("score");
			}
			for ( var i = 0; i < this.discardDeck.cards.length ; i++ ){
				this.total.card++;
				this.total[this.discardDeck.cards.at(i).get("type")] ++;
				score += this.discardDeck.cards.at(i).get("score");
			}
			for ( var i = 0; i < this.magicCardRow.cards.length ; i++ ){
				this.total.card++;
				this.total.magic ++;
				score += this.magicCardRow.cards[i].model.get("score");
			}
			for ( var i = 0; i < this.dungeonCardRow.cards.length ; i++ ){
				this.total.card++;
				this.total[this.dungeonCardRow.cards[i].model.get("type")] ++;
				score += this.dungeonCardRow.cards[i].model.get("score");
			}
			this.set("score", score);
		}
	});
});