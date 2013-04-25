define(function(require,exports,module){
	exports.CreatureModel = Backbone.Model.extend({
		defaults: function() {
			return {
				lastTime:0,
				att:0,
				def:0,
				speed:0,
				blockX: 0,
				blockY: 0,
				player: "",
				status: null,
				magicCard: null,
			};
		}
	});

	exports.CreatureCollection = Backbone.Collection.extend({
		model: exports.CreatureModel,
	});
})
