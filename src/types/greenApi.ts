export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type StateInstance =
  'notAuthorized' | 'authorized' | 'blocked' | 'sleepMode' | 'starting' | 'yellowCard'

export interface GetStateInstanceResponse {
  stateInstance: StateInstance
}

export type CheckAccountParams = { phoneNumber: string } | { username: string }

export interface CheckAccountResponse {
  exist: boolean
  chatId?: string
  username?: string
  status?: boolean
  reason?: string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface SenderData {
  chatId: string
  chatName?: string
  senderName?: string
  senderContactName?: string
}

export interface MessageData {
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

export interface IncomingMessageWebhook {
  typeWebhook: 'incomingMessageReceived'
  timestamp: number
  idMessage: string
  senderData: SenderData
  messageData: MessageData
}

export type NotificationBody = IncomingMessageWebhook | { typeWebhook: string }

export interface Notification {
  receiptId: number
  body: NotificationBody
}
