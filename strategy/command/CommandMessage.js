class CommandMessage {
  constructor(command, lit) {
    this.command = command;// 找出命令的第一個斷點 以空白分開 ---> abc dddd ---> abc
    this.lit = lit;
    this.type = this.lit.split(/\s/)[0].toLowerCase();
    this.context = this.lit.substr(this.type.length + 1);
  }
}

module.exports = CommandMessage;
