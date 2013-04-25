define(function(require,exports,module){
	exports.CardRow = Backbone.View.extend({
		initialize:function(){
			this.orientation = this.options.orientation || "horizontal";
			this.height = this.options.height;
			this.width = this.options.width;
			this.unitWidth = this.options.unitWidth;
			this.unitHeight = this.options.unitHeight;
			this.unitSpacing = this.options.unitSpacing;
			this.maxLength = this.options.limit ? ( this.orientation == "horizontal" ? this.width : this.height ) : 1280;
			this.autoShift = (this.options.autoShift == undefined? true : this.options.autoShift);
			this.x = this.options.x;
			this.y = this.options.y;
			this.addClass = this.options.addClass;
			this.cards = [];
			this.currentShift = 0;
			this.$el.addClass("row "+this.options.name);
			this.$el.data("view",this);
		},
		render:function(){
			this.$el.css({left:this.x, top:this.y, width:this.width,height:this.height, position:"absolute", background:"transparent"});
			return this;
		},
		add:function(cardView, callback, options) {
			this.cards.push(cardView);
			var newx,newy;
			var self = this;
			if ( this.orientation == "horizontal") {
				newx = this.x+this.currentShift;
				newy = this.y;
				this.currentShift += this.unitWidth + this.unitSpacing;
			} else {
				newx = this.x;
				newy = this.y+this.currentShift;
				this.currentShift = this.unitHeight + this.unitSpacing;
			}
			
			if ( this.orientation == "horizontal") {
				var increaseX = Math.min((this.maxLength - this.unitWidth - this.unitSpacing)/this.cards.length, this.unitWidth + this.unitSpacing);
				for (var i =0 ;i < this.cards.length - 1; i++){
					var card = this.cards[i];
					card.moveTo(this.x + increaseX*i, this.y, 200);
				}
				newx = this.x + increaseX*i;
			} else {
				var increaseY = Math.min((this.maxLength - this.unitHeight - this.unitSpacing)/this.cards.length, this.unitHeight + this.unitSpacing);
				for (var i =0 ;i < this.cards.length - 1; i++){
					var card = this.cards[i];
					card.moveTo(this.x, this.y + increaseY*i, 200);
				}
				newy = this.y + increaseY*i;
			}

			cardView.moveAndResizeTo(newx,newy,this.unitWidth,this.unitHeight,null, function(){
				cardView.model.set("row", self);
				if ( self.addClass ){
					cardView.$el.addClass(self.addClass);
				}
				if ( callback ) {
					callback.call(self, options);
				}
				self.trigger("rearrange");
			});
		},
		shift:function(callback) {
			var cardView = this.cards.shift();
			if ( this.cards.length == 0){
				callback();
				return cardView;
			}
			if ( this.orientation == "horizontal") {
				for ( var i = 0; i < this.cards.length ; i++) {
					var c = this.cards[i];
					c.moveTo(c.model.get("x") - (this.unitWidth + this.unitSpacing), this.y, null, i==0?callback:null);
				}
				this.currentShift -= this.unitWidth + this.unitSpacing;
			} else {
				for ( var i = 0; i < this.cards.length ; i++) {
					var c = this.cards[i];
					c.moveTo(this.x, c.model.get("y") - (this.unitHeight + this.unitSpacing), null, i==0?callback:null);
				}
				this.currentShift -= this.unitHeight + this.unitSpacing;
			}
			this.trigger("rearrange");
			return cardView;
		},
		removeView:function(view,callback){
			for ( var i=0; i < this.cards.length; i++){
				if ( this.cards[i] == view ){
					break;
				}
			}
			if ( i < this.cards.length)	{
				this.removeIndex(i,callback);
				return i;
			} else return -1;			
		},
		removeIndex:function(index,callback) {
			var cardView = this.cards.splice(index,1)[0];
			if (this.autoShift ){
				if ( this.orientation == "horizontal") {
					for ( var i = index; i < this.cards.length ; i++) {
						var c = this.cards[i];
						c.moveTo(c.model.get("x") - (this.unitWidth + this.unitSpacing), this.y, null, i==0?callback:null);
					}
					this.currentShift -= this.unitWidth + this.unitSpacing;
				} else {
					for ( var i = index; i < this.cards.length ; i++) {
						var c = this.cards[i];
						c.moveTo(this.x, c.model.get("y") - (this.unitHeight + this.unitSpacing), null, i==0?callback:null);
					}
					this.currentShift -= this.unitHeight + this.unitSpacing;
				}
			}
			if ( cardView )	{
				cardView.model.set("row",null);
				if ( this.addClass ){
					cardView.$el.removeClass(this.addClass);
				}
			}
			this.trigger("rearrange");
			return cardView;
		},
		shiftToEnd:function(callback){
			if ( this.orientation == "horizontal") {
				for ( var i = 0; i < this.cards.length ; i++) {
					var c = this.cards[i];
					c.moveTo(this.x + (this.unitWidth + this.unitSpacing)*i, this.y, null, i==0?callback:null);
				}
				this.currentShift = this.x + (this.unitWidth + this.unitSpacing)*i;
			} else {
				for ( var i = 0; i < this.cards.length ; i++) {
					var c = this.cards[i];
					c.moveTo(this.x, this.y + (this.unitHeight + this.unitSpacing)*i, c.model.get("y"));
				}
				this.currentShift = this.y + (this.unitWidth + this.unitSpacing)*i;
			}
		},
		get:function(index){
			return this.cards[index];
		},
		getIndex:function(view){
			var index = null;
			for ( var i = 0; i < this.cards.length ; i++){
				if (this.cards[i] == view) {
					return i;
				}
			}
			return -1;
		},
		getPosition: function(index){
			if ( index >= this.cards.length ) {
				var p = this.cards[this.cards.length-1].$el.position();
				if ( this.orientation == "horizontal") {
					p.left += this.unitWidth + this.unitSpacing;
				} else {
					p.top += this.unitHeight + this.unitSpacing;
				}
				return p;
			} else return this.cards[index].$el.position();
		},
		getLastPosition: function(){
			if ( this.cards.length == 0){
				return this.x;
			}
			var p = this.cards[this.cards.length-1].$el.position();
			if ( this.orientation == "horizontal") {
				p.left += this.unitWidth + this.unitSpacing;
			} else {
				p.top += this.unitHeight + this.unitSpacing;
			}
			return p;
		},
		discard:function(callback){
			if ( this.cards.length == 0 && callback){
				callback();
			}
			var count = this.cards.length;
			for ( var i = 0; i < count ; i++){
				var c = this.cards[i];
				if (c.beforeDiscard)
					c.beforeDiscard({game:window.game});
			}			
			for ( var i = 0; i < count ; i++){
				var c = this.cards[i];
				c.model.set("row",null);
				if ( this.addClass ){
					c.$el.removeClass(this.addClass);
				}
				c.discard(i==(count-1)?callback:null);
			}
			this.cards = [];
			this.currentShift = 0;
		},
		showSort:function(){
			for ( var i=0; i<this.cards.length-1; i++){
				var x = this.cards[i].$el.position().left + this.cards[i].$el.width();
				var x2 = this.cards[i+1].$el.position().left;
				this.$el.append("<button style='position:absolute;left:"+(x+x2)/2+"px;top:40%' />")
			}
		},
		hideSort:function(){
		}
	});
});