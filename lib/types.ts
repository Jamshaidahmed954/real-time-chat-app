export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  status: "online" | "away" | "offline"
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  creator_id: string
  participant_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  created_at: string
  updated_at: string
}

export interface ConversationWithUser extends Conversation {
  other_user: User
  last_message?: Message
  unread_count: number
}
