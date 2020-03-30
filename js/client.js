/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y});
};

Client.sendChat = function(text){
  Client.socket.emit('chat',{text: text});
};

Client.sendName = function(text){
    Client.socket.emit('name',{text: text});
};

Client.socket.on('newplayer',function(data){
    addNewPlayer(data.id,data.x,data.y,data.name,data.sprite_int);
});

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        addNewPlayer(data[i].id,data[i].x,data[i].y,data[i].name,data[i].sprite_int);
    }

    Client.socket.on('move',function(data){
        movePlayer(data.id,data.x,data.y);
    });

    Client.socket.on('chat',function(data){
        sayPlayer(data.id,data.text);
    });

    Client.socket.on('name',function(data){
        namePlayer(data.id,data.text);
    });

    Client.socket.on('remove',function(id){
        removePlayer(id);
    });
});


