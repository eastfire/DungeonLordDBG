seajs.config({
  preload: [
    'plugin-text','plugin-json'
  ],
  debug: false,
  charset: 'utf-8',
  timeout: 20000
});


define(function(require,exports,module){
//	var AppView = require("../module/main/src/app-view").AppView;
//	window.game = new AppView({el:"#game1"});
	$("#game1").hide();
	var AppView = require("../module/main/src/cover").AppView;
	window.cover = new AppView({el:"#cover"});
});
