const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});

let users = {};

io.on("connection", socket => {

    console.log("User Connected:", socket.id);

    // REGISTER USER
    socket.on("register", id => {
        users[id] = socket.id;
        console.log(id + " registered");
    });

    // CALL USER
    socket.on("call-user", target => {
        if (users[target]) {
            console.log("Calling " + target);
            io.to(users[target]).emit("incoming-call");
        } else {
            console.log("User not found:", target);
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

    // ICE CANDIDATES
    socket.on("ice", (mid, index, candidate) => {
        socket.broadcast.emit("ice", mid, index, candidate);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });
});


// ⭐ VERY IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log("✅ Server running on port " + PORT);
});
socket.on("end-call", () => {
    socket.broadcast.emit("end-call");
});