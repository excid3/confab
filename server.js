var app = require("express").createServer(),
    irc = require("irc-js"),
    io = require("socket.io"),
    socket = io.listen(app);

server = new irc({server: "irc.freenode.net", nick: "excid3|bot"});
server = new irc({server: "irc.freenode.net", nick: "something"});
/*
require("jade");

app.set("view engine", "jade");
app.set("view options", {layout:false});
app.get("/", function(req, res){ res.render("index"); });
app.get("/chat", function(req, res){ res.render("chat"); });
app.get("/*.*", function(req, res){ res.sendfile("./static"+req.url); });
app.listen(8080);

// socket.io, I choose you
// simplest chat application evar
var buffer = [];
  
socket.on('connection', function(client){
  client.send({ buffer: buffer });
  client.broadcast({ announcement: client.sessionId + ' connected' });
  
  client.on('message', function(message){
    var msg = { message: [client.sessionId, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast(msg);
  });

  client.on('disconnect', function(){
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
});
*/
