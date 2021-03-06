define(function(require,exports,module) {
	exports.Sprite = Backbone.View.extend({
		initialize: function() {
			this.initClass();
			this.initData();
			this.initStyle();
			this.initLayout();
			this.$el.data("view",this);
		},
		initClass:function() {
			var SpriteModel = require("../model/SpriteModel").SpriteModel;
			this.SpriteModel = SpriteModel;
		},
		initData:function() {
			this.model.on("change",this.render,this);
		},
		initStyle:function(){
		},
		initLayout:function(){
		},
		render:function(){
			this.$el.css({left:this.model.get("x"), top:this.model.get("y"), width:this.model.get("width"),height:this.model.get("height"), 'z-index':this.model.get("z"),position:"absolute"});
			return this;
		}		
	});
})

