define(function(require,exports,module){
	var Effect = require("./effect");
	var cardPackage = require("./card");
	var DUNGEON_CARD_WIDTH = 126;
	var DUNGEON_CARD_HEIGHT = 176;
	var DUNGEON_CARD_SPACING = 5;
	var DUNGEON_Y = 360;
	window.globalAnimating = 0;
	exports.AppView = Backbone.View.extend({
		events: {
			"click #start-next-turn":"startNextTurn",
			"dblclick .sprite.card":"showCardDetail",
			"click #wait-progress,#toggle-pause":"togglePause",
			"click #skip-time":"skipTime",
			"click #fast-forward":"fastForward",
			"click #add-card-control":"addDungeonCard",
			"click #help":"showHelp",
			"click #setting":"showSetting",
		},

		initialize : function(){
			this.initClass();
			this.initData();
			this.initStyle();
			this.initLayout();
			this.initSetting();
			this.initSound();
			this.initHelp();
		},
			
		initClass: function() {
			
			this.CardView = cardPackage.CardView;
			this.CardModel = cardPackage.CardModel;
			this.HeroCardModel = cardPackage.HeroCardModel;
			this.DungeonCardModel = cardPackage.DungeonCardModel;
			this.HeroCardView = cardPackage.HeroCardView;
			this.MonsterCardModel = cardPackage.MonsterCardModel;
			this.MagicCardModel = cardPackage.MagicCardModel;

			var deckPackage = require("./deck");
			this.DeckView = deckPackage.DeckView;
			this.DeckModel = deckPackage.DeckModel;
			this.HeroDeckView = deckPackage.HeroDeckView;
			this.DungeonDeckView = deckPackage.DungeonDeckView;
			

			var playerPackage = require("./player");
			this.PlayerModel = playerPackage.PlayerModel;
			this.PlayerView = playerPackage.PlayerView;

			var rowPackage = require("./row");
			this.Row = rowPackage.CardRow;

			var addCardPackage = require("./add-card-control");
			this.AddCardControl = addCardPackage.AddCardControl;

			var spritePackage = require("./sprite");
			this.SpriteModel = spritePackage.SpriteModel;

			var dungeonDiscardPackage = require("./dungeon-discard-deck");
			this.DungeonDiscardDeckView = dungeonDiscardPackage.DungeonDiscardDeckView;
		},
		initData: function() {
			this.setupGame();
		},
		initStyle: function() {
			require("../css/main.css");
		},
		initLayout: function() {
			//var cardView = new this.CardView({model:this.card});
			//this.$el.append(cardView.render().el);
			this.$el.append("<div id='tavern'></div>")
			this.$el.append(this.heroCardRow.render().el);			
			this.$el.append(this.dungeonCardRow.render().el);
			this.$el.append(this.magicCardRow.render().el);
			this.$el.append(this.buyableCardRow.render().el);
			this.magicCardRow.$el.css({"background":""});
			this.magicCardRow.$el.attr({"id":"magic-book",title:'你的魔法书'});

			this.heroDeckView = new this.HeroDeckView({model:this.heroDeck});
			this.$el.append(this.heroDeckView.render().el);
			
			this.heroDiscardDeckView = new this.DeckView({model:this.heroDiscardDeck});
			this.$el.append(this.heroDiscardDeckView.render().el);
			this.heroDeckView.setDiscardTo(this.heroDiscardDeckView);

			this.buyableDeckView = new this.DeckView({model:this.buyableDeck});
			this.$el.append(this.buyableDeckView.render().el);

			this.playerView = new this.PlayerView({x:10,y:555,width:100,height:140,model:this.player});
			this.$el.append(this.playerView.render().el);
			this.$el.append("<div id='setting' style='position:absolute;left:1210px;top:585px;width:48px;height:48px'/>");
			this.$el.append("<div id='help' style='position:absolute;left:1210px;top:655px;width:48px;height:48px'/>");

			this.dungeonDeckView = new this.DungeonDeckView({model:this.dungeonDeck});
			this.$el.append(this.dungeonDeckView.render().el);

			this.dungeonDiscardDeckView = new this.DungeonDiscardDeckView({model:this.dungeonDiscardDeck, player: this.playerView.model, deck:this.buyableDeckView});
			this.$el.append(this.dungeonDiscardDeckView.render().el);
			this.dungeonDeckView.setDiscardTo(this.dungeonDiscardDeckView, true);
			
			//this.buyableDiscardDeckView = new this.DeckView({model:this.buyableDiscardDeck});
			//this.$el.append(this.buyableDiscardDeckView.render().el);
			//this.buyableDeckView.setDiscardTo(this.buyableDiscardDeckView);

			this.$el.append("<button id='start-next-turn' style='position:absolute;left:10px;top:230px;width:130px;' class='ui-game-button'>新的英雄来了</button>");

			this.timeControl = $("<div id='time-control' style='position:absolute;left:10px;top:230px;width:182px;height:40px'/>");
			this.waitProgress = $("<div id='wait-progress' style='border-radius:10px;width:100px;height:40px;float:left'/>");
			this.waitProgress.progressbar({
				value: 0,
			});
			this.timeControl.hide();

			this.timeControl.append(this.waitProgress);
			this.timeControl.append("<div id='toggle-pause' class='pause' style='position:absolute;left:40px;top:10px;width:27px;height:27px;'/>");
			this.timeControl.append("<div id='skip-time' style='width:40px;height:40px;float:left'/>");
			this.timeControl.append("<div id='fast-forward' style='width:40px;height:40px;float:left'/>");
			this.$el.append(this.timeControl);
			this.on("timer-tick",function(){
				var value = this.waitProgress.progressbar("option","value");
				if ( value >= 100) {
					this.timeControl.hide();
					this.waitProgress.progressbar("option","value",this.waitProgress.fastforward?99:0);
					this.trigger("time-passed");
				} else
					this.waitProgress.progressbar("option","value",value+2);
			},this);

			this.addCardControl = new this.AddCardControl({model: new this.SpriteModel({cost:1, x:0, y:this.dungeonCardRow.y, width:DUNGEON_CARD_WIDTH, height :DUNGEON_CARD_HEIGHT})});
			this.$el.append(this.addCardControl.render().el);
			this.addCardControl.hide();

			this.on("time-passed",function(){
				this.stopTicking();
				this.heroAttack();
			},this);

			var self = this;
			var queue = [];
			for ( var i = 0; i < 3; i++){
				queue.push(function(){
					self.heroDeckView.drawCard(function(cardView){
						if ( !cardView ) {
							return;
						}
						self.$el.append(cardView.render().el);
						self.heroCardRow.add(cardView,function(){
							cardView.flip();							
						});
						self.$el.dequeue("__draw_hero_card__");
					});
				});
			}
			queue.push(function(){
					self.heroDeckView.model.shuffle();
			});
			this.$el.queue("__draw_hero_card__", queue);
			this.$el.dequeue("__draw_hero_card__");

			//var positions = [{x:435,y:10},{x:540,y:10},{x:645,y:10},{x:750,y:10},{x:855,y:10},{x:960,y:10},{x:1065,y:10},{x:1170,y:10}]
			var queue2 = [];
			for ( var i = 0; i < 8; i++){
				self.buyableDeckView.drawCard(function(cardView){
					if ( cardView ) {
						self.$el.append(cardView.render().el);
						self.buyableCardRow.add(cardView,function(){
							cardView.flip(function(){
								cardView.setBuyable();
								if ( cardView.$el.position().left < self.buyableCardRow.x+(self.buyableCardRow.unitWidth+self.buyableCardRow.unitSpacing)*2 ){
									cardView.saleoff();
								}
							});			
						});					
					}
				});
			}
		},

		initSound: function(){
			this.swordSound = [];
			for ( var i = 0; i < 4 ; i++){
				var url = require.resolve("../res/sound/swords-clashing"+i+".ogg#");
				this.swordSound[i] = new Audio(url);
			}

			this.cheerSound = [];
			for ( var i = 0; i < 4 ; i++){
				var url = require.resolve("../res/sound/cheer"+i+".ogg#");
				this.cheerSound[i] = new Audio(url);
			}

			this.stepSound = [];
			for ( var i = 0; i < 3 ; i++){
				var url = require.resolve("../res/sound/step"+i+".ogg#");
				this.stepSound[i] = new Audio(url);
			}

			this.painSound = [];
			for ( var i = 0; i < 3 ; i++){
				var url = require.resolve("../res/sound/pain"+i+".ogg#");
				this.painSound[i] = new Audio(url);
			}
			
			url = require.resolve("../res/sound/return.ogg#");
			this.returnSound = new Audio(url);

			url = require.resolve("../res/sound/fireball.ogg#");
			this.fireballSound = new Audio(url);

			url = require.resolve("../res/sound/cyclone.ogg#");
			this.cycloneSound = new Audio(url);

			url = require.resolve("../res/sound/lightening.ogg#");
			this.lighteningSound = new Audio(url);

			url = require.resolve("../res/sound/drum.ogg#");
			this.drumSound = new Audio(url);
		},

		isTicking : function(){
			return this.interval != null;
		},

		startTicking: function() {
			var self = this;
			if ( !this.interval ) {
				this.interval = setInterval(function(){
					self.trigger("timer-tick");
				},100);
			}
		},
		stopTicking:function() {
			if ( this.interval )
			{
				clearInterval(this.interval);
				this.interval = null;
			}
		},

		setupGame: function() {
			this.player = new this.PlayerModel({name:this.options.playerName || "player1", profile:this.options.playerProfile||"lord0"});

			this.heroCardRow = new this.Row({x:5,y:10,height:140,width:310,unitHeight:140,unitWidth:100,unitSpacing:5,name:"hero-card-row"});
			this.heroDeck = new this.DeckModel({x:321,y:10,width:42,height:53,name:"hero-deck", description:"英雄牌堆",side:"back"});
			this.heroDiscardDeck = new this.DeckModel({x:320,y:85,width:42,height:53,name:"hero-discard-deck", description:"英雄弃牌堆",side:"front", isDiscard:true});

			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.BraverCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.AmazonCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.ClericCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.DarksideCardModel({side:"back"}));			
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.MonkCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.NinjaCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.PaladinCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.TraderCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.ThiefCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.WarriorCardModel({side:"back"}));
			for ( var i = 0; i < 3 ; i++)
				this.heroDeck.cards.add(new cardPackage.WizardCardModel({side:"back"}));

			this.dungeonCardRow = new this.Row({x:10,y:DUNGEON_Y,height:DUNGEON_CARD_HEIGHT,width:1150, unitHeight:DUNGEON_CARD_HEIGHT,unitWidth:DUNGEON_CARD_WIDTH,unitSpacing:DUNGEON_CARD_SPACING,limit:true, name:"dungeon-card-row", addClass:"in-dungeon",autoShift:false});
			this.magicCardRow = new this.Row({x:350,y:545,height:DUNGEON_CARD_HEIGHT*0.9,width:880, unitHeight:DUNGEON_CARD_HEIGHT*0.9,unitWidth:DUNGEON_CARD_WIDTH*0.9,unitSpacing:DUNGEON_CARD_SPACING, limit:true, name:"magic-card-row"});
			this.dungeonDeck = new this.DeckModel({x:120,y:555,width:100,height:140,name:"dungeon-deck", description:"你的地城牌堆",side:"back"});
			this.dungeonDiscardDeck = new this.DeckModel({x:230,y:555,width:100,height:140,name:"dungeon-discard-deck", description:"你的地城弃牌堆",side:"front", isDiscard:true});
			
			for ( var i = 0; i < 4 ; i++)
				this.dungeonDeck.cards.add(new cardPackage.RatmanCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.dungeonDeck.cards.add(new cardPackage.SkeletonCardModel({side:"back"}));

			this.buyableDeck = new this.DeckModel({x:1220,y:10,width:42,height:53,name:"buyable-deck", description:"地城牌堆",side:"back"});
			this.buyableDiscardDeck = new this.DeckModel({x:573,y:10,width:63,height:88,name:"buyable-discard-deck", description:"地城弃牌堆",side:"front", isDiscard:true});

			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.CycloneCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.DrumCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.FireBallCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.MagicMissleCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.MeldCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.LighteningCardModel({side:"back"}));
			
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.DragonCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.FireElementCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.GaintGolemCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.GhostCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.LichCardModel({side:"back"}));
			for ( var i = 0; i < 8 ; i++)
				this.buyableDeck.cards.add(new cardPackage.LizardmanCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.MedusaCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.MinotaurCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.OozeCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.OrcBanditCardModel({side:"back"}));
			for ( var i = 0; i < 8 ; i++)
				this.buyableDeck.cards.add(new cardPackage.OrcMinerCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.OrcWarlordCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.RatmanDiggingCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.SpiderCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.TitanCardModel({side:"back"}));	

			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.BlacksmithCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.ShopCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.RollingBoulderCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.ArrowTrapCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.PitfallCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.PoisionTrapCardModel({side:"back"}));
			for ( var i = 0; i < 4 ; i++)
				this.buyableDeck.cards.add(new cardPackage.MazeEntryCardModel({side:"back"}));
			
			this.dungeonDeck.shuffle();

			this.buyableDeck.shuffle();
			
			this.buyableCardRow = new this.Row({x:380,y:10,height:140,width:835,unitHeight:140, unitWidth:100,unitSpacing:5,name:"buyable-card-row",autoShift:false});

			this.player.deck = this.dungeonDeck;
			this.player.discardDeck = this.dungeonDiscardDeck;
			this.player.magicCardRow = this.magicCardRow;
			this.player.dungeonCardRow = this.dungeonCardRow;
			this.player.reCalScore();

			this.dungeonCardRow.on("rearrange",function(){
				this.addCardControl.model.set({"x": this.dungeonCardRow.getLastPosition().left});
				if ( this.currentHeroCard ){
					this.currentHeroCard.moveTo(this.dungeonCardRow.getPosition(this.dungeonLevel).left, DUNGEON_Y-200);
				}
			},this);
		},

		showCardDetail:function(event){
			if ( this.showingDetail || window.globalAnimating ) {
				return;
			}
			var ticking = this.isTicking();
			this.detailMask = $("<div class='detail-mask' style='width:100%;height:100%;background:black;opacity:0.1;z-index:998;'/>");
			this.$el.append(this.detailMask);
			this.showingDetail = true;
			this.stopTicking();
			var cardView = $(event.currentTarget).data("view");
			var x = cardView.model.get("x");
			var y = cardView.model.get("y");
			var w = cardView.model.get("width");
			var h = cardView.model.get("height");
			cardView.model.set({z:999});
			this.detailMask.animate({opacity:0.7},250);
			var p = cardView.$el.parent();
			if ( p.hasClass("main-game") ) {
				cardView.moveAndResizeTo(388,6,504,704,250,function(){
				});
			} else {
				cardView.moveAndResizeTo(388-p.position().left,6-p.position().top,504,704,250,function(){
				});
			}
			
			var handler = function(event){
				var self = event.data.context;
				self.detailMask.animate({opacity:0.1},250);
				cardView.moveAndResizeTo(x,y,w,h,250,function(){
					self.detailMask.remove();
					cardView.model.set({z:"auto"});
					self.showingDetail = false;
					if ( ticking )
						self.startTicking();
				});
			};
			this.detailMask.on("click",{context:this},handler);
		},

		addDungeonCard: function() {
			var self = this;			
			if ( (this.playerView.model.get("money") >= this.addCardControl.model.get("cost")) && this.canDrawDungeonCard() ){
				this.stopTicking();
				this.playerView.model.set("money", this.playerView.model.get("money") - this.addCardControl.model.get("cost"));
				this.addCardControl.model.set("cost", this.addCardControl.model.get("cost")+1);
				this.drawDungeonCard(function(){
					if ( self.$("#toggle-pause").hasClass("pause") ){
						self.startTicking();
					}
				});
			}
		},

		canDrawDungeonCard: function(){
			return ( this.dungeonDeckView.canDrawCard() || this.dungeonDiscardDeckView.canDrawCard());
		},

		drawDungeonCard: function(callback, notInSequence){
			var self = this;
			self.addCardControl.hide();
			this.dungeonDeckView.drawCard(function(cardView){
				if ( cardView )	{					
					self.$el.append(cardView.render().el);
					self.dungeonCardRow.add(cardView,function(view){
						view.flip(function(){
							self.addCardControl.show();
							if ( view.model.get("type") == "magic")	{
								self.dungeonCardRow.removeView(view);
								self.magicCardRow.add(view,function(){
									view.setUsable();
									if ( callback )	{
										callback.apply();
									}
									view.row = self.magicCardRow;
									if ( !notInSequence )
										self.$el.dequeue("__draw_dungeon_card__");
								});
							} else {
								if ( view.model.onReveal ) {
									var condition = {
										player : self.playerView.model,
										game : self,
										dungeonRow : self.dungeonCardRow,
									};
									view.model.onReveal(condition);
								}
								if ( callback )	{									
									callback.apply();
								}
								if ( !notInSequence )
									self.$el.dequeue("__draw_dungeon_card__");
							}							
						});
					}, cardView);
				} else {
					if ( !notInSequence )
						self.$el.dequeue("__draw_dungeon_card__");
				}
			});
			
		},

		startNextTurn: function(event) {
			this.$("#start-next-turn").hide();
			var self = this;
			this.dungeonLevel = 0;
			var queue = [];
			for ( var i = 0; i < 4; i++){
				queue.push(function(){
					self.drawDungeonCard();
				});
			}
			queue.push(function(){
				self.currentHeroCard = self.heroCardRow.shift(function(){
					self.heroDeckView.drawCard(function(cardView){
						if ( cardView )	{
							self.$el.append(cardView.render().el);
							self.heroCardRow.add(cardView,function(){
								cardView.flip();
							});
						}
					});
				});
				if ( !self.currentHeroCard ){
					
				} else {
					self.currentHeroCard.moveAndResizeTo(self.dungeonCardRow.get(0).$el.position().left,DUNGEON_Y-200,DUNGEON_CARD_WIDTH,DUNGEON_CARD_HEIGHT,null,function(){
						self.currentHeroCard.active();
						self.currentHeroCard.model.on("change:hp",self.checkHeroHp,self);
						if (self.currentHeroCard.model.onEnter){
							self.currentHeroCard.model.onEnter({game:window.game,player:self.player});
						}
						self.$el.dequeue("__draw_dungeon_card__");
					});
					if ( self.setting.sound )
						self.stepSound[Math.floor(self.stepSound.length*Math.random())].play();
					self.currentHeroCard.model.on("change:x",self.followHero,self);
				}
			});
			queue.push(function(){
				self.startTicking();
				self.waitProgress.progressbar("option","value",0);
				self.waitProgress.fastforward = false;
				self.timeControl.css({left: self.currentHeroCard.model.get("x")+140});
				self.timeControl.show();
			});
			this.$el.queue("__draw_dungeon_card__", queue);
			this.$el.dequeue("__draw_dungeon_card__");


		},		
		followHero: function(model){
			if ( model.get("width")>500 )
				return;
			if (model.get("x") + 140 + 185 > 1270){
					this.timeControl.css({left:model.get("x")-185});
			} else {
				this.timeControl.animate({left:model.get("x")+140},{queue:true});
			}			
		},
		togglePause: function() {
			if ( this.interval ) {
				this.$("#toggle-pause").addClass("resume").removeClass("pause");
				this.stopTicking();
				this.waitProgress.fastforward = false;
			} else {
				this.$("#toggle-pause").addClass("pause").removeClass("resume");
				this.startTicking();
			}
		},
		skipTime: function(){
			this.waitProgress.progressbar("option","value",99);
			this.startTicking();
		},
		fastForward: function(){
			this.waitProgress.fastforward = true;
			this.skipTime();
		},
		heroAttack : function(){
			//this.dungeonCardRow.showSort();
			this.addCardControl.hide();
			var self = this;
			var condition = {hero: this.currentHeroCard.model,player : this.playerView.model};
			if ( this.dungeonCardRow.cards.length <= this.dungeonLevel ) {
				if ( this.currentHeroCard.model.onReturn )
					this.currentHeroCard.model.onReturn(condition);
				
				this.currentHeroCard.discard(function(){
					Effect.poping(self.$el, self.heroDiscardDeckView.$el.position().left,self.heroDiscardDeckView.$el.position().top,"beer-icon", "");
					self.turnEnd();
				});
				if ( this.setting.sound )
					this.returnSound.play();
				return;
			}
			var cardView = this.dungeonCardRow.get(this.dungeonLevel);
			condition.monster = cardView.model;

			if ( cardView.model.get("type") == "monster"){
				if ( this.currentHeroCard.model.beforeAttackMonster)	{
					this.currentHeroCard.model.beforeAttackMonster(condition);
				}
				if ( cardView.model.beforeAttackHero ){
					cardView.model.beforeAttackHero(condition);
				}
				this.currentHeroCard.attack("down");
				cardView.attack("up",function(){					
					if ( cardView.model.getDamage )	{
						var damage = cardView.model.getDamage(condition);
						condition.damage = damage;
						this.currentHeroCard.model.takeDamage(condition);
					} else {
						var defend = this.currentHeroCard.model.getDefend(condition);
						var attack = cardView.model.getAttack(condition);
						if ( attack > defend ) {
							condition.damage = attack-defend;
							this.currentHeroCard.model.takeDamage(condition);
						}
					}
					if ( this.currentHeroCard.model.afterAttackMonster)	{
						this.currentHeroCard.model.afterAttackMonster(condition);
					}
					if ( cardView.model.afterAttackHero ){
						cardView.model.afterAttackHero(condition);
					}
					this.heroMoveToNext();
				},this);
				
				if ( this.setting.sound )
					this.swordSound[Math.floor(this.swordSound.length*Math.random())].play();
			} else if ( cardView.model.get("type") == "treasure"){
				if ( this.setting.sound )
					this.cheerSound[Math.floor(this.cheerSound.length*Math.random())].play();
				this.currentHeroCard.attack("down", function(){
					if ( cardView.model.onHeroPassBy ) {					
						cardView.model.onHeroPassBy(condition);
					}
					if ( this.currentHeroCard.model.afterPassTreasure)	{
						this.currentHeroCard.model.afterPassTreasure(condition);
					}
					this.heroMoveToNext();
					
				},this);				
			} else if ( cardView.model.get("type") == "room"){
				if ( this.setting.sound )
					this.stepSound[Math.floor(this.stepSound.length*Math.random())].play();
				this.currentHeroCard.attack("down", function(){
					if ( cardView.model.onHeroPassBy ) {						
						cardView.model.onHeroPassBy(condition);
					}
					this.heroMoveToNext();					
				},this);	
			}
		},

		checkHeroHp: function(model){
			if ( model.get("hp") <= 0 )	{
				//change to treasure;
				this.stopTicking();				
				this.hero2treasure(this.turnEnd, this);
			}
		},

		heroMoveToNext: function(){
			if ( this.currentHeroCard.model.get("hp") <= 0)
				return;
			var self = this;
			
			var y = DUNGEON_Y-200;
			var self = this;
			var condition = {player:this.player, game:window.game};
			if ( this.setting.sound )
				this.stepSound[Math.floor(this.stepSound.length*Math.random())].play();
			if ( this.currentHeroCard.model.get("status").slow && this.currentHeroCard.model.get("status").slow1){
				this.currentHeroCard.model.removeStatus("slow");
				self.addCardControl.show();
				self.timeControl.show();
				self.$("#toggle-pause").addClass("pause").removeClass("resume");
				self.startTicking();
				if ( this.currentHeroCard.model.onMove ) {
					this.currentHeroCard.model.onMove(condition);
				}
			} else {
				if ( this.currentHeroCard.model.get("status").slow ) {
					this.currentHeroCard.model.get("status").slow1 = true;
				}
				setTimeout(function(){
					if ( self.currentHeroCard.model.onMove ) {
						self.currentHeroCard.model.onMove(condition);
					}
				},200);
				this.currentHeroCard.moveTo(self.dungeonCardRow.getPosition(this.dungeonLevel + 1).left,y,500,function(){
					self.dungeonLevel ++;
					self.addCardControl.show();
					self.timeControl.show();
					self.$("#toggle-pause").addClass("pause").removeClass("resume");
					self.startTicking();
				});
			}
		},

		heroFlashToNext:function(){
			var self = this;
			this.stopTicking();
			this.addCardControl.hide();
			this.timeControl.show();
			var newx = this.dungeonCardRow.getPosition(this.dungeonLevel + 1).left;
			this.currentHeroCard.$el.animate({top:this.currentHeroCard.$el.position().top-30, opacity:0},{complete:function(){
				self.currentHeroCard.$el.css({"left":newx});
			}}).animate({top:this.currentHeroCard.$el.position().top+30, opacity:1},{queue:true, complete:function(){
				self.waitProgress.progressbar("option","value",0);
				self.currentHeroCard.model.set({x:newx});
				self.dungeonLevel ++;
				self.addCardControl.show();
				self.timeControl.show();
				if ( self.$("#toggle-pause").hasClass("pause") ){
					self.startTicking();
				}
			}});
		},
		turnEnd: function(){
			var self = this;			
			this.addCardControl.hide();
			this.addCardControl.model.set("cost", 1);
			this.currentHeroCard.deactive();
			this.currentHeroCard.model.off("change:x", this.followHero, this);
			this.currentHeroCard = null;
			this.timeControl.hide();
			this.stopTicking();

			var tobeRemove = [];
			for ( var i = 0; i < 4; i++ ){
				var v = this.buyableCardRow.cards[i];
				if ( v && v.$el.position().left < this.buyableCardRow.x + 4*(this.buyableCardRow.unitWidth+this.buyableCardRow.unitSpacing) ) {
					if ( v.$el.hasClass("saleoff") ) {
						tobeRemove.push(v);
					} else {
						v.saleoff();
					}
				}
			}
			for (var i = 0; i < tobeRemove.length; i++){
				var v = tobeRemove[i];
				this.buyableCardRow.removeView(v);
				v.removeFromGame();
			}
			setTimeout(function(){
				self.buyableCardRow.shiftToEnd(function(){
					for ( var i = self.buyableCardRow.cards.length; i < 8; i++){
						self.buyableDeckView.drawCard(function(cardView){
							if ( cardView ) {
								self.$el.append(cardView.render().el);
								self.buyableCardRow.add(cardView,function(){
									cardView.flip(function(){
										cardView.setBuyable();
									});							
								});					
							}
						});
					}
					
				});
			},800);
			this.dungeonCardRow.discard(function(){
				setTimeout(function(){
					self.player.reCalScore();
				},100);
				if ( self.heroCardRow.cards.length == 0 ){
					self.gameOver();
				} else
					self.$("#start-next-turn").show();
			});
		},
		hero2treasure: function(callback, context){
			if ( this.setting.sound )
				this.painSound[Math.floor(this.painSound.length*Math.random())].play();
			if ( this.currentHeroCard.model.get("status").curse ){
				var x = this.currentHeroCard.model.get("x");
				var y = this.currentHeroCard.model.get("y");
				var  model2 = new cardPackage.ZombieCardModel({
					x:x,
					y:y,
					width:this.currentHeroCard.model.get("width"),
					height:this.currentHeroCard.model.get("height"),
					side: "front",
				});
				var view2 = new cardPackage[model2.get("cardViewClass")]({model:model2, discardTo: this.dungeonDiscardDeckView});
				this.$el.append(view2.render().el);
				view2.$el.css("z-index",11);
				
				view2.$el.animate({left:(x > 1000? x - 140 : x + 140)}, {duration:800, complete:function(){
					view2.discard();
				}});
			}
			var treasureView = null;
			if ( this.currentHeroCard.model.get("treasureCardModelModel") ){
				var model = new cardPackage[this.currentHeroCard.model.get("treasureCardModelModel")]({
					x:this.currentHeroCard.model.get("x"),
					y:this.currentHeroCard.model.get("y"),
					width:this.currentHeroCard.model.get("width"),
					height:this.currentHeroCard.model.get("height"),
					side: "front",
				});
				treasureView = new cardPackage[model.get("cardViewClass")]({model:model, discardTo: this.dungeonDiscardDeckView});
				this.$el.append(treasureView.render().el);
				treasureView.$el.css("z-index",10);
			}
			if ( this.currentHeroCard.model.onDie )	{
				this.currentHeroCard.model.onDie({game:window.game, player:this.player});
			}
			this.currentHeroCard.$el.css("z-index",11);			
			var self = this;
			this.currentHeroCard.$el.hide("explode",{}, 500, function(){
				if (treasureView){
					treasureView.discard(function(){
						if ( callback){
							callback.apply(context);
						}
					});
					self.currentHeroCard.model.off("change:hp",self.checkHeroHp,self);
					self.currentHeroCard.model.off("change:x",self.followHero,self);
					self.currentHeroCard.model.destroy();
				} else {
					self.currentHeroCard.model.off("change:hp",self.checkHeroHp,self);
					self.currentHeroCard.model.off("change:x",self.followHero,self);
					self.currentHeroCard.model.destroy();
					if ( callback){
						callback.apply(context);
					}
				}				
			});	
		},
		gameOver : function(){
			var self = this;
			setTimeout(function(){
				var ScoreBoard = require("./score-board").ScoreBoard;
				var view = new ScoreBoard({player:self.player});
				self.$el.append(view.render().el);
			},1000);
		},
		initHelp : function(){
			var self = this;
			var help_template = _.template("<div id='help-dialog' style='position:absolute;left:0;top:0;width:1280px;height:720px;background:darkgrey;z-index:999;'>"
+"	<div class='slider-wrapper theme-default' style='position:absolute;left:100px;top:25px;width:1080px;height:607px;box-shadow:0 0 25px black'>"
+"		<div id='help-slider' class='nivoSlider'>"
+"			<img src='module/main/res/image/help1.jpg' alt='' />"
+"			<img src='module/main/res/image/help2.jpg' alt='' />"
+"		</div>"
+"	</div>"
+"	<div id='close-help' style='position:absolute;left:0;top:0;width:64px;height:64px;background-image:url(\"module/main/res/image/exit.png\");'></div>"
+"	<div style='position:absolute;left:40%;bottom:0'>"
+"		<input id='show-help-check' type='checkbox' style='height: 20px; width: 30px;'/><label style='font-size: 20px;'>启动时显示帮助</label>"
+"	</div>"
+"</div>");
			this.helpDialog = $(help_template());
			this.$el.append(this.helpDialog);
			
			this.$("#show-help-check").on("change",function(event){
				self.setting.showHelp = $(event.currentTarget).is(":checked");
				localStorage.setItem("setting",JSON.stringify(self.setting));
			});
			this.$('#help-slider').nivoSlider({
				startSlide: 0,
				pauseOnHover: true,
				controlNavThumbs: false,
				manualAdvance: true,
			});			
			if ( this.setting.showHelp ){
				this.showHelp();
			} else {
				this.helpDialog.hide();
			}
			this.$("#close-help").on("click",function(event){
				if ( self.$("#toggle-pause").hasClass("pause") )
					self.startTicking();
				self.helpDialog.hide();
			});
		},
		showHelp : function(){
			this.stopTicking();
			this.helpDialog.show();
			if ( this.setting.showHelp ){
				this.helpDialog.find("#show-help-check").attr("checked","checked");
			} else
				this.helpDialog.find("#show-help-check").removeAttr("checked");
			
		},
		loadSetting: function(){
			var store = localStorage.getItem("setting");
			if ( !store ){
				this.setting = {sound:true, showHelp:true};
			} else this.setting = JSON.parse(store);
		},
		initSetting: function(){
			this.loadSetting();
			this.$el.append("<div id='setting-dialog' title='设置' style='width:100%;height:100%;font-size:18px;text-shadow:none;'><div style='width:100%;height:100%;z-index:999;background:black;opacity:0.7;'></div><div style='position:absolute;left:550px;top:320px;width:180px;height:80px;border:2px solid blue'><label style='width:100%;text-align:center;display: block;color:white'>设置</label><input id='sound-check' type='checkbox'/><label style='color:white'>音效</label><br/><button id='close-setting' style='width:100%'>确定</button></div></div>");
			this.$("#setting-dialog").hide();
			var self = this;
			this.$("#sound-check").on("change",function(event){
				self.setting.sound = $(event.currentTarget).is(":checked");
				localStorage.setItem("setting",JSON.stringify(self.setting));
			});
			this.$("#close-setting").on("click",function(event){
				self.$("#setting-dialog").hide();
				if ( self.$("#toggle-pause").hasClass("pause") )
					self.startTicking();
			});
		},
		showSetting: function(){
			this.stopTicking();
			this.$("#setting-dialog").show();
			if ( this.setting.sound ){
				this.$("#sound-check").attr("checked","checked");
			} else
				this.$("#sound-check").removeAttr("checked");
		},
	});
});
