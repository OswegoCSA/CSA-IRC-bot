/*
 Oswego CSA IRC bot
 */
var fs = require("fs")
try {
  var config = JSON.parse(""+fs.readFileSync("config.json"));  
} catch (ex) {
	console.log('got an error: %s', ex);
    process.exit(1);
}


// Mailer ================================================================
var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: config.mailer.service,
    auth: {
    	//name: "client server name",
        user: config.mailer.user,
        pass: config.mailer.pass
    },
    maxConnections: 1
});
// END Mailer ============================================================

// setup e-mail data with unicode symbols
function mailOptions(message) {
	return {
	    from: config.notify.from, // sender address
	    to: config.notify.to, // list of receivers
	    //replyTo: "" // replyTo address - don't really need it
	    subject: config.notify.subject, // Subject line
	    text: message || "You got an irc message", // plaintext body
	    html: message || "You got an irc message" // html body	    
	}	
}

// This is just a mail queue that will check every 5 seconds 
// and send the message if there is any
var mailQueue = [];
function sendMail(){
	if(mailQueue.length != 0){		
	    var message = mailQueue.shift();
		smtpTransport.sendMail(message, function(error, response){
			if(error){
				console.log(error);
				// add the message back to the queue cause to try again later
				mailQueue.push(message);
			}else{
				console.log("Message sent: " + response.message);
			}
		    
		    // I have to close it every time because the messages arrive out of order. 
		    // If anyone has a better solution send a pull request.
		    // if you don't want to use this transport object anymore, uncomment following line
		    smtpTransport.close(); // shut down the connection pool, no more messages
		})
	}
}
setInterval(function(){ sendMail() }, 10000);

/*
* To set the key/cert explicitly, you could do the following
var fs = require('fs');

var options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('certificate.crt')
};
*/

var irc = require('irc');
var bot = new irc.Client(config.options.server, config.options.nick, config.options);

bot.on('message#', function (from, to, message, raw) {
    //console.log('<%s> %s', from, message);
    if(message.match(/poorman/)){
    	// send me an email or something
    	console.log("got a message for me");    	
		bot.emit('notify', message, from);
    }
});

bot.on('message', function (from, to, message) {
    console.log('%s => %s: %s', from, to, message);

    if ( to.match(/^[#&]/) ) {
        // channel message
        if ( message.match(/hello/i) ) {
            bot.say(to, 'Hello there ' + from);
        }
    }
    else {
        // private message        
    }
});

bot.on('notice', function (nick, to, text, message) {
	if(nick === 'NickServ'){
		// msg from nickserv		
		if(text.match(/This nickname is registered. Please choose a different nickname/)){
			// asking for ident
			bot.emit('identify');
		}
	}    
});

bot.on('identify', function () {
	bot.say('NickServ', 'identify ' + config.ident.password);
});


bot.on('error', function(message) {
    console.error('ERROR: %s: %s', message.command, message.args.join(' '));
});

bot.on('notify', function(message, from){
	//var chunkedMailOpts = [];
	var userTag = '[' + from + ']> ';
	if(config.notify.textMessage){		
		var subjectSize = config.notify.subject.length + 3; // 3 for 2 paren and a space for the subject
		var charLimit = 140;
		var chunkSize = charLimit - subjectSize - userTag.length;
		var re = new RegExp('.{1,' + chunkSize + '}\\W', "g");
		var chunks = message.match(re);
		for(var i = 0; i < chunks.length; i++){
			mailQueue.push(mailOptions(userTag + chunks[i]));
		}
	} else {
		mailQueue.push(mailOptions(userTag + message));
	}
})

// See http://node-irc.readthedocs.org/en/latest/API.html#events

// bot.on('pm', function (nick, message) {
//     console.log('Got private message from %s: %s', nick, message);
// });

// bot.on('join', function (channel, who) {
//     console.log('%s has joined %s', who, channel);
// });

// bot.on('part', function (channel, who, reason) {
//     console.log('%s has left %s: %s', who, channel, reason);
// });

// bot.on('kick', function (channel, who, by, reason) {
//     console.log('%s was kicked from %s by %s: %s', who, channel, by, reason);
// });