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
    this.load.html('chatform', 'assets/text/form_chat.html');
    this.load.html('nameform', 'assets/text/form_name.html');
}

let scene;

function create(){

	scene = this;
    this.playerMap = {};
    this.map = this.add.tilemap('map');
    let tileset = this.map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    let layer;
    for(let i = 0; i < this.map.layers.length; i++) {
        layer = this.map.createStaticLayer(i, tileset);
    }
    layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
    this.input.on('pointerup', getCoordinates, this);

    // Add chat form
    this.add.dom(24*32 - 100, 17*32 - 20).createFromCache('chatform');
    // Add name form
    nameform = this.add.dom(100, 17*32 - 20).createFromCache('nameform');

    let keyObj = scene.input.keyboard.addKey('ENTER');
    keyObj.on('up', function() {
        let inputText = document.getElementById('chatField');
        if (inputText.value !== '') {
            sendChat(inputText.value);
            inputText.value = '';
        }

        inputText = document.getElementById('nameField');
        if (inputText.value !== '') {
            sendName(inputText.value);
            inputText.value = '';
            nameform.destroy();
        }
    });

 	Client.askNewPlayer();
}

sendName = function(text){
    Client.sendName(text);
};

sendChat = function(text){
    Client.sendChat(text);
};

getCoordinates = function(pointer){
    Client.sendClick(pointer.worldX, pointer.worldY);
};

addNewPlayer = function(id,x,y,name){
    scene.playerMap[id] = scene.add.container(x,y);
    let sprite = scene.add.sprite(0,0,'sprite');
	scene.playerMap[id].add(sprite);    
    
    // initialize playerObjects
    scene.playerMap[id].playerObjects = {
        text: null,
        timer: null,
        name: null
    };
    if (name != null) {
        namePlayer(id, name)
    }
};

movePlayer = function(id,x,y){
    let player = scene.playerMap[id];
    let distance = Phaser.Math.Distance.Between(player.x,player.y,x,y);
    let duration = distance*2;
    let dx = x - player.x;
    let dy = y - player.y;
    scene.tweens.add({
    	targets: player,
    	x: "+=" + dx,
    	y: "+=" + dy,
    	duration: duration
    });
};

function tweenAndRemoveObj(obj, duration) {
    scene.tweens.add({
        alpha: 0,
        targets: obj,
        duration: duration,
        onComplete: function(tween) {
            let obj = tween.targets[0];
            obj.destroy();
        }
    })
}

sayPlayer = function(id, text) {
    let player = scene.playerMap[id];
    let playerObjs = player.playerObjects;
    let style = { font: "14px Arial", fill: "#222222", align: "center"};
    if (playerObjs.text != null) {
        if (playerObjs.timer != null) {
            playerObjs.timer.remove();
            playerObjs.timer = null;
        }
        tweenAndRemoveObj(playerObjs.text, 10);
        playerObjs.text = null;
    }
    playerObjs.text = scene.add.text(0, 0, text, style);
    playerObjs.text.setOrigin(0.5, 2.5);
    player.add(playerObjs.text);

    let text_len = text.length;
    playerObjs.timer = scene.time.addEvent({
    	delay: 2000 + 1000 * text_len / 10,
    	callback: function() {
    		if (playerObjs.text != null) {
                tweenAndRemoveObj(playerObjs.text, 1500);
    		}
    	}
    });
};

namePlayer = function(id, text) {
    let player = scene.playerMap[id];
    let playerObjs = player.playerObjects;
    if (playerObjs.name != null) {
        playerObjs.name.destroy();
    }
    let style = { font: "11px Arial", fill: "#000000", align: "center"};
    playerObjs.name = scene.add.text(0, 0, text, style);
    playerObjs.name.setOrigin(0.5, -1.8);
    player.add(playerObjs.name);
};

removePlayer = function(id){
    scene.playerMap[id].destroy();
    delete scene.playerMap[id];
};