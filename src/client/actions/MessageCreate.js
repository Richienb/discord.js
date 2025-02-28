'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

let deprecationEmitted = false;

class MessageCreateAction extends Action {
  handle(data) {
    const client = this.client;
    const channel = this.getChannel(data);
    if (channel) {
      const existing = channel.messages.cache.get(data.id);
      if (existing) return { message: existing };
      const message = channel.messages.add(data);
      const user = message.author;
      const member = message.member;
      channel.lastMessageId = data.id;
      if (user) {
        user.lastMessageId = data.id;
        user.lastMessageChannelId = channel.id;
      }
      if (member) {
        member.lastMessageId = data.id;
        member.lastMessageChannelId = channel.id;
      }

      /**
       * Emitted whenever a message is created.
       * @event Client#messageCreate
       * @param {Message} message The created message
       */
      client.emit(Events.MESSAGE_CREATE, message);

      /**
       * Emitted whenever a message is created.
       * @event Client#message
       * @param {Message} message The created message
       * @deprecated Use {@link Client#messageCreate} instead
       */
      if (client.emit('message', message) && !deprecationEmitted) {
        deprecationEmitted = true;
        process.emitWarning('The message event is deprecated. Use messageCreate instead', 'DeprecationWarning');
      }

      return { message };
    }

    return {};
  }
}

module.exports = MessageCreateAction;
