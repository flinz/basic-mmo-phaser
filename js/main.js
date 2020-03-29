/**
 * Created by Jerome on 03-03-16.
 */
var config = {
    type: Phaser.AUTO,
    width: 24*32,
    height: 17*32,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create
    },
    parent: 'game',
    dom: {
	  createContainer: true
	},
    disableVisibilityChange: true
};

game = new Phaser.Game(config);

/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 */

function preload() {
    this.load.tilemapTiledJSON('map', 'assets/map/example_map.json');
    this.load.spritesheet('tileset', 'assets/map/tilesheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('sprite','assets/sprites/sprite.png');
    this.load.html('nameform', 'assets/text/form.html');
};

var scene;

function create(){

	scene = this;
    this.playerMap = {};
    this.map = this.add.tilemap('map');
    var tileset = this.map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < this.map.layers.length; i++) {
        layer = this.map.createStaticLayer(i, tileset);
    }
    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    this.input.on('pointerup', getCoordinates, this);

    element = this.add.dom(24*32 - 100, 17*32 - 20).createFromCache('nameform');

    var keyObj = scene.input.keyboard.addKey('ENTER');
    keyObj.on('up', function() {
    	var inputText = document.getElementById('nameField');
    	if (inputText.value !== '') {
    		sendChat(inputText.value)
    		inputText.value = '';	
    	}
    })

 	Client.askNewPlayer();
};

sendChat = function(text){
    Client.sendChat(text);
};

getCoordinates = function(pointer){
    Client.sendClick(pointer.worldX, pointer.worldY);
};

addNewPlayer = function(id,x,y){
    scene.playerMap[id] = scene.add.container(x,y);
    var sprite = scene.add.sprite(0,0,'sprite');
	scene.playerMap[id].add(sprite);    
    
    // initialize playerObjects
    scene.playerMap[id].playerObjects = {};
};

movePlayer = function(id,x,y){
    var player = scene.playerMap[id];
    var distance = Phaser.Math.Distance.Between(player.x,player.y,x,y);
    var duration = distance*2;
    var dx = x - player.x;
    var dy = y - player.y;
    var tween = scene.tweens.add({
    	targets: player,
    	x: "+=" + dx,
    	y: "+=" + dy,
    	duration: duration
    });
};

sayPlayer = function(id,text){
    var player = scene.playerMap[id];
    var style = { font: "14px Arial", fill: "#000000", align: "center"};
    if ("text" in player.playerObjects && player.playerObjects["text"] != null) {
        player.playerObjects["text"].destroy();
    }
    player.playerObjects["text"] = scene.add.text(0, 0, text, style);
    player.playerObjects["text"].setOrigin(0.5, 2.5);
    player.add(player.playerObjects["text"]);

    var textlen = text.length;
    scene.time.addEvent({
    	delay: 2000 + 1000 * textlen / 10,
    	callback: function() {

    		var obj = player.playerObjects["text"];
    		if (obj == null) { return true };

        	scene.tweens.add({
	        	alpha: 0,
	        	targets: obj,
	        	duration: 1500,
	        	onComplete: function(tween) {
	        		var obj = tween.targets[0];
	        		if (obj != null) {
	        			player.remove(obj);
	        			player.playerObjects["text"] = null
	        			obj.destroy();	
	        		}
	        	}
        	})
    	}
    });
};

removePlayer = function(id){
    scene.playerMap[id].destroy();
    delete scene.playerMap[id];
};