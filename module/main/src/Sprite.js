define(function(require,exports,module) {
	exports.SpriteModel = Backbone.Model.extend({
		defaults: function() {
			return {
				x:0,
				y:0,
				z:"auto",
				rotate:0,
				width: 0,
				height: 0,
			};
		}
	});

	exports.SpriteCollection = Backbone.Collection.extend({
		model: exports.SpriteModel,
	});

	exports.Sprite = Backbone.View.extend({
		initialize: function() {
			this.initClass();
			this.initData();
			this.initStyle();
			this.initLayout();
			this.$el.data("view",this);
		},
		initClass:function() {
			this.Model = exports.SpriteModel;
		},
		initData:function() {
			this.model.on("change:x change:y change:width change:height change:z",this.render,this);
			this.model.on("destroy", this.remove,this);
		},
		initStyle:function(){
		},
		initLayout:function(){
			this.$el.addClass("sprite");
		},
		render:function(){
			this.$el.css({left:this.model.get("x"), top:this.model.get("y"), width:this.model.get("width"),height:this.model.get("height"), 'z-index':this.model.get("z"),position:"absolute"});
			return this;
		},
		moveTo: function(x,y, time,callback){
			var self = this;
			window.globalAnimating++;
			this.$el.addClass("animating");
			this.$el.animate({left:x,top:y}, {queue:true, duration:time||400,easing: "linear",complete:function(){
				self.model.set({x:x,y:y});
				self.$el.removeClass("animating");
				window.globalAnimating--;
				if ( callback )
					callback.apply();
			}});
		},
		moveAndResizeTo: function(x,y,w,h,time,callback){
			var self = this;
			window.globalAnimating++;
			this.$el.addClass("animating");
			this.$el.animate({left:x,top:y,width:w,height:h}, {queue:true, duration: time||400, easing: "linear", complete: function(){
				self.model.set({x:x,y:y,width:w,height:h});
				self.$el.removeClass("animating");
				window.globalAnimating--;
				if ( callback )
					callback.apply();
			}});
		},
		moveWithRotate: function(x,y, time,callback){
			var self = this;
			var el = this.$el;
			var degree = 0;
			window.globalAnimating++;
			this.$el.addClass("animating");
			this.$el.animate({left:x, top:y}, {duration:time||400,
				easing: "linear",
				step: function(){
					degree += 10;
					el.css({"-moz-transform":"rotate("+degree+"deg)",
						"-webkit-transform":"rotate("+degree+"deg)",
						"-o-transform":"rotate("+degree+"deg)"
					});
				},
				complete: function(){
					el.css({"-moz-transform":"rotate(0deg)",
						"-webkit-transform":"rotate(0deg)",
						"-o-transform":"rotate(0deg)"
					});
					self.$el.removeClass("animating");
					window.globalAnimating--;
					if (callback)
						callback();
				}
			});
		},
		show: function(){
			this.$el.show();
		},
		hide: function(){
			this.$el.hide();
		},
		remove:function(){
			if ( this.$el.hasClass("animating")){
				window.globalAnimating--;
			}
			Backbone.View.prototype.remove.apply(this);
		}
	});
})

