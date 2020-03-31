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

let sprite_n = 16;
let sprite_n_row = 8;
let sprite_width = 3;
let sprite_height = 4;
let sprite_row_up = 3;
let sprite_row_left = 1;
let sprite_row_right = 2;

function preload() {
    this.load.tilemapTiledJSON('map', 'assets/map/example_map.json');
    this.load.spritesheet('tileset', 'assets/map/tilesheet.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('sprite','assets/sprites/sprite.png');
    this.load.html('chatform', 'assets/text/form_chat.html');
    this.load.html('nameform', 'assets/text/form_name.html');

    this.load.spritesheet('sprites',
        'assets/sprites/characters/sprites_finalbossblues_larger_all.png',
        { frameWidth: 78, frameHeight: 108 });
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

    for (let sprite_int=0; sprite_int<sprite_n; sprite_int++) {

        let sprite_name = 'sprite_' + sprite_int;
        console.log('sprite config: ' + sprite_int);
        console.log(sprite_name);
        let sprite_row = Math.floor(sprite_int/sprite_n_row);
        let sprite_col = (sprite_int % sprite_n_row);

        console.log('row_offset: ' + sprite_row);
        console.log('col_offset: ' + sprite_col);

        let frame_down = sprite_row * sprite_height * sprite_width * sprite_n_row + sprite_col * sprite_width;
        let frame_up = frame_down + sprite_row_up * (sprite_width * sprite_n_row);
        let frame_left = frame_down + sprite_row_left * (sprite_width * sprite_n_row);
        let frame_right = frame_down + sprite_row_right * (sprite_width * sprite_n_row);

        console.log('down: ' + frame_down);
        console.log('up: ' + frame_up);
        console.log('left: ' + frame_left);
        console.log('right: ' + frame_right);

        // sprites
        scene.anims.create({
            key: sprite_name + '_idle',
            frames: scene.anims.generateFrameNumbers('sprites', {frames: [frame_down+1,frame_down+1,frame_down+1,frame_down]}),
            frameRate: 1,
            repeat: -1
        });
        scene.anims.create({
            key: sprite_name + '_left',
            frames: scene.anims.generateFrameNumbers('sprites', {frames: [frame_left,frame_left+1,frame_left+2]}),
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: sprite_name + '_right',
            frames: scene.anims.generateFrameNumbers('sprites', {frames: [frame_right,frame_right+1,frame_right+2]}),
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: sprite_name + '_up',
            frames: scene.anims.generateFrameNumbers('sprites', {frames: [frame_up,frame_up+1,frame_up+2]}),
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: sprite_name + '_down',
            frames: scene.anims.generateFrameNumbers('sprites', {frames: [frame_down,frame_down+1,frame_down+2]}),
            frameRate: 8,
            repeat: -1
        });
    }

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

addNewPlayer = function(id,x,y,name,sprite_int){

    scene.playerMap[id] = scene.add.container(x,y);

    // initialize playerObjects
    scene.playerMap[id].playerObjects = {
        text: null,
        timer: null,
        name: null,
        sprite: null,
        sprite_int: sprite_int
    };

    let sprite = scene.add.sprite(0,0,'sprites');
    sprite.setScale(0.45);
    let sprite_name = 'sprite_' + sprite_int;
    sprite.anims.play(sprite_name + '_idle', true);
    scene.playerMap[id].playerObjects.sprite = sprite;
	scene.playerMap[id].add(sprite);    

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
    let anim;
    if (Math.abs(dx) > Math.abs(dy)) {
        anim = dx > 0 ? 'right' : 'left';
    } else {
        anim = dy < 0 ? 'up' : 'down';
    }
    let sprite_name = 'sprite_' + player.playerObjects.sprite_int;
    scene.tweens.add({
    	targets: player,
    	x: x,
    	y: y,
    	duration: duration,
        onStart: function () { player.playerObjects.sprite.anims.play(sprite_name + '_' + anim, true);},
        onComplete: function () { player.playerObjects.sprite.anims.play(sprite_name + '_idle', true);}
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
    let style = { font: "14px Arial", fill: "#111111", align: "center", strokeThickness: 3, stroke: '#dddddd', fontWeight: 'regular'};
    if (playerObjs.text != null) {
        if (playerObjs.timer != null) {
            playerObjs.timer.remove();
            playerObjs.timer = null;
        }
        tweenAndRemoveObj(playerObjs.text, 10);
        playerObjs.text = null;
    }
    playerObjs.text = scene.add.text(0, 0, text, style);
    playerObjs.text.setOrigin(0.5, 2.3);
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