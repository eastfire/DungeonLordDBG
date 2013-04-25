define(function(require,exports,module){
	exports.ScoreModel = Backbone.Model.extend({
		defaults:function(){
			return {
				score: 0,
				money: 0,
				name : "",
				profile : "",
				card : 0,
				magic : 0,
				treasure : 0,
				monster: 0,
				room : 0,
			};
		}
	});
	var ScoreCollection = Backbone.Collection.extend({
		model:exports.ScoreModel,
		comparator:function(a,b){
			if ( a.get("score") > b.get("score") )
				return -1;
			else if ( a.get("score") < b.get("score") )
				return 1;
			else if ( a.get("money") > b.get("money") )
				return -1;
			else if ( a.get("money") < b.get("money") )
				return 1;
			else if ( a.get("totalCards") > b.get("totalCards") )
				return -1;
			else return 1;
		}
	});
	exports.ScoreBoard = Backbone.View.extend({
		events:{
			"click #clear-scores":"clearScores",
			"click #to-cover":"exitToCover"
		},
		initialize: function(){
			this.detailMask = $("<div class='detail-mask' style='width:100%;height:100%;background:black;opacity:0.1;z-index:998;'/>");
			this.$el.css({width:"100%",height:"100%"});
			this.$el.append(this.detailMask);
			this.board = $("<div>");
			this.board.css({position:"absolute",left:200,top:50, width:880, height: 620,"z-index":1000,background:"white"});
			this.$el.append(this.board);
			this.detailMask.animate({opacity:0.7},250);

			if (this.options.player) {
				this.board.append("<label style='float:left'>您的成绩：</label><div class='player-score-icon icon score-icon' style='float:left' title='你的分数'/><label class='player-score' style='float:left;' title='你的分数'/><br/><div style='clear:both'/>");
				this.$(".player-score").html(this.options.player.get("score"));
			}

			var scores;
			var store = localStorage.getItem("scores");
			if ( !store ){
				scores = null;
			} else scores = JSON.parse(store);

			var scoreCollection = new ScoreCollection(scores);
			var score = null;
			if (this.options.player) {
				score = new exports.ScoreModel(_.extend({
					name: this.options.player.get("name"),
					profile: this.options.player.get("profile"),
					score:this.options.player.get("score"),
					money:this.options.player.get("money"),
					id:scoreCollection.length+1,
				},this.options.player.total));
				scoreCollection.add(score);
				localStorage.setItem("scores",JSON.stringify(scoreCollection.models));
			}
			scoreCollection.sort();
			
			this.board.append("<table><thead><tr><td><label>排名</label></td><td><label>名号</label></td><td><div class='icon score-icon'/>分数</td>"+
				"<td><div class='icon money-icon'/>钱</td><td><div class='icon dungeon-card-icon'/>总牌数</td>"+
				"<td><div class='icon dungeon-card-icon'/>怪物</td><td><div class='icon dungeon-card-icon'/>魔法</td><td><div class='icon dungeon-card-icon'/>宝物</td><td><div class='icon dungeon-card-icon'/>房间</td></tr></thead><tbody></tbody>");
			for ( var i = 0; i < scoreCollection.length ; i++ )	{
				var s = scoreCollection.at(i);
				if ( /\.jpg/.exec(s.get("profile")) ){
					s.set("profile","lord0");
				}
				var url = require.resolve("../res/image/"+s.get("profile")+".jpg#");
				this.$("tbody").append("<tr "+(score && s.get("id")==score.get("id")?"class='current-score'":"")+"><td>"+(i+1)+"</td><td><img src='"+url+"' style='width:24px;height:24px'/>"+s.get("name")+"</td><td>"+s.get("score")+"</td><td>"+s.get("money")+"</td><td>"+s.get("card")+"</td><td>"+s.get("monster")+"</td><td>"+s.get("magic")+"</td><td>"+s.get("treasure")+"</td><td>"+s.get("room")+"</td></tr>");
			}

			this.board.append("<button id='clear-scores' class='ui-game-button'>清空成绩表</button>");
			this.board.append("<button id='to-cover' class='ui-game-button'>返回主菜单</button>")
		},
		clearScores: function(event){
			if ( window.confirm("真的要清空成绩表吗？") ){
				localStorage.clear();
				this.$("tbody").empty();
			}
		},
		exitToCover:function(){
			$("#cover").show();
			this.remove();
			if ( window.game ){
				window.game.remove();
			}
		}
	});
});