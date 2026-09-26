import type {
  IncomingMessageWebhook,
  MessageData,
  NotificationBody,
} from '../types/greenApi'

export function isIncomingMessage(
  body: NotificationBody,
): body is IncomingMessageWebhook {
  return body.typeWebhook === 'incomingMessageReceived'
}

export function getMessageText(messageData: MessageData): string | undefined {
  return (
    messageData.textMessageData?.textMessage ?? messageData.extendedTextMessageData?.text
  )
}
