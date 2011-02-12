var channelList = [];

function add_message(msg) {
	var cmd = msg.command;
	var text = '';
	
	if ( cmd === 'join' )
		text = msg.person.nick + ' (' + msg.person.host + ') joined the channel.';
	else if ( cmd === 'kick' )
		text = msg.person.nick + ' kicked ' + msg.params[1] + ' from the channel. (' + msg.params[2] + ')';
	else if ( cmd === 'mode' )
		text = msg.person.nick + ' sets mode ' + msg.params[1] + ' ' + msg.params[2];
	else if ( cmd === 'nick' )
		text = msg.person.nick + ' is now known as ' + msg.params[0];
	else if ( cmd === 'notice' )
		text = '-' + msg.person.nick + '- ' + msg.params[1];
	else if (cmd === 'part' )
		text = msg.person.nick + ' (' + msg.person.host + ') left the channel. (' + msg.params[1] + ')';
	else if ( cmd === 'privmsg' ) {
		var action = msg.params[1].split( ' ');
		if ( action[0] == '\u0001ACTION' )
			text = '* ' + msg.person.nick + ' ' + action.slice( 1 ).join( ' ' );
		else
			text = '<' + msg.person.nick + '> ' + msg.params[1];
	}
	else if ( cmd === 'topic' )
		text = msg.person.nick + ' has changed the topic to ' + msg.params[1];
	else if ( cmd === 'quit' )
		text = msg.person.nick + '(' + msg.person.host + ') left IRC. (' + msg.params[0] + ')';
	else
		text = msg;

	var d = new Date();
	var li = $("<div />", {text: "["+d.getHours()+":"+d.getMinutes()+"] " + text});
	$("#chat").append(li);
}

function update(msg) {
	for(i in channelList) {
		add_message(msg);
		scroll(i);
	}
	
}

function updateAll(list)
{
	for(i in list) {
		for(j in channelList) {
			//add_message(list[i]);
		}
	}

	for(i in channelList)
		scroll(i);
}

function scanMsg(msg) 
{
	var regex = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$]/i;

	return msg.replace(regex," <a href=\"$&\" target=\"_blank\">$&</a> ");
}

function scroll(i) 
{
	$(window).scrollTop(9999999);
}

function createChannels(list) 
{
	str = '<ul>';

	for(i in list) {
		str += '<li><a href="#">'+list[i]+'</a></li>';
	}

	str += '</ul>';
	$('#channels').append(str);

	str = '';

	/*for(i in list) {
		str += '<div id="tabs-'+i+'"><div id="messages'+i+'" class="messages"></div></div>';
	}*/
	$('#chat').append(str);

	/*$('#tabs').tabs({selected: 0, show: function() {
		for(i in channelList)
			scroll(i);
	}});*/
	$("input:first").focus();
	$("#message_form").submit(function() {
		var msg = $(this).serialize();
		$.post(window.location.pathname, msg.replace(/\+/g, " "));
		$(this)[0].reset();
		return false;
	});
}

function doPage() 
{
	var socket = new io.Socket();
	socket.connect();

	socket.on('connect', function() { socket.send(window.location.pathname); });

	socket.on('message', function(msg) {
		if(msg.channels != null) {
			channelList = msg.channels;				
			createChannels(msg.channels);
			updateAll(msg.msgs);
		} else {
			update(msg);
		}
	});
}

$(document).ready(function() {
	$.getScript("socket.io.js", function() {
		doPage();
	});
	$("input:first").focus();
});
