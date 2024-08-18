const express = require("express");
const path = require("path"); 
const app = express();

const socketio = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); 

io.on("connection", (socket) => {
    console.log("A user connected");

    // Broadcast location updates to all clients
    socket.on("send-location", (data) => {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Handle stop sharing event
    socket.on("stop-sharing", (data) => {
        console.log(`User ${data.id} has stopped sharing location`);
        // You might want to handle this event, such as updating the UI
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        io.emit("user-disconnected", socket.id);
        console.log("A user disconnected");
    });
});


app.get("/", function(req, res) {
    res.render("index");
});

server.listen(3000, function() {
    console.log("Server is running on port 3000");
});
