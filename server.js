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


// Mailer =======================================================
var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: config.mailer.service,
    auth: {
    	//name: "client server name",
        user: config.mailer.user,
        pass: config.mailer.pass
    }
});

// setup e-mail data with unicode symbols
function mailOptions(message) {
	return {
	    from: config.notify.from, // sender address
	    to: config.notify.to, // list of receivers
	    //replyTo: "" // replyTo address - don't really need it
	    subject: config.notify.subject || "IRC", // Subject line
	    text: message || "You got an irc message", // plaintext body
	    html: message || "You got an irc message" // html body	    
	}	
}

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

bot.on('message#', function (nick, to, message, raw) {
    //console.log('<%s> %s', from, message);
    if(message.match(/poorman/)){
    	// send me an email or something
    	console.log("got a message for me");
		bot.emit('notify', message);
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

bot.on('notify', function(message)){
	var mailOpts = mailOptions(message);	
	var subjectSize = mailOpts.subject.length + 3; // 3 for 2 paren and a space for the subject
	var charLimit = 140;
	var chunkSize = charLimit - subjectSize;
	var re = new RegExp(".{1," + chunkSize + "}", "g");
	var chunks = message.match(re);
	smtpTransport.sendMail(mailOptions(message), function(error, response){
		if(error){
			console.log(error);
		}else{
			console.log("Message sent: " + response.message);
		}

	    // if you don't want to use this transport object anymore, uncomment following line
	    //smtpTransport.close(); // shut down the connection pool, no more messages
	});
});

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