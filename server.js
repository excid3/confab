var express = require( 'express' ) ,
	irc = require( './lib/IRC-js/lib/irc.js' ),
	io = require( 'socket.io' ),
	require( 'jade' ),
	app = express.createServer() ,
	socket = io.listen(app);


var channels = ["#keryx"];
var clients = [];
var irc_events = ['join', 'kick', 'mode', 'nick', 'notice', 'part', 'privmsg', 'topic', 'quit'];

// Here's our express server!
app.use(express.bodyDecoder());
app.set('view engine', 'jade');
app.set('view options', { layout: false });

//app.get('/socket.io.js', function(req, res) {res.sendfile("./Socket.IO"+req.url);});
app.get('/*.*', function(req, res){res.sendfile("./static"+req.url);});

app.get("/:user", function(req, res) {
    if (!clients.hasOwnProperty(req.params.user)) {
		var server = new irc({server: "irc.freenode.net", nick: req.params.user});
		server.connect(connect);
		irc_events.forEach(function(e) { server.addListener(e, push_event) });
		server.messages = [];
		server.web_clients = [];
		server.channels = channels;
		clients[req.params.user] = server;
    }
    res.render("index", { locals: {username: req.params.user} });
});

app.post('/:user', function(req, res){
    if (clients.hasOwnProperty(req.params.user)) {
		var irc_client = clients[req.params.user];
		irc_client.privmsg(channels[0], req.body.message);
		res.send();
    }
});

app.listen(3000);

// IRC Client callbacks

function connect() {
    client = this;
    setTimeout(function() {
		for (i in channels) 
		    client.join(channels[i]);
    }, 2000);
};

function push_event(msg) {
    for (i in this.channels) {
		this.messages.push(msg);

		if (this.web_clients.length != 0) {
			for (i in this.web_clients)
				this.web_clients[i].send(msg);
		}
    }

    if (this.messages.length >= 1000)
		this.messsages = this.messages.splice(0,1);
}


socket.on('connection', function(client) {
    client.on('message', function(msg) {
	var user = msg.substr(1);

	if (clients.hasOwnProperty(user)) {
	    var irc = clients[user];
	    irc.web_clients.push(this);

	    client.send({msgs:irc.messages, channels:irc.channels});
	    console.log("ADDING USER :: "+user);
	}
    });

    client.on('disconnect', function() {
	console.log("remove this client "+this.sessionId);
    });
});

