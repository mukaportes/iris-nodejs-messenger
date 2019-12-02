const PubSubAmqpMessageBus = require('./amqp/message-bus');
const AwsSnsMessageBus = require('./aws/sns/message-bus');

/**
 * Message Bus Factory
 */
class MessageBusFactory {
  /**
   * Creates a MessageBus implementation, either of PubSubAmqpMessageBus or AwsSnsMessageBus
   * Pass the developmentMode option with a truthy value to use the message queue locally
   * @param {Object} options - Optional creation options
   */
  static create(options = {}, credentials) {
    if (options.developmentMode) {
      return MessageBusFactory.createAmqpBus(options.amqpOptions || {});
    }

    return MessageBusFactory.createAwsSnsBus(options.awsSnsOptions || {}, credentials);
  }

  /** @private */
  static createAmqpBus({ serverUrl }) {
    return new PubSubAmqpMessageBus(serverUrl || 'amqp://messaging-rabbitmq');
  }

  /** @private */
  static createAwsSnsBus({ friendlyNamesToArn }, credentials) {
    return new AwsSnsMessageBus(friendlyNamesToArn, undefined, credentials);
  }
}

module.exports = MessageBusFactory;
