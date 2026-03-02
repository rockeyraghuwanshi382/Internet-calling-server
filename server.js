const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let users = {};

io.on("connection", socket => {

    console.log("User Connected:", socket.id);

    // REGISTER USER
    socket.on("register", id => {
        users[id] = socket.id;
        console.log(id + " registered");
    });

    // CALL REQUEST
    socket.on("call-user", target => {
        if (users[target]) {
            console.log("Calling " + target);
            io.to(users[target]).emit("incoming-call");
        }
    });

    // OFFER
    socket.on("offer", data => {
        socket.broadcast.emit("offer", data);
    });

    // ANSWER
    socket.on("answer", data => {
        socket.broadcast.emit("answer", data);
    });

    // ICE CANDIDATE RELAY ⭐ IMPORTANT
    socket.on("ice", (mid, index, candidate) => {
        socket.broadcast.emit("ice", mid, index, candidate);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });

});

http.listen(3000, () => {
    console.log("✅ Server running on port 3000");
});