var channelList = [];

function update(msg) 
{
	for(i in channelList) {
		if(channelList[i] == msg.channel) {
			var li = $("<div />", {text: "<"+msg.from+"> "+scanMsg(msg.msg)});
			$("#chat").append(li);

		}
		
		scroll(i);
	}
	
}

function updateAll(list)
{
	for(i in list) {
		for(j in channelList) {
			if(channelList[j] == list[i].channel) {
				var li = $("<div />", {text: "<"+list[i].from+"> "+scanMsg(list[i].msg)});
				$("#chat").append(li);
			}
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
	$("#chat").scrollTop(9999999);
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
