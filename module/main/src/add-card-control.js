define(function(require,exports,module){
	var Sprite = require("./Sprite");
	exports.AddCardControl = Sprite.Sprite.extend({
		initLayout:function(){
			Sprite.Sprite.prototype.initLayout.apply(this);
			this.$el.attr("id","add-card-control");
			this.$el.append("<div style='position:relative;top:30%;left:20%'><label style='float:left' class='add-card-cost'>-"+this.model.get('cost')+"</label><div style='float:left' class='icon money-icon'/><label style='float:left'>：</label><br/><label style='float:left'>+1</label><div style='float:left' class='icon dungeon-card-icon'></div>");
		},
		initData:function() {
			Sprite.Sprite.prototype.initData.apply(this);
			this.model.on("change:cost",this.renderCost,this);
		},
		renderCost:function(){
			this.$(".add-card-cost").html("-"+this.model.get("cost"));
		}
	});
});