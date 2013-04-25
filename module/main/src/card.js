define(function(require,exports,module){
	var Sprite = require("./Sprite");
	var Effect = require("./effect");
	var FLIP_TIME = 400;
	var ATTACK_TIME = 200;
	var ATTACK_LENGTH = 15;
	var STATUS = {
		"poison":"中毒（每经过一张牌-1生命）",
		"curse":"诅咒（死亡时变成僵尸）",
		"slow":"减速（下一张牌结算两次）",
	};
	exports.CardModel = Sprite.SpriteModel.extend ({
		defaults: function() {
			var opt = Sprite.SpriteModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name : "",
				front : "",
				back : "",
				side : "front",//back
				tap : false,
				order: 0,
				cardViewClass: "CardView",
			});
		},
		initialize: function(){
			this.origin = this.toJSON();
		},
	});

	exports.CardCollection = Backbone.Collection.extend({
		model: exports.CardModel,
		comparator: function(model){
			return model.get("order");
		}
	});

	exports.HeroCardModel = exports.CardModel.extend ({
		defaults: function() {
			var opt = exports.CardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				back : "hero-back",
				hp : 1,
				defend: 0,
				goal : 0,
				goalScore : 0,
				ability : {},
				treasureCardModelModel: "",
				cardViewClass: "HeroCardView",
				equipments: [],
				status: {},
				protect: {},
				stolen: 0,
			});
		},
		getDefend: function(condition){
			return this.get("defend");
		},
		takeDamage: function(condition){
			for ( var i=0; i < this.get("equipments").length ; i++)	{
				var e = this.get("equipments")[i];
				if ( e.beforeTakeDamage )	{
					e.beforeTakeDamage(condition);
				}
			}
			if ( condition.damage > 0 && condition.monster && condition.monster.onHitHero ){
				condition.monster.onHitHero(condition);
			}
			var hp = this.get("hp");
			this.set("hp",condition.damage <= hp ? hp-condition.damage : 0);
		},
		recoverHp: function(amount, condition){
			this.set("hp", (this.get("hp") + amount > this.origin.hp ? this.origin.hp : (this.get("hp") + amount)));
		},
		addDefend: function(amount, condition){
			this.set("defend", this.get("defend") + amount);
		},
		loseDefend: function(amount, condition){
			this.set("defend", (amount > this.get("defend") ? 0: (this.get("defend") - amount)));
		},
		onReturn: function(condition){
			condition.player.changeScore(Math.floor(this.get("goal")*this.get("goalScore")));
			condition.player.changeMoney(1);
		},
		onMove:function(condition){
			for ( var i=0; i < this.get("equipments").length ; i++)	{
				var e = this.get("equipments")[i];
				if ( e.onMove )	{
					e.onMove(condition);
				}
			}
			if ( this.get("status").poison )
				this.takeDamage({damage:1});
		},
		beforeAttackMonster: function(condition){
			for ( var i=0; i < this.get("equipments").length ; i++)	{
				var e = this.get("equipments")[i];
				if ( e.beforeAttackMonster )	{
					e.beforeAttackMonster(condition);
				}
			}
		},
		afterAttackMonster: function(condition){
			for ( var i=0; i < this.get("equipments").length ; i++)	{
				var e = this.get("equipments")[i];
				if ( e.afterAttackMonster )	{
					e.afterAttackMonster(condition);
				}
			}
		},
		getStatus : function(status,condition){
			if ( this.get("protect").status || this.get("protect")[status] )
				return;
			this.get("status")[status] = true;
			this.trigger("change:status", this);
		},
		removeStatus : function(status,condition){
			delete this.get("status")[status];
			if ( status == "slow" )	{
				delete this.get("status").slow1;
			}
			this.trigger("change:status", this);
		},
		clearStatus : function(status,condition){
			this.set("status", {});
		},
		onDie: function(condition){
			condition.player.changeMoney(this.get("stolen"));
		},
	});

	exports.AmazonCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "ShortBowCardModel",
				name:"amazon",
				front:"hero-amazon",
				hp:3,
				defend:0,
				goalScore:0,
				used:false
			});
		},
		beforeAttackMonster: function(condition){
			exports.HeroCardModel.prototype.beforeAttackMonster.call(this, condition);
			if ( !this.get("used") ) {
				condition.monster.set("attack",0);
				this.set("used", true);
			}
		},
	});
	exports.BraverCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "PotionCardModel",
				name:"braver",
				front:"hero-braver",
				hp:3,
				defend:0
			});
		},
	});
	exports.ClericCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "ElixirCardModel",
				name:"cleric",
				front:"hero-cleric",
				hp:4,
				defend:0,
				goalScore:0,//1
			});
		},
		/*afterAttackMonster: function(condition){
			exports.HeroCardModel.prototype.afterAttackMonster.call(this, condition);
			if ( condition.monster.get("subtype") == "undead") {
				this.set("goal",this.get("goal")+1);
			}
		}*/
	});
	exports.DarksideCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "DarksideBetrayCardModel",
				name:"darkside",
				front:"hero-darkside",
				hp:5,
				defend:0,
				protect:{curse:true}
			});
		},
	});
	exports.MonkCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "AmuletCardModel",
				name:"monk",
				front:"hero-monk",
				hp:4,
				defend:1,
				goalScore:0,
				protect:{status:true},
			});
		},
	});
	exports.NinjaCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "TrapGemCardModel",
				name:"ninja",
				front:"hero-ninja",
				hp:6,
				defend:1,
				goalScore:0,
				protect:{trap:true},
			});
		},
	});
	exports.PaladinCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "ArmorCardModel",
				name:"paladin",
				front:"hero-paladin",
				hp:7,
				defend:3,
				goalScore:1,
			});
		},
	});
	exports.TraderCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: null,
				name:"trader",
				front:"hero-trader",
				hp:6,
				defend:0,
				goalScore:0,
				protect:{shop:true},
				stolen: 9
			});
		},
		onEnter: function(condition){
			for ( var i = 0; i < condition.game.buyableCardRow.cards.length; i++ ){
				var v = condition.game.buyableCardRow.cards[i];
				v.model.set("cost",v.model.get("cost")+1);
			}
		},
	});
	exports.ThiefCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "DaggerCardModel",
				name:"thief",
				front:"hero-thief",
				hp:5,
				defend:0,
				goalScore:0,
				protect:{shop:true}
			});
		},
		onMove: function(condition){
			exports.HeroCardModel.prototype.onMove.call(this,condition);
			if ( condition.player.get("money")>0 ){
				condition.player.changeMoney(-1);
				this.set("stolen",this.get("stolen")+1);
			}
		}
	});
	exports.WarriorCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "HelmetCardModel",
				name:"warrior",
				front:"hero-warrior",
				hp:3,
				defend:1,
				goalScore:0,//0.5
			});
		},
		/*afterAttackMonster: function(condition){
			exports.HeroCardModel.prototype.afterAttackMonster.call(this, condition);
			this.set("goal",this.get("goal")+1);
		}*/
	});
	exports.WizardCardModel = exports.HeroCardModel.extend ({
		defaults: function() {
			var opt = exports.HeroCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				treasureCardModelModel: "StaffCardModel",
				name:"wizard",
				front:"hero-wizard",
				hp:3,
				defend:2,
				goalScore:0,
			});
		},
		takeDamage: function(condition){
			if (condition.magic)
				condition.damage = 0;
			exports.HeroCardModel.prototype.takeDamage.call(this,condition);
		},
		
	});

	exports.DungeonCardModel = exports.CardModel.extend ({
		defaults: function() {
			var opt = exports.CardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				back : "dungeon-back",
				type : "monster",//magic
				score: 0,
				cardViewClass: "DungeonCardView",
			});
		}
	});

	exports.MonsterCardModel = exports.DungeonCardModel.extend ({
		defaults: function() {
			var opt = exports.DungeonCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				basicAttack : 0,
				attack : 0,
				cost : 0,
				cardViewClass: "MonsterCardView",
				type:"monster",
				buff:0,
			});
		},
		initialize:function(){
			this.set("basicAttack",this.get("attack"));
			exports.DungeonCardModel.prototype.initialize.apply(this);
			this.on("change:buff change:basicAttack", function(){
				this.set("attack", this.get("basicAttack") + this.get("buff"));
			},this);
		},
		getAttack: function(condition){
			return this.get("attack");
		},
		addAttack: function(amount, condition){
			this.set("buff",this.get("buff")+1);
		}
	});

	exports.RoomCardModel = exports.DungeonCardModel.extend ({
		defaults: function() {
			var opt = exports.DungeonCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 0,
				cost : 0,
				cardViewClass: "RoomCardView",
				type:"room"
			});
		},
		getAttack: function(condition){
			return this.get("attack");
		},
		onReveal: function(condition){
			condition.player.changeMoney(-this.get("maintenance"));
		}
	});

	exports.DarksideBetrayCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"darkside",
				front:"monster-darkside",
				attack:3,
				cost:0,
				score:5,
				subtype:"human"
			});
		},
	});
	exports.DragonCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"dragon",
				front:"monster-dragon",
				attack:8,
				cost:11,
				score:4,
				subtype:"dragon"
			});
		},
	});
	exports.FireElementCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"fire element",
				front:"monster-fire-element",
				attack:3,
				cost:4,
				score:0,
				subtype:"element",
				cardViewClass: "FireElementCardView",
			});
		},
	});
	exports.GaintGolemCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"gaint golem",
				front:"monster-gaint-golem",
				attack:4,
				cost:6,
				score:2,
				subtype:"golem"
			});
		},
		onReveal: function(condition){
			condition.game.dungeonDiscardDeckView.flipDown();
			var oldx = condition.game.dungeonDiscardDeckView.model.get("x");
			var oldy = condition.game.dungeonDiscardDeckView.model.get("y");
			var self = this;
			condition.game.dungeonDiscardDeckView.moveTo(condition.game.dungeonDeckView.model.get("x"),condition.game.dungeonDeckView.model.get("y"), null, function(){
				condition.game.dungeonDeckView.model.cards.add(condition.game.dungeonDiscardDeckView.model.cards.models);
				condition.game.dungeonDeckView.model.shuffle();
				condition.game.dungeonDiscardDeckView.model.set({x:oldx,y:oldy});
				condition.game.dungeonDiscardDeckView.model.cards.reset();				
			});
		}
	});
	exports.GhostCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"ghost",
				front:"monster-ghost",
				attack:1,
				cost:2,
				score:1,
				subtype:"undead"
			});
		},
		getDamage: function(condition){
			return this.get("attack");
		}
	});
	exports.LichCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"lich",
				front:"monster-lich",
				attack:4,
				cost:6,
				score:2,
				subtype:"undead"
			});
		},
		onHitHero: function(condition){
			condition.hero.getStatus("curse",condition);
		}
	});
	exports.LizardmanCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"lizardman",
				front:"monster-lizardman",
				attack:0,
				cost:3,
				score:0,
				subtype:"beast"
			});
		},
		onReveal: function(condition){
			condition.player.changeMoney(2,condition);
		}
	});
	exports.MedusaCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"medusa",
				front:"monster-medusa",
				attack:2,
				cost:4,
				score:2,
				subtype:"female"
			});
		},
		afterAttackHero: function(condition){
			condition.hero.getStatus("slow",condition);
		}
	});
	exports.MinotaurCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"minotuar",
				front:"monster-minotaur",
				attack:"*",
				cost:5,
				score:2,
				subtype:"beast"
			});
		},
		initialize: function(){
			exports.MonsterCardModel.prototype.initialize.apply(this);
			this.on("change:row", function(model){
				if ( model.get("row") != null && model.get("row").options.name == "dungeon-card-row" )	{
					var i = 0;
					for ( ; i < model.get("row").cards.length ; i++ ){
						if ( model.get("row").cards[i].model == model ){
							break;
						}
					}
					if ( i < model.get("row").cards.length ){
						this.set("basicAttack", i + 1);
					}
				} else {
					this.set("basicAttack","*");
				}
			});
		}
	});
	exports.OozeCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"ooze",
				front:"monster-ooze",
				attack:1,
				cost:2,
				score:1,
				subtype:"ooze"
			});
		},
		afterAttackHero: function(condition){
			condition.hero.loseDefend(1,condition);
		}
	});
	exports.OrcBanditCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"orc bandit",
				front:"monster-orc-bandit",
				attack:2,
				cost:5,
				score:2,
				subtype:"orc"
			});
		},
		onHitHero: function(condition){
			condition.player.changeMoney(3,condition);
		}
	});
	exports.OrcMinerCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"orc miner",
				front:"monster-orc-miner",
				attack:1,
				cost:6,
				score:0,
				subtype:"orc"
			});
		},
		onReveal: function(condition){
			condition.player.changeMoney(3,condition);
		}
	});
	exports.OrcWarlordCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"orc warlord",
				front:"monster-orc-warlord",
				attack:2,
				cost:4,
				score:1,
				subtype:"orc"
			});
		},
		onReveal: function(condition){
			for ( var i = 0; i < condition.dungeonRow.cards.length-1; i++){
				var cardModel = condition.dungeonRow.cards[i].model;
				if (cardModel.get("type") == "monster")	{
					cardModel.addAttack(1,condition);
				}
			}
		}
	});
	exports.RatmanCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"ratman",
				front:"monster-ratman",
				attack:0,
				cost:0,
				score:0,
				subtype:"beast"
			});
		},
		onReveal: function(condition){
			condition.player.changeMoney(1,condition);
		}
	});
	exports.RatmanDiggingCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"ratman",
				front:"monster-ratman-digging",
				attack:0,
				cost:2,
				score:0,
				subtype:"beast"
			});
		},
		onReveal: function(condition){
			condition.player.changeMoney(1,condition);
			if ( condition.game.canDrawDungeonCard() )	{
				condition.game.drawDungeonCard(null, true);
			}
		}
	});
	exports.SkeletonCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"skeleton",
				front:"monster-skeleton",
				attack:1,
				cost:1,
				score:1,
				subtype:"undead"
			});
		},
	});
	exports.SpiderCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"spider",
				front:"monster-spider",
				attack:2,
				cost:4,
				score:1,
				subtype:"beast"
			});
		},
		onHitHero: function(condition){
			condition.hero.getStatus("poison",condition);
		}
	});
	exports.TitanCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"titan",
				front:"monster-titan",
				attack:6,
				cost:9,
				score:3,
				subtype:"gaint"
			});
		},
	});
	exports.ZombieCardModel = exports.MonsterCardModel.extend ({
		defaults: function() {
			var opt = exports.MonsterCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				name:"zombie",
				front:"monster-zombie",
				attack:2,
				cost:3,
				score:2,
				subtype:"undead"
			});
		},
	});

	exports.MagicCardModel = exports.DungeonCardModel.extend ({
		defaults: function() {
			var opt = exports.DungeonCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cost : 0,
				cardViewClass: "MagicCardView",
				target: ".active.hero",//room, monster, treasure, dungeon, player, current-player, buyable
				type: "magic",
			});
		},
	});

	exports.TreasureCardModel = exports.DungeonCardModel.extend ({
		defaults: function() {
			var opt = exports.DungeonCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cardViewClass: "TreasureCardView",
				type:"treasure",
			});
		},
	});

	exports.AmuletCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 5,
				front:"treasure-amulet",
			});
		},
		onHeroPassBy : function(condition){
			condition.hero.clearStatus();
			condition.hero.get("protect").status = true;
		}
	});
	exports.ArmorCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 10,
				front:"treasure-armor",
			});
		},
		onHeroPassBy : function(condition){
			condition.hero.addDefend(3, condition);
		}
	});
	exports.DaggerCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 7,
				front:"treasure-dagger",
			});
		},
		onHeroPassBy : function(condition){
			var e = condition.hero.get("equipments");
			e.push(this);
			condition.hero.set("equipments", e);
			condition.hero.get("protect").shop = true;
		},
		onMove : function(condition){
			if ( condition.player.get("money")>0 ){
				condition.player.changeMoney(-1);
				this.set("stolen",this.get("stolen")+1);
			}
		},
	});
	exports.ElixirCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 5,
				front:"treasure-elixir",
			});
		},
		onHeroPassBy : function(condition){
			condition.hero.set("hp", condition.hero.origin.hp);
		}
	});
	exports.HelmetCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 3,
				front:"treasure-helmet",
			});
		},
		onHeroPassBy : function(condition){
			condition.hero.addDefend(1, condition);
		}
	});
	exports.PotionCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 2,
				front:"treasure-potion",
			});
		},
		onHeroPassBy : function(condition){
			condition.hero.recoverHp(1,condition);
		}
	});
	exports.ShortBowCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 4,
				front:"treasure-short-bow",
			});
		},
		onHeroPassBy : function(condition){
			var e = condition.hero.get("equipments");
			e.push(this);
			condition.hero.set("equipments", e);
		},
		onReveal : function(condition){
			this.used = false;
		},
		beforeAttackMonster: function(condition) {
			if ( !this.used ){
				this.used = true;
				condition.monster.set("attack",0);
			}			
		}
	});
	exports.StaffCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 6,
				front:"treasure-staff",
			});
		},
		onHeroPassBy : function(condition){
			var e = condition.hero.get("equipments");
			e.push(this);
			condition.hero.set("equipments", e);
		},
		beforeTakeDamage: function(condition) {
			if ( condition.magic )
				condition.damage = 0;
		}
	});	
	exports.TrapGemCardModel = exports.TreasureCardModel.extend ({
		defaults: function() {
			var opt = exports.TreasureCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				score : 6,
				front:"treasure-trap-gem",
			});
		},
		onHeroPassBy : function(condition){
			condition.hero.get("protect").trap = true;
		}
	});

	exports.CycloneCardModel = exports.MagicCardModel.extend ({
		defaults: function() {
			var opt = exports.MagicCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cost : 3,
				score: 0,
				name:"drum",
				front:"magic-cyclone",
				subtype:"",
			});
		},
		onCast: function(condition){
			if ( window.game.setting.sound )
				condition.game.cycloneSound.play();
			condition.game.heroFlashToNext();
		},
	});
	exports.DrumCardModel = exports.MagicCardModel.extend ({
		defaults: function() {
			var opt = exports.MagicCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cost : 5,
				score: 2,
				name:"drum",
				front:"magic-drum",
				subtype:"",
				target:".dungeon-card-row",
			});
		},
		onCast: function(condition){
			if ( window.game.setting.sound )
				condition.game.drumSound.play();
			for ( var i = 0; i < condition.view.cards.length; i++)	{
				var cardModel = condition.view.cards[i].model;
				if ( cardModel.get("type") == "monster" )	{
					if (cardModel.get("type") == "monster")	{
						cardModel.addAttack(1,condition);
					}
				}
			}
		},
	});
	exports.MeldCardModel = exports.MagicCardModel.extend ({
		defaults: function() {
			var opt = exports.MagicCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cost : 3,
				score: 0,
				name:"meld",
				front:"magic-meld",
				subtype:"",
				target:":not(.tobe-remove).in-dungeon.monster",
			});
		},
		onCast: function(condition){
			condition.view.exileWhenDiscard();
			condition.player.changeMoney(condition.view.model.get("cost"),condition);
		},
	});
	exports.MagicMissleCardModel = exports.MagicCardModel.extend ({
		defaults: function() {
			var opt = exports.MagicCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cost : 3,
				score: 1,
				name:"magic-missle",
				front:"magic-magic-missle",
				subtype:"energy",				
			});
		},
		onCast: function(condition){
			if ( window.game.setting.sound )
				condition.game.fireballSound.play();
			condition.damage = 1;
			condition.view.model.takeDamage(condition);
		},
	});
	exports.FireBallCardModel = exports.MagicCardModel.extend ({
		defaults: function() {
			var opt = exports.MagicCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cost : 5,
				score: 1,
				name:"fireball",
				front:"magic-fireball",
				subtype:"fire",
			});
		},
		onCast: function(condition){
			if ( window.game.setting.sound )
				condition.game.fireballSound.play();
			condition.damage = 2;
			condition.view.model.takeDamage(condition);
		},
	});
	exports.LighteningCardModel = exports.MagicCardModel.extend ({
		defaults: function() {
			var opt = exports.MagicCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				cost : 6,
				score: 1,
				name:"lightening",
				front:"magic-lightening",
				subtype:"energy",
				target:".hero-card-row",
			});
		},
		onCast: function(condition){
			if ( window.game.setting.sound )
				condition.game.lighteningSound.play();
			var array = condition.view.cards;
			for ( var i = 0; i<array.length; i++ ){
				if ( array[i].model.get("hp") > 1) {
					condition.damage = 1;
					array[i].model.takeDamage(condition);
				}
			}
		},
	});

	exports.ArrowTrapCardModel = exports.RoomCardModel.extend ({
		defaults: function() {
			var opt = exports.RoomCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 1,
				cost : 3,
				score: 1,
				cardViewClass: "RoomCardView",
				subtype : "trap",
				front: "room-arrow-trap",
			});
		},
		onHeroPassBy: function(condition){
			if (condition.hero.get("protect").trap)
				return;
			condition.damage = 2;
			condition.hero.takeDamage(condition);
		}
	});
	exports.RollingBoulderCardModel = exports.RoomCardModel.extend ({
		defaults: function() {
			var opt = exports.RoomCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 3,
				cost : 5,
				score: 3,
				cardViewClass: "RoomCardView",
				subtype : "trap",
				front: "room-rolling-boulder",
			});
		},
		onHeroPassBy: function(condition){
			if (condition.hero.get("protect").trap)
				return;
			condition.hero.set("hp", 0);
		}
	});
	exports.ShopCardModel = exports.RoomCardModel.extend ({
		defaults: function() {
			var opt = exports.RoomCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 2,
				cost : 8,
				score: 2,
				cardViewClass: "RoomCardView",
				subtype : "shop",
				front: "room-shop",
			});
		},
		onHeroPassBy: function(condition){
			if (condition.hero.get("protect").shop)
				return;
			condition.hero.recoverHp(1,condition);
			condition.player.changeMoney(6,condition);
		}
	});
	exports.BlacksmithCardModel = exports.RoomCardModel.extend ({
		defaults: function() {
			var opt = exports.RoomCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 2,
				cost : 4,
				score: 2,
				cardViewClass: "RoomCardView",
				subtype : "shop",
				front: "room-blacksmith",
			});
		},
		onHeroPassBy: function(condition){
			if (condition.hero.get("protect").shop)
				return;
			condition.hero.addDefend(1,condition);
			condition.player.changeScore(2,condition);
		}
	});
	
	exports.PitfallCardModel = exports.RoomCardModel.extend ({
		defaults: function() {
			var opt = exports.RoomCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 1,
				cost : 3,
				score: 1,
				cardViewClass: "RoomCardView",
				subtype : "trap",
				front: "room-pitfall",
			});
		},
		onHeroPassBy: function(condition){
			if (condition.hero.get("protect").trap)
				return;
			condition.damage = condition.hero.getDefend(condition)+1;
			condition.hero.takeDamage(condition);
		}
	});
	exports.PoisionTrapCardModel = exports.RoomCardModel.extend ({
		defaults: function() {
			var opt = exports.RoomCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 2,
				cost : 1,
				score: 0,
				cardViewClass: "RoomCardView",
				subtype : "trap",
				front: "room-poison-trap",
			});
		},
		onHeroPassBy: function(condition){
			if (condition.hero.get("protect").trap)
				return;
			condition.hero.getStatus("poison",condition);
		}
	});
	exports.MazeEntryCardModel = exports.RoomCardModel.extend ({
		defaults: function() {
			var opt = exports.RoomCardModel.prototype.defaults.apply(this);
			return _.extend( opt, {
				maintenance : 1,
				cost : 4,
				score: 2,
				cardViewClass: "RoomCardView",
				subtype : "room",
				front: "room-maze-entry",
			});
		},
		onReveal: function(condition){
			exports.RoomCardModel.prototype.onReveal.call(this,condition);
			if ( condition.game.canDrawDungeonCard() )	{
				condition.game.drawDungeonCard( function(){
					if ( condition.game.canDrawDungeonCard() )	{
						condition.game.drawDungeonCard(null, true);
					}
				}, true);
			}
		}
	});
	
	exports.CardView = Sprite.Sprite.extend({
		initLayout:function(){
			Sprite.Sprite.prototype.initLayout.apply(this);
			this.$el.addClass("card");
			this.renderSide();
			if ( this.model.get("side") == "back" ) {
				this.hideDetail(true);
			}
		},
		initClass : function() {
			this.Model = exports.CardModel;
		},
		initData : function() {
			Sprite.Sprite.prototype.initData.apply(this);
			this.model.on("change:side",this.renderSide, this);
			this.animateQueue = [];
		},

		renderSide:function(){
			if ( this.model.get("side") == "front" ) {
				this.$el.removeClass(this.model.get("back"));
				this.$el.removeClass("back");
				this.$el.addClass(this.model.get("front"));
			} else if ( this.model.get("side") == "back" ) {
				this.$el.removeClass(this.model.get("front"));
				this.$el.addClass(this.model.get("back"));
				this.$el.addClass("back");
			}
		},
		flip:function(callback) {
			var x = this.model.get("x")+this.model.get("width")/2;
			var self = this;
			this.hideDetail(true);
			window.globalAnimating++;
			this.$el.addClass("animating fliping");
			this.$el.animate({left:x,width:1},ATTACK_TIME,"swing",function(){
				self.model.set({side:self.model.get("side") == "front"?"back":"front"});
			}).animate({left:self.model.get("x"),width:self.model.get("width")},FLIP_TIME,"swing", function(){
					self.hideDetail(false);
					self.$el.removeClass("animating");
					window.globalAnimating--;
					if ( callback )
						callback.apply();
					self.$el.dequeue("__card_flip__");
				});;
			return this;
		},
		/*moveTo:function(x,y, time,callback){
			if ( this.$el.hasClass("fliping")){
				var self = this;
				this.$el.queue("__card_flip__",function(){
					Sprite.Sprite.prototype.moveTo.call(self,x,y,time,callback);
					self.$el.dequeue("__card_flip__")
				});
			} else {
				Sprite.Sprite.prototype.moveTo.call(this,x,y,time,callback);
			}
		},*/
		pick:function(){
			this.$el.addClass("picked");
			return this;
		},
		unpick:function(){
			this.$el.removeClass("picked");
			return this;
		},
		hideDetail:function(hide){
			if ( hide )	{
				this.$el.addClass("hide-detail");
			} else this.$el.removeClass("hide-detail");
		},
		attack:function(direction,callback,context){
			var oldx = this.model.get("x");
			var oldy = this.model.get("y");
			var newx,newy;
			switch ( direction ){
				case "up":
					newy = oldy - ATTACK_LENGTH;
					newx = oldx;
					break;
				case "down":
					newy = oldy + ATTACK_LENGTH;
					newx = oldx;
					break;
				case "left":
					newy = oldy;
					newx = oldx - ATTACK_LENGTH;
					break;
				case "right":
					newy = oldy;
					newx = oldx + ATTACK_LENGTH;
					break;
			}
			var self = this;
			window.globalAnimating++;
			this.$el.addClass("animating");
			this.$el.animate({left:newx,top:newy},ATTACK_TIME,"easeInQuart").animate({left:oldx,top:oldy},{queue:true,duration:ATTACK_TIME,easing:"easeOutQuart", complete:function(){
				self.$el.removeClass("animating");
				window.globalAnimating--;
				if ( callback )
					callback.apply(context);
			}});
		},
		discard:function(callback){
			if ( this.tobeRemove ) {
				this.removeFromGame(callback);
				return;
			}
			if ( this.options.discardTo ) {
				var m = this.options.discardTo.model;
				var self = this;
				this.moveAndResizeTo( m.get("x"), m.get("y"), m.get("width"), m.get("height"), null, function(){
					m.cards.unshift(self.model);
					self.remove();
					if ( callback ) callback.apply();
				});
			} else {
				if ( callback ) callback.apply();
			}
			this.model.origin.side = this.model.get("side");
			this.model.set(this.model.origin);
		},
		removeFromGame:function(callback){
			var self = this;
			this.moveWithRotate(-100,-300,600,function(){
				self.model.destroy();
				if (callback)
					callback();
			});
		},
		setBuyable:function(){
			this.$el.addClass("buyable");
			this.$el.attr({"title":"拖拽到你的地城弃牌堆以购买"});
			this.$el.draggable({
				revert: "invalid",
				zIndex: 90,
				addClasses : false,
			});
		},
		exileWhenDiscard:function() {
			if ( this.tobeRemove )
				return;
			this.tobeRemove = true;
			this.$el.addClass("tobe-remove");
			this.$el.append("<div class='tobe-remove-mark' style='left:-20%;top:-10%;width:140%;height:115%'/>");
			this.$(".tobe-remove-mark").animate({left:10,top:38,width:80,height:80});
		}
	});

	exports.HeroCardView = exports.CardView.extend({
		initData : function() {
			exports.CardView.prototype.initData.apply(this);
			this.model.on("change:hp",this.changeHp, this);
			this.model.on("change:defend",this.changeDefend, this);
			this.model.on("change:height",this.changeHeight, this);
			this.model.on("change:goal",this.changeGoal, this);
			this.model.on("change:status",this.changeStatus, this);
		},
		initLayout:function(){
			exports.CardView.prototype.initLayout.apply(this);
			this.$el.addClass("hero");
		},
		renderSide:function(){
			this.$el.empty();
			exports.CardView.prototype.renderSide.apply(this);
			if ( this.model.get("side") == "front" ) {
				var fontSize = 18/176*this.$el.height();
				this.$el.append("<div style='position:absolute;left:3%;top:12%;font-size:"+fontSize+"px;' class='detail card-icon hp-icon' title='英雄的生命'>"+this.model.get("hp")+"</div>");
				this.$el.append("<div style='position:absolute;left:3%;top:26%;font-size:"+fontSize+"px;' class='detail card-icon defend-icon' title='英雄的防御力'>"+this.model.get("defend")+"</div>");
				this.$el.append("<div style='position:absolute;left:3%;top:40%;' class='detail card-icon goal-icon' title='完成的目标'>"+this.model.get("goal")+"</div>");
				if ( this.model.get("goal") )
					this.$(".card-icon.goal-icon").show();
				else
					this.$(".card-icon.goal-icon").hide();
				this.$(".card-icon").css({"line-height":this.$(".card-icon").height()+"px"});
			}
		},
		changeHeight:function(){
			var fontSize = 18/176*this.$el.height();
			this.$(".card-icon").css({"font-size":fontSize+"px", "line-height":this.$(".card-icon").height()+"px"});
		},
		changeHp:function(model){
			this.$(".card-icon.hp-icon").html(this.model.get("hp"));
			var hp = model.get("hp") - model.previous("hp");
			Effect.poping(this.$el, this.$el.width()/2-Effect.POPING_WIDTH/2,this.$el.height()/2-Effect.POPING_WIDTH/2,"hp-icon", hp);
		},
		changeDefend:function(model){
			this.$(".card-icon.defend-icon").html(this.model.get("defend"));
			var hp = model.get("defend") - model.previous("defend");
			Effect.poping(this.$el, this.$el.width()/2-Effect.POPING_WIDTH/2,this.$el.height()/2-Effect.POPING_WIDTH/2,"defend-icon", hp);
		},
		changeGoal:function(model){
			this.$(".card-icon.goal-icon").html(this.model.get("goal"));
			if ( this.model.get("goal") )
				this.$(".card-icon.goal-icon").show();
			else
				this.$(".card-icon.goal-icon").hide();
		},
		changeStatus:function(model){
			this.$(".status-icon").remove();
			var y = 12;
			for ( var status in model.get("status") ){
				this.$el.append("<div style='position:absolute;right:3%;top:"+y+"%;' class='status-icon detail card-icon "+status+"-icon' title='"+STATUS[status]+"'></div>");
				y+=14;
			}
		},
		active:function(){
			this.$el.addClass("active");
		},
		deactive:function(){
			this.$el.removeClass("active");
		},
	});
	exports.DungeonCardView = exports.CardView.extend({
		initData : function() {
			exports.CardView.prototype.initData.apply(this);
			this.model.on("change:cost",this.changeCost, this);
			this.model.on("change:attack",this.changeAttack, this);
			this.model.on("change:height",this.changeHeight, this);
		},
		initLayout:function(){
			exports.CardView.prototype.initLayout.apply(this);
			this.$el.addClass("dungeon");
		},
		renderSide:function(){
			this.$el.empty();
			exports.CardView.prototype.renderSide.apply(this);
			if ( this.model.get("side") == "front" ) {
				if ( this.model.get("type") != "treasure" )	{
					this.$el.append("<div style='position:absolute;right:5%;top:15%;' class='detail card-icon money-icon' title='牌的购入价'>"+this.model.get("cost")+"</div>");
				}
				if ( this.model.get("type") == "monster"){
					this.$el.append("<div style='position:absolute;left:3%;top:15%;' class='detail card-icon attack-icon' title='怪物的攻击力'>"+this.model.get("attack")+"</div>");
				} else if ( this.model.get("type") == "room"){
					this.$el.append("<div style='position:absolute;left:3%;top:15%;' class='detail card-icon maintenance-icon' title='维护费用'>"+this.model.get("maintenance")+"</div>");
				}
				this.$el.append("<div style='position:absolute;left:3%;bottom:3%;' class='detail card-icon score-icon' title='游戏结束时的分数'>"+this.model.get("score")+"</div>");
				this.$(".card-icon").css({"line-height":this.$(".card-icon").height()+"px"});
			}
		},
		changeHeight:function(){
			var fontSize = 18/176*this.$el.height();
			this.$(".card-icon").css({"font-size":fontSize+"px", "line-height":this.$(".card-icon").height()+"px"});
		},
		changeCost:function(model){
			this.$(".money-icon").html(this.model.get("cost"));
			var amount = model.get("cost") - model.previous("cost");
			Effect.poping(this.$el, this.$el.width()/2-Effect.POPING_WIDTH/2,this.$el.height()/2-Effect.POPING_WIDTH/2,"money-icon", amount);
		},		
		getAttack:function(){
			return this.model.get("attack");
		},
		saleoff:function(){
			this.$el.addClass("saleoff");
			if ( this.model.get("cost") > 0 )
				this.model.set("cost",this.model.get("cost")-1);
			this.$el.append("<div class='saleoff-mark' style='left:-20%;top:-10%;width:140%;height:115%'/>");
			this.$(".saleoff-mark").animate({left:10,top:38,width:80,height:80});
		}
	});
	exports.MonsterCardView = exports.DungeonCardView.extend({
		initData : function() {
			exports.DungeonCardView.prototype.initData.apply(this);
			this.model.on("change:attack",this.changeAttack, this);
		},
		initLayout:function(){
			exports.DungeonCardView.prototype.initLayout.apply(this);
			this.$el.addClass("monster");
		},
		changeAttack:function(model){
			this.$(".attack-icon").html(this.model.get("attack"));
			var amount = model.get("attack") - model.previous("attack");
			Effect.poping(this.$el, this.$el.width()/2-Effect.POPING_WIDTH/2,this.$el.height()/2-Effect.POPING_WIDTH/2,"attack-icon", amount);
		},
	});
	exports.FireElementCardView = exports.MonsterCardView.extend({
		beforeDiscard:function(condition){
			var index = condition.game.dungeonCardRow.getIndex(this);
			if ( index < 0 ){
				return;
			}
			if ( index - 1 >= 0 ) {
				var cardView = condition.game.dungeonCardRow.cards[index-1];
				var card = cardView.model;
				if ( card.get("type") == "monster" && cardView.model.get("cost") < this.model.get("cost") ){
					cardView.exileWhenDiscard();
				}
			}
			if ( index + 1 < condition.game.dungeonCardRow.cards.length ) {
				var cardView = condition.game.dungeonCardRow.cards[index+1];
				var card = cardView.model;
				if ( card.get("type") == "monster" && cardView.model.get("cost") < this.model.get("cost") ){
					cardView.exileWhenDiscard();
				}
			}
		}		
	});

	exports.MagicCardView = exports.DungeonCardView.extend({
		initLayout : function() {
			exports.DungeonCardView.prototype.initLayout.apply(this);
			this.$el.addClass("magic");
		},
		setUsable: function() {
			var target = this.model.get("target");
			var model = this.model;
			var self = this;
			this.$el.draggable({
				revert: "invalid",
				zIndex: 90,
				helper: "clone",
				opacity: 0.7,
				start:function(event,ui){
					$(target).droppable({
						tolerance:"pointer",
						over: function(event,ui){
							if ( $(this).hasClass("animating") )
								return;
							$(this).data("oldShadow", $(this).css("box-shadow"));
							$(this).css({"box-shadow":"0 0 5px red"})
						},
						out: function(event,ui){
							$(this).css({"box-shadow":$(this).data("oldShadow")})
						},
						drop: function(event,ui){
							if ( $(target).is('.ui-droppable') ){
								$(target).droppable("destroy");
							}							
							$(this).css({"box-shadow":$(this).data("oldShadow")})
							if ( $(this).hasClass("animating") )
								return;
							var condition = { view: $(this).data("view"), player:window.game.player , game:window.game, magic:self};
							if ( model.onCast )	{
								model.onCast(condition);
							}
							self.row.removeView(self);
							self.discard();
						},
					});
				},
				stop:function(event,ui){
					if ( $(target).is('.ui-droppable') ){
						$(target).droppable("destroy");
					}
				},
			});
		},
		setUsed : function() {
			if ( this.$el.is('.ui-draggable') ){
				this.$el.draggable("destroy");
			}
		}
	});
	exports.TreasureCardView = exports.DungeonCardView.extend({
		initLayout : function() {
			exports.DungeonCardView.prototype.initLayout.apply(this);
			this.$el.addClass("treasure");
		}
	});
	exports.RoomCardView = exports.DungeonCardView.extend({
		initLayout : function() {
			exports.DungeonCardView.prototype.initLayout.apply(this);
			this.$el.addClass("room");
		}
	});
});