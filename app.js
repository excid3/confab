var express = require('express'),
	app = express.createServer(),
	irc = require('irc-js'),
	io = require('./socket.io'),
	socket = io.listen(app);

require('jade');

var opts = {server: "irc.freenode.net",
			channels: ["#excid3"],
			nick: "WebIRC",
			maxMsgs: 1000};

var ircMessages = [];
var webClients = []; 
var server = new irc({ server: opts.server, nick: opts.nick });

server.connect(function() {
	setTimeout(function() {
		for(i in opts.channels) {
			server.join(opts.channels[i]);
		}
	}, 2000);
});

server.addListener('quit', function(msg) {
	nick = msg.person.nick;
	message = msg.params[0];

	var data = {channel: chan, from:nick, msg:message};

	console.log("IRC: Quit "+nick+":"+message+"\n");

});

server.addListener('privmsg', new_privmsg);

function new_privmsg(msg) {
	nick = msg.person.nick;
	chan = msg.params[0];
	message = msg.params[1];

	var data = {channel: chan, from:nick, msg:message};

	console.log("IRC: "+chan+" - "+nick+":"+message+"\n");

	for(i in opts.channels) {
		if(chan == opts.channels[i]) {
			ircMessages.push(data);

			if(webClients.length != 0) {
				for(i in webClients) {
						webClients[i].client.send(data);
				}
			}
		}
	}

	if(ircMessages.length >= opts.maxMsgs) 
		ircMessages = ircMessages.splice(0,1);
}

socket.on('connection', function(client){

	// Append new IRC viewer
	webClients.push({session:client.sessionId,client:client});
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



// Here's our express server!
app.use(express.bodyDecoder());
app.set('view engine', 'jade');
app.set('view options', {
	    layout: false
});

app.get('/', function(req, res){
	res.render('index');	
});

app.get('/*.*', function(req, res){res.sendfile("./static"+req.url);});

app.post('/', function(req, res){
	server.privmsg("#excid3", req.body.message);
	new_privmsg({person: {nick: opts.nick}, params: ["#excid3", req.body.message]}); 
	res.send();
});

app.listen(3000);
