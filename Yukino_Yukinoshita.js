const Discord = require('discord.js');
const logger = require('winston');
const fs = require('fs');
const mail = require('nodemailer');
const express = require('express');
const http = require('http');
const query = require('querystring');
const CommandHandler = require('./strategy/CommandHandler');

const auth = require('./auth.json');

const commandHandler = new CommandHandler({rssHandle: newItemHandler, issueHandle: createDiscordMessage});
const client = new Discord.Client({ autoReconnect: true });
const webpage = express();
const port = 7777;

const transporter = mail.createTransport({
  service: 'gmail',
  auth: {
    user: 'h.k.h94539@gmail.com',
    pass: ''
  }
});

const mailOptions = {
  from: 'h.k.h94539@gmail.com',
  to: 'euphokumiko.iem06@nctu.edu.tw',
  subject: 'BotInfo',
  text: 'That was easy!'
};

client.login(auth.token);

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

webpage.listen(port, function() {
  console.log('running on port ' + port);
});

webpage.get('/', function(req, res) {
  let string = '';
  for (let r = 0; r < BotInfo.length; r ++) {
    string += '<h1>' + BotInfo[r].name + '</h1>' + '\n';
    for (let y = 0; y < BotInfo[r].content.length; y ++) {
      string += '<h3>' + BotInfo[r].content[y] + '</h3>' + '\n';
    }
  }
  res.send(string);
});


// 以上不解釋

function updateBotInfo(BotInfo) {
  fs.writeFile('BotInfo.json', JSON.stringify(BotInfo, null, '\t'), 'utf-8', function(err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

function forbid(channel)// 禁止的頻道
{
  return !((channel.name == 'hall') || (channel.name == 'lobby') || (channel.name == 'plans-rule-suggestion'));
}

client.on('ready', function(evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(client.user.username + ' - (' + client.user.id + ')');
  commandHandler.processCommand('initRssSenders', {client: client, message: null});
});

client.on('message', (message) => {
  if (message.content.substring(0, 2) == '%%' && forbid(message.channel)) {
    let userName = (message.member.nickname == null) ? message.author.username : message.member.nickname;
    logger.info(`${userName}在${message.channel}說${message.content}`);

    createDiscordMessage(commandHandler.processCommand(message.content.split('%%')[1], {client: client, message: message}), message.channel);
  }
});

function createDiscordMessage(dataArray, channel) {
  let embed;
  dataArray.forEach((data) => {
    if (data.image) {
      embed = new Discord.RichEmbed()
        .setImage(data.content);
    }
    else if (data.embed) {
      embed = new Discord.RichEmbed()
        .setTitle('message')
        .setThumbnail('http://i.imgur.com/T4y0egb.jpg')
        .addField('雪乃が教えてあげる', data.content)
        .setFooter('比企谷雪乃')
        .setTimestamp();
      if (data.extra !== undefined) {
        embed = embed.addField('雪乃からの伝言', data.extra);
      }
    }
    else {
      embed = data.content;
    }
    channel.send(embed);
  });
}

// this: object from emiter's caller --> RssFeedFilter
function newItemHandler(item) {
  if (this.checkItem(item)) {
    createDiscordMessage([{embed: true, image:false, content: `${item.title}\n${item.link}`}], this.channel);
  }
}
