const Strategy = ('./Strategy');

class SayStrategy extends Strategy.constructor {
  constructor() {
    super();
  }

  processCommand(commandMessage, discordObject, handler) {
    return [{
      embed: false,
      image: false,
      content: commandMessage.lit
    }];
  }
}

module.exports = SayStrategy;
