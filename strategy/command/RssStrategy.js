const Discord = require('discord.js');
const Strategy = ('./Strategy');
const RssDiscordSender = require('../../Rss/RssDiscordSender');

// this: object from emiter's caller --> RssFeedFilter
function newItemHandler(item) {
  if (this.checkItem(item)) {
    const message = `${item.title}\n${item.link}`;

    const embed = new Discord.RichEmbed()
      .setTitle('news')
      .setThumbnail('http://i.imgur.com/T4y0egb.jpg')
      .setColor(3447003)
      .addField('雪乃が教えてあげる', message)
      .setFooter('比企谷雪乃')
      .setTimestamp();
    this.channel.send(embed);
  }
}

const rssSenders = [];

class RssStrategy extends Strategy.constructor {
  constructor() {
    super();
    this.commandFunction = {};
    this.commandFunction['newrss'] = (commandMessage, discordObject, handler) => {
/*
%%newRss {
    "channelId": "432434726129631232",
    "urlLists": ["https://www.ptt.cc/atom/allpost.xml"],
    "filters": [{
        "regex": "[a-zA-Z0-9]",
        "type": "title"
    }]
}
*/
      handler.rssConfig.push(JSON.parse(commandMessage.lit));
      handler.updateJsonFile();
      this.commandFunction['initrsssenders'](commandMessage, discordObject, handler);

      return [{
        embed: true,
        image: false,
        content: '已新增訂閱資料'
      }];
    };

    this.commandFunction['deleteotherrss'] = (commandMessage, discordObject, handler) => {
      handler.rssConfig = new Array(handler.rssConfig[0]);
      handler.updateJsonFile();
      this.commandFunction['initrsssenders'](commandMessage, discordObject, handler);

      return [{
        embed: true,
        image: false,
        content: '已刪除除股市提案外所有訂閱資料'
      }];
    };

    this.commandFunction['initrsssenders'] = (commandMessage, discordObject, handler) => {
      rssSenders.forEach((rssSender) => {
        rssSender.destroy();
      });
      rssSenders.length = 0;
      handler.rssConfig.forEach((config) => {
        const channel = discordObject.client.channels.get(config.channelId);
        const rssSender = new RssDiscordSender(channel, config.filters, 60000);
        config.urlLists.forEach((url) => {
          rssSender.addList(url);
        });
        setTimeout(() => {
          rssSender.setNewItemHandler(newItemHandler);
        }, 20000);

        rssSenders.push(rssSender);
      });

      return [];
    };
  }

  processCommand(commandMessage, discordObject, handler) {

    return this.commandFunction[commandMessage.command](commandMessage, discordObject, handler);
  }
}
module.exports = RssStrategy;
