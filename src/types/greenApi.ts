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
  phoneNumber?: string | number
  // Может прийти вместе с HTTP 200, если проверка не выполнена
  status?: boolean
  reason?: string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface DeleteNotificationResponse {
  result: boolean
}

export interface InstanceData {
  idInstance: number
  wid: string
  typeInstance: string
}

export interface SenderData {
  chatId: string
  sender: string
  chatName?: string
  senderName?: string
  senderContactName?: string
}

export interface TextMessageData {
  textMessage: string
}

export interface ExtendedTextMessageData {
  text: string
  description?: string
  title?: string
}

export interface MessageData {
  typeMessage: string
  textMessageData?: TextMessageData
  extendedTextMessageData?: ExtendedTextMessageData
}

export interface IncomingMessageWebhook {
  typeWebhook: 'incomingMessageReceived'
  instanceData: InstanceData
  timestamp: number
  idMessage: string
  senderData: SenderData
  messageData: MessageData
}

// Остальные типы уведомлений (статусы, исходящие, смена состояния) приложению не нужны —
// они только удаляются из очереди
export interface OtherWebhook {
  typeWebhook: string
  [key: string]: unknown
}

export type NotificationBody = IncomingMessageWebhook | OtherWebhook

export interface Notification {
  receiptId: number
  body: NotificationBody
}
