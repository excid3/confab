var irc = require("./lib/irc.js");

options = 
    { server: 'irc.freenode.net'
    , port: 6667
    , encoding: 'ascii'
    , nick: 'excid3|node'
    , ssl: false
    }

client = new irc(options);
client.connect(function() {
    client.join("#excid3");
});

client.addListener('001', function(msg) {
    console.log(msg);
});
