const express = require("express");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http,{
    cors:{
        origin:"*"
    }
});

let users = {};

io.on("connection",socket=>{

    console.log("User Connected:",socket.id);

    // REGISTER USER
    socket.on("register",id=>{

        users[id]=socket.id;
        socket.userId=id;

        console.log(id+" registered");

    });

    // CALL USER
    socket.on("call-user",target=>{

        if(users[target]){

            console.log("Calling "+target);

            io.to(users[target]).emit("incoming-call",socket.userId);

        }

    });

    // OFFER
    socket.on("offer",(target,data)=>{

        if(users[target]){
            io.to(users[target]).emit("offer",data);
        }

    });

    // ANSWER
    socket.on("answer",(target,data)=>{

        if(users[target]){
            io.to(users[target]).emit("answer",data);
        }

    });

    // ICE
    socket.on("ice",(target,mid,index,candidate)=>{

        if(users[target]){
            io.to(users[target]).emit("ice",mid,index,candidate);
        }

    });

    // CALL REJECTED
    socket.on("call-rejected",(callerId)=>{

        if(users[callerId]){
            io.to(users[callerId]).emit("call-rejected");
        }

    });

    // END CALL
    socket.on("end-call",(target)=>{

        if(users[target]){
            io.to(users[target]).emit("end-call");
        }

    });

    socket.on("disconnect",()=>{

        console.log("User Disconnected");

        if(socket.userId){
            delete users[socket.userId];
        }

    });

});

const PORT = process.env.PORT || 3000;

http.listen(PORT,()=>{
    console.log("✅ Server running on port "+PORT);
});