const Discord = require('discord.js');
const logger = require('winston');
const mail = require('nodemailer');
const express = require('express');
const http = require('http');
const query = require('querystring');
const auth = require('./auth.json');
const RSSDiscordSender = require('./RSSDiscordSender');
const GithubIssues = require('./GithubIssues');
const CommandHandler = require('./strategy/CommandHandler.js');

const commandHandler = new CommandHandler();

const client = new Discord.Client({ autoReconnect: true });


const webpage = express();

const port = 7777;

const fs = require('fs');

const rssSenders = [];

const update = '已新增';


client.login(auth.token);

let BotInfo, RSSConfig;

let info;

let githubIssues;

const minNum = 0;

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

logger.remove(logger.transports.Console);

logger.add(logger.transports.Console, {
  colorize: true
});

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

logger.level = 'debug';

let highpricetime, lowquantime, pricerefresh, help;

// 以上不解釋

function readFile()// 讀取檔案
{
  BotInfo = fs.readFileSync('BotInfo.json', 'utf-8');
  RSSConfig = fs.readFileSync('RSSConfig.json', 'utf-8');
  BotInfo = JSON.parse(BotInfo);
  RSSConfig = JSON.parse(RSSConfig);
}

function updateBotInfo(BotInfo) {
  fs.writeFile('BotInfo.json', JSON.stringify(BotInfo, null, '\t'), 'utf-8', function(err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

function forbid(channel)// 禁止的頻道
{
  if ((channel.name == 'hall') || (channel.name == 'lobby') || (channel.name == 'plans-rule-suggestion')) {
    return true;
  }
}

function detect(user)// 僅限某些使用者使用
{
  if ((user !== '高價釋股通知') && (user !== 'papago89') && (user !== 'Euphokumiko') && (user !== '低量釋股通知') && (user !== '股價更新通知')) {
    return true;
  }
  else {
    return false;
  }
}

function match(K) {
  return K.match(/[^ ]+([\s\S]+)/)[1]; // [\s\S]+ ---> 所有字元包含換行有多少抓多少 ---> abc dddd ---> dddd
}

function reply(a, cmd, channel)// 推送訊息至頻道
{
  let flag = 0;
  switch (a) {
    case 2:// 讀取指令
      embed = new Discord.RichEmbed()
        .setTitle('message')
        .setThumbnail('http://i.imgur.com/T4y0egb.jpg')
        .setColor(3447003)
        .addField('雪乃からの伝言', BotInfo[2].content[random(BotInfo[2].content.length)])
        .addField('雪乃が教えてあげる', cmd)
        .setFooter('比企谷雪乃')
        .setTimestamp();
      break;

    case 3:// 圖片
      embed = new Discord.RichEmbed()
        .setImage(cmd);
      break;

    case 4:// say用，等待更新中
      embed = new Discord.RichEmbed()
        .setTitle('message')
        .setThumbnail('http://i.imgur.com/T4y0egb.jpg')
        .setColor(3447003)
        .addField('雪乃からの伝言', cmd)
        .setFooter('比企谷雪乃')
        .setTimestamp();
      break;

    case 5:// 叫人用
      embed = new Discord.RichEmbed()
        .setTitle('呼叫')
        .setThumbnail('http://i.imgur.com/T4y0egb.jpg')
        .setColor(3447003)
        .addField('雪乃が教えてあげる', cmd)
        .setFooter('比企谷雪乃')
        .setTimestamp();
      break;

    case 6:
      embed = '雪乃からの伝言:\n' + cmd;
      flag = 1;
      break;
  }
  if (flag) {
    channel.send(embed);
  }
  else {
    channel.send({ embed });
  }
}

function random(a)// 取亂數用
{
  const n = Math.floor(Math.random() * (a)) + minNum;

  return n;
}

client.on('ready', function(evt) {
  logger.info('Connected');

  logger.info('Logged in as: ');

  logger.info(client.user.username + ' - (' + client.user.id + ')');

  readFile();

  initRSSSenders();

  githubIssues = new GithubIssues();
});

function initRSSSenders() {
  rssSenders.forEach((rssSender) => {
    rssSender.destroy();
  });
  rssSenders.length = 0;
  RSSConfig.forEach((config) => {
    const channel = client.channels.get(config.channelId);
    const rssSender = new RSSDiscordSender(channel, config.filters, 60000);
    config.urlLists.forEach((url) => {
      rssSender.addList(url);
    });
    setTimeout(() => {
      rssSender.setNewItemHandler(newItemHandler);
    }, 20000);

    rssSenders.push(rssSender);
  });
}

// this: object from emiter's caller --> RSSFeedFilter
function newItemHandler(item) {
  if (this.checkItem(item)) {
    const message = `${item.title}
${item.link}`;

    const embed = new Discord.RichEmbed()
      .setTitle('news')
      .setThumbnail('http://i.imgur.com/T4y0egb.jpg')
      .setColor(3447003)
      .addField('雪乃からの伝言', message)
      .setFooter('比企谷雪乃')
      .setTimestamp();
    this.channel.send(embed);
  }
}


function writeNewConfigThenResetRSSSenders() {
  fs.writeFile('RSSConfig.json', JSON.stringify(RSSConfig, null, '\t'), 'utf-8', function(err) {
    if (err) throw err;
    console.log('Saved!');
  });
  initRSSSenders();
}

function issuesToMessage(issues) {
  return issues.slice(0, 10).reduce((str, issue) => {
    return `${str}${issue.number} : ${issue.title}\nCommets : ${issue.comments}\n${issue.url}\n\n`;
  }, '');
}

function commentsToMessage(comments) {
  return comments.slice(0, 10).reduce((str, comment) => {
    return `${str}${comment.body}\n${comment.url}\n\n`;
  }, '');
}

client.on('message', (message) => {
  if (message.content.substring(0, 2) == '%%') {
    const flag = false;
    let userName = (message.member.nickname == null) ? message.author.username : message.member.nickname;

    let lit = message.content.split('%%')[1]; // 將命令去除用來識別的!號 ---> !abc dddd ---> abc dddd

    let command = lit.split(/\s/)[0];// 找出命令的第一個斷點 以空白分開 ---> abc dddd ---> abc
    lit = lit.substr(command.length + 1);
    let type = lit.split(/\s/)[0];
    type = type.toLowerCase();
    const context = lit.substr(type.length + 1);
    command = command.toLowerCase();
    logger.info(`
            ${userName}在${message.channel}說${message.content}
            lit = ${lit}
            command = ${command}
            type = ${type}
            context = ${context}`);
    let R, overflow;

    switch (command) {
      case 'janken':// 猜拳模組,coding中

        random(3);

        break;

      case 'save':

        save(type, context, message.author.username, message.channel);

        break;

      case 'say':

        reply(6, type, message.channel);

        break;

      case 'setgame':

        client.user.setGame(type);

        break;

      case 'setrole':

        const myRole = message.guild.roles.find('name', context);

        const member = message.mentions.members.first();

        member.addRole(myRole).catch(console.error);

        break;

      case 'newrss':
        RSSConfig.push(JSON.parse(lit));
        writeNewConfigThenResetRSSSenders();
        /*
%%newRSS {
    "channelId": "432434726129631232",
    "urlLists": ["https://www.ptt.cc/atom/allpost.xml"],
    "filters": [{
        "regex": "[a-zA-Z0-9]",
        "type": "title"
    }]
}
        */
        break;
      case 'deleteotherrss':
        RSSConfig = new Array(RSSConfig[0]);
        writeNewConfigThenResetRSSSenders();
        break;
      case 'mail':

        break;

      case 'readfile':
        readFile();
        break;

      case 'issueslist':
        githubIssues.getIssuesHandler((issues) => {
          reply(2, issuesToMessage(issues), message.channel);
        });
        break;

      case 'commentslistfor':
        githubIssues.getCommentsHandler(type, (comments) => {
          reply(2, commentsToMessage(comments), message.channel);
        });

        break;

      case 'newissue':
        const issue = {
          'title': `${userName} - ${type}`,
          'body': `${userName}:\n${context}`
        };

        githubIssues.newIssueHandler(issue, (issues) => {
          reply(2, issuesToMessage(issues), message.channel);
        });
        break;

      case 'newcommentfor':
        const comment = {
          'body': `${userName}:\n${context}`
        };

        githubIssues.newCommentHandler(type, comment, (comments) => {
          reply(2, commentsToMessage(comments), message.channel);
        });
        break;

      default:
        if (forbid(message.channel)) {
          break;
        }
        createDiscordMessage(commandHandler.processCommand(message.content), message.channel);


        break;
    }
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
