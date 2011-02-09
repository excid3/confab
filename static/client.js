var channelList = [];

function update(msg) 
{
	for(i in channelList) {
		if(channelList[i] == msg.channel)
			$("#chat").append("&lt;"+msg.from+"&gt; "+scanMsg(msg.msg)+"<br/>");
		
		scroll(i);
	}
	
}

function updateAll(list)
{
	for(i in list) {
		for(j in channelList) {
			if(channelList[j] == list[i].channel)
				$("#chat").append("&lt;"+list[i].from+"&gt; "+scanMsg(list[i].msg)+"<br/>");
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
	$("#new_message").submit(function() {
		var msg = $("input:first").val();
		if (msg != "") {
			$.post(window.location.pathname, $("#new_message").serialize());
			$("#new_message")[0].reset();
		}
		return false;
	});
}

function doPage() 
{
	var socket = new io.Socket();
	socket.connect();

	socket.on('connect', function() {
		socket.send(window.location.pathname);
	});

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
		io.setPath( ( window.location.protocol == "https:" ? "https://" : "http://" ) + "commondatastorage.googleapis.com/client/WebSocketMainInsecure.swf" );
		doPage();
	});
	$("input:first").focus();
});
