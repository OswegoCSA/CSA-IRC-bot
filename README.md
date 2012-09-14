CSA IRC bot
===========

The bot that monitors the CSA IRC channel. Feel free to fork it and add to it for any features you would like to see.

##Getting Started
Create a config.json using the provided config-template.json.
In config.json fill in the necessary fields.

  * `ident.password` is the ident password. (If your bot has a registered nick).

  * NPM module [nodemailer](https://github.com/andris9/Nodemailer) is being used for mailing. 
    * `mailer.user` and `mailer.pass` are your SMTP credentials for a SMTP relay. Default sevice is *Gmail*.    
    * More well known services are listed here: [https://github.com/andris9/Nodemailer#well-known-services-for-smtp]()

  * `notify.from` is your email, (where the emails will say they came from).
    * From field may be formatted as follows: `Charlie Brown <user@example.com>`
  * `notify.to` is the email where to send any notifications to.
  * `notify.subject` is the default subject field of any emails that will be sent.
  * `notify.textMessage` is true if you are sending the message as an sms.
  * `mailer.interval` is the minimum time in milliseconds before sending another email

##TODO:
  * Module hooks. --Create an app structure so new features can be added in easily with hooks.   
  * Database / json file storage. --To store anything the new features will need to store.   
  * Specific user notifications. --Any user in IRC will be able to register with the bot and receive notifications when they are away.    
  * Join / Part messages. --Send the channel log to a user who requests all the join / part messages.   

