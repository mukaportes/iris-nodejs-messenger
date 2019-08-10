const Logger = require('@naturacosmeticos/clio-nodejs-logger');

const ClientFactory = require('../../../common/aws/client-factory');
const MessageBusError = require('../../../common/errors/message-bus-error');
const errorMessages = require('../../../common/errors/messages');
const CompressEngine = require('../../../util/compress-engine');
const CorrelationEngine = require('../../util/correlation-engine/correlationEngine');

/**
 * AWS SNS publisher
 */
class MessageBus {
  /**
   * @param {Array} friendlyNamesToArn - A map of the friendly queue name to ARN
   * @param {String} compressEngine - String defining the compress engine
   */
  constructor(friendlyNamesToArn, compressEngine) {
    /** @private */
    this.friendlyNamesToArn = friendlyNamesToArn;
    this.compressEngine = compressEngine || process.env.IRIS_COMPRESS_ENGINE;
  }

  /**
   * Publish a message in an AWS SNS topic
   * @param {string} friendlyName - The topic friendly name
   * @param {string} message - The message you want to publish
   */
  async publish(friendlyName, message) {
    const sns = ClientFactory.create('sns');
    const logger = Logger.current().createChildLogger('message-bus:send');

    const wrappedCorrelationIdMessage = CorrelationEngine.wrapMessage(message);
    let compressedMessage;

    try {
      compressedMessage = await CompressEngine.compressMessage(wrappedCorrelationIdMessage, this.compressEngine);
    } catch (error) {
      logger.error(`${errorMessages.messageBus.compress}, ${error}`);
      compressedMessage = wrappedCorrelationIdMessage;
    }

    try {
      logger.log('Sending message to SNS\nUnwrapped message', { message }, '\nWrapped message', wrappedCorrelationIdMessage);

      return await sns.publish({
        Message: JSON.stringify(compressedMessage),
        TopicArn: this.friendlyNamesToArn[friendlyName],
      }).promise();
    } catch (error) {
      logger.error(error);
      throw new MessageBusError(`${errorMessages.messageBus.unavailable}: ${error}`);
    }
  }
}

module.exports = MessageBus;
