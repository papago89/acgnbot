const Strategy = ('Strategy.js');

const imageRegex = /http[s]?:\/\/.+\.((jpeg)|(jpg)|(png)|(gif)|(bmp))/;

function contentIsImg(content) {

  return content.match(imageRegex) !== null;
}

function findInfo(target, infoArray) {
  return infoArray.find((element) => {

    return element.name === target;
  });
}

function random(n) {

  return Math.floor(Math.random() * (n));
}

class OtherStrategy extends Strategy.constructor {
  constructor() {
    super();
    this.commandFunction = {};
    this.commandFunction['roll'] = (commandMessage, handler) => {
      let result = [];

      if (Number(commandMessage.context) > 11) {
        result.push({
          embed: true,
          image: false,
          content: '你有病嗎？沒空幫你骰這麼多次。當我很閒？'
        });

        return result;
      }
      for (let i = 0; i < Number(commandMessage.context); i ++) {
        result.push(this.commandFunction['infoSelect'](commandMessage.type, handler)[0]);
      }

      return result;
    };

    this.commandFunction['mumi'] = (commandMessage, handler) => {
      let commandInfo;

      if (commandMessage.context === null) {

        return [{
          embed: true,
          image: false,
          content: handler.botInfo[1].content[0]
        }];
      }
      
      commandInfo = findInfo(commandMessage.type, handler.botInfo);
      if (commandInfo === undefined) {
        handler.botInfo.push({
          'name': commandMessage.type,
          'content': [
            commandMessage.context
          ]
        });
      }
      else {
        commandInfo.content.push(commandMessage.context);
      }
      handler.updateBotInfo();

      return [{
        embed: true,
        image: false,
        content: `已新增 ${commandMessage.type}`
      }];
    };

    this.commandFunction['infoSelect'] = (command, handler) => {
      let commandInfo = findInfo(command, handler.botInfo);
      let content;

      if (commandInfo === undefined) {
        content = handler.botInfo[1].content[0];
      }
      else {
        content = commandInfo.content[random(commandInfo.content.length)];
      }

      return [{
        embed: commandInfo !== undefined,
        image: contentIsImg(content),
        content: content,
        extra: handler.botInfo[2].content[random(handler.botInfo[2].content.length)]
      }];
    };
  }
  processCommand(commandMessage, discordObject, handler) {
    if (this.commandFunction[commandMessage.command] !== undefined) {

      return this.commandFunction[commandMessage.command](commandMessage, handler);
    }

    return this.commandFunction['infoSelect'](commandMessage.command, handler);
  }
}

module.exports = OtherStrategy;
