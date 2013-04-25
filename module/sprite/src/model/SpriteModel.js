define(function(require,exports,module){
	exports.SpriteModel = Backbone.Model.extend({
		defaults: function() {
			return {
				x:0,
				y:0,
				z:0,
				rotate:0,
				width: 0,
				height: 0,
				animation: 0,
			};
		}
	});

	exports.SpriteCollection = Backbone.Collection.extend({
		model: exports.SpriteModel,
	});
})
