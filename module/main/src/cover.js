define(function(require,exports,module){
	exports.PlayerNameInput = Backbone.View.extend({
		events:{
			"click #cancel":"cancel",
			"click .player-name-select img":"selectProfile"
		},
		
		initialize: function(){
			this.detailMask = $("<div class='detail-mask' style='width:100%;height:100%;background:black;opacity:0.1;z-index:98;'/>");
			this.$el.css({width:"100%",height:"100%"});
			this.$el.append(this.detailMask);
			this.detailMask.animate({opacity:0.7},250);
			
			var playerName = localStorage.getItem("lastPlayerName");			
			var playerProfile = localStorage.getItem("lastPlayerProfile");

			this.$el.append("<div class='player-name-select' style='background:grey;z-index:100;position:absolute;left:350px;top:300px;width:580px'><label>您的大名，领主大人？</label><br/><input class='player-name-input' style='height:40px;font-size:18px' value='"+(playerName?playerName:"玩家1")+"'/><br/></div>");
			this.$(".player-name-select").append("<label>以下哪张是您英俊的面容，领主大人？</label><br/><div class='player-profile-select'></div>");
			this.$(".player-profile-select").append("<img id='lord0' src='"+require.resolve("../res/image/lord0.jpg#")+"' style='float:left'/><img id='lord1' src='"+require.resolve("../res/image/lord1.jpg#")+"' style='float:left'/><img id='lord2' src='"+require.resolve("../res/image/lord2.jpg#")+"' style='float:left'/><img id='lord3' src='"+require.resolve("../res/image/lord3.jpg#")+"' style='float:left'/><img id='lord4' src='"+require.resolve("../res/image/lord4.jpg#")+"' style='float:left'/>")
			this.$(".player-name-select").append("<button id='start-game' class='ui-game-button'>好吧，让那些自命不凡的英雄放马过来吧！</button><button class='ui-game-button' id='cancel'>且慢，其实我准备拿着金库的钱去乡下疗养……</button>");
			this.$(".player-name-select #"+(playerProfile||"lord0")).addClass("selected");
		},
		cancel:function(){
			this.remove();	
		},
		selectProfile:function(event){
			this.$(".player-name-select img").removeClass("selected");
			$(event.currentTarget).addClass("selected");
		}
	});
	exports.AppView = Backbone.View.extend({
		events:{
			"click #single-player":"singlePlayer",
			"click #multi-player":"multiPlayer",
			"click #challenge":"challenge",
			"click #score-and-achievement":"scoreAndAchievement",
			"click #exit":"exit",
			"click #start-game":"StartSingelPlayerGame",
		},
		
		initialize: function(){
			require("../css/cover.css");
			this.$el.append("<button id='single-player' style='position:absolute;left:500px;top:450px;width:280px;height:40px;font-size:30px'>单人游戏</button>");
			this.$el.append("<button id='multi-player' style='position:absolute;left:500px;top:500px;width:280px;height:40px;font-size:30px' disabled>多人游戏</button>");
			this.$el.append("<button id='challenge' style='position:absolute;left:500px;top:550px;width:280px;height:40px;font-size:30px' disabled>挑战模式</button>");
			this.$el.append("<button id='score-and-achievement' style='position:absolute;left:500px;top:600px;width:280px;height:40px;font-size:30px'>成绩与成就</button>");
			this.$el.append("<button id='exit' style='position:absolute;left:500px;top:650px;width:280px;height:40px;font-size:30px'>退出游戏</button>");
		},
		singlePlayer:function(){
			this.playerNameInputView = new exports.PlayerNameInput();
			this.$el.append(this.playerNameInputView.render().el);
		},
		multiPlayer:function(){
		},
		scoreAndAchievement:function(){
			var ScoreBoard = require("./score-board").ScoreBoard;
			var view = new ScoreBoard({player:this.player});
			this.$el.append(view.render().el);
		},
		exit:function(){
			window.open('','_parent',''); 
			window.close();
		},
		challenge:function(){
		},
		StartSingelPlayerGame:function(){
			this.$("#cancel").remove();
			this.$("#start-game").remove();
			var playerName = this.$(".player-name-input").val() || "player1";
			var playerProfile = this.$(".player-name-select img.selected").attr("id");
			localStorage.setItem("lastPlayerName",playerName);
			localStorage.setItem("lastPlayerProfile",playerProfile);

/*			var self = this;
			
			this.loadingProgress = $("<div style='z-index:99999;position:absolute;left:500px;top:400px;width:280px;height:40px'/>");
			this.$el.append(this.loadingProgress);

			require.async("./filelist",function(files){
				var array = files.files;
				var count = 0;
				self.loadingProgress.progressbar({
					value:0
				});
				for ( var i = 0; i < array.length ; i++ ){
					array[i] = "../res/image/"+array[i]+"#";
					$.ajax({
						url:require.resolve(array[i]),
						success:function(){
							count++;
							self.loadingProgress.progressbar("option","value",Math.round(count/array.length*100));
							if ( count >= array.length ){
								self.realStartGame(playerName,playerProfile);
							}
						},
						error:function(){
							count++;
							self.loadingProgress.progressbar("option","value",Math.round(count/array.length*100));
							if ( count >= array.length ){
								self.realStartGame(playerName,playerProfile);
							}
						}
					});
				}
			});	*/	
			this.realStartGame(playerName,playerProfile);
		},
		realStartGame:function(playerName,playerProfile){
			this.playerNameInputView.remove();
			//this.loadingProgress.remove()
			this.$el.hide();
			var AppView = require("./app-view").AppView;
			$(".out-border").append('<div id="game1" class="main-game"></div>');
			window.game = new AppView({el:"#game1", playerName:playerName, playerProfile:playerProfile});
		}
	});
});