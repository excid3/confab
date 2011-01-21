var express = require('express'),
	app = express.createServer(),
	irc = require('irc-js'),
	io = require('socket.io'),
	socket = io.listen(app);

require('jade');

var channels = ["#excid3"];
var clients = [];

// Here's our express server!
app.use(express.bodyDecoder());
app.set('view engine', 'jade');
app.set('view options', {
	    layout: false
});

app.get('/*.*', function(req, res){res.sendfile("./static"+req.url);});

app.get("/:user", function(req, res) {
	if (!clients.hasOwnProperty(req.params.user)) {
		var server = new irc({server: "irc.freenode.net", nick: req.params.user});
		server.connect(connect);
		server.addListener('privmsg', privmsg);
		server.addListener('quit', quit);
		server.messages = [];
		server.web_clients = [];
		server.channels = channels;
		clients[req.params.user] = server;
	}
	res.render("index");
});

app.listen(3000);


// IRC Client callbacks

function connect() {
	client = this;
	setTimeout(function() {
		for (i in channels) {
			client.join(channels[i]);
		}
	}, 2000);
};

function quit(msg) {
	console.log("IRC: Quit "+msg.person.nick+":"+msg.params[0]+"\n");
}

function privmsg(msg) {
	var client = this;
	var nick = msg.person.nick;
	var chan = msg.params[0];
	var message = msg.params[1];

	var data={channel: chan, from:nick, msg:message};
	
	for (i in client.channels) {
		if (chan == client.channels[i]) {
			client.messages.push(data);

			if (client.web_clients.length != 0) {
				for (i in client.web_clients)
					client.web_clients[i].send(data);
			}
		}
	}

	if (client.messages.length >= 1000)
		client.messsages = client.messages.splice(0,1);
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
	// Append new IRC viewer
/*	webClients.push({session:client.sessionId,client:client});
	console.log("got a client :: "+client.sessionId+" :: "+webClients.length);

	// Send the channels and logs to the client
	client.send({msgs:ircMessages,channels: opts.channels});

	// When user disconnects, remove them
	client.on('disconnect', function(){ 
		for(i in webClients) {
			if(webClients[i].session == client.sessionId)
				webClients.splice(i,1);
		}
		console.log("disconnect");
	});
});


/*

app.get('/', function(req, res){
	res.render('index');	
});


app.post('/:user', function(req, res){
	server.privmsg("#excid3", req.body.message);
	new_privmsg({person: {nick: opts.nick}, params: ["#excid3", req.body.message]}); 
	res.send();
});
*/
