const express = require("express");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http,{
    cors:{ origin:"*" }
});

let users = {};
let calls = {};   // store active calls

io.on("connection",socket=>{

    console.log("User Connected:",socket.id);

    // REGISTER
    socket.on("register",id=>{

        users[id] = socket.id;
        socket.userId = id;

        console.log(id + " registered");

    });

    // CALL USER
    socket.on("call-user",target=>{

        if(users[target]){

            // store caller
            calls[target] = socket.userId;

            io.to(users[target]).emit("incoming-call",socket.userId);

        }

    });

    // OFFER
    socket.on("offer",data=>{
        socket.broadcast.emit("offer",data);
    });

    // ANSWER
    socket.on("answer",data=>{
        socket.broadcast.emit("answer",data);
    });

    // ICE
    socket.on("ice",(mid,index,candidate)=>{
        socket.broadcast.emit("ice",mid,index,candidate);
    });

    // REJECT CALL
    socket.on("call-rejected",()=>{

        let caller = calls[socket.userId];

        if(caller && users[caller]){

            io.to(users[caller]).emit("call-rejected");

        }

        delete calls[socket.userId];

    });

    // END CALL
    socket.on("end-call",target=>{

        if(users[target]){
            io.to(users[target]).emit("end-call");
        }

    });

    socket.on("disconnect",()=>{

        if(socket.userId){
            delete users[socket.userId];
        }

        console.log("User Disconnected");

    });

});

const PORT = process.env.PORT || 3000;

http.listen(PORT,()=>{
    console.log("Server running on port "+PORT);
});