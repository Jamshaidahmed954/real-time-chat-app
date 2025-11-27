import { supabase } from "@/lib/supabase/client"
import type { Conversation, ConversationWithUser, Message, User } from "@/lib/types"

// Get all conversations for current user
export async function getConversations(userId: string) {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      creator:creator_id(*),
      participant:participant_id(*)
    `,
    )
    .or(`creator_id.eq.${userId},participant_id.eq.${userId}`)
    .order("updated_at", { ascending: false })

  if (error) throw error

  const conversationsWithDetails = await Promise.all(
    conversations.map(async (conv: any) => {
      const { data: lastMessage } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Determine which user is the "other" user for the current userId
      const creatorUser = conv.creator
      const participantUser = conv.participant

      const otherUser = creatorUser?.id === userId ? participantUser : creatorUser

      return {
        ...conv,
        other_user: otherUser,
        last_message: lastMessage,
        unread_count: 0, // Can implement unread tracking
      }
    }),
  )

  return conversationsWithDetails as ConversationWithUser[]
}

// Get or create conversation with a user
export async function getOrCreateConversation(userId: string, participantId: string) {
  // Check if conversation exists
  const { data: existingConversation, error: fetchError } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `and(creator_id.eq.${userId},participant_id.eq.${participantId}),and(creator_id.eq.${participantId},participant_id.eq.${userId})`,
    )
    .single()

  if (!fetchError && existingConversation) {
    return existingConversation as Conversation
  }

  // Create new conversation
  const { data: newConversation, error: createError } = await supabase
    .from("conversations")
    .insert([
      {
        creator_id: userId,
        participant_id: participantId,
      },
    ])
    .select()
    .single()

  if (createError) throw createError
  return newConversation as Conversation
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:sender_id(id, name, avatar_url)
    `,
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return messages
}

// Send a message
export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const { data: message, error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        text,
      },
    ])
    .select(
      `
      *,
      sender:sender_id(id, name, avatar_url)
    `,
    )
    .single()

  if (error) throw error

  // Update conversation's updated_at
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)

  return message
}

// Subscribe to messages in a conversation
export function subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
  // Create a channel per conversation and subscribe to INSERT events
  const channel = supabase.channel(`messages-${conversationId}`)

  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload: any) => {
      // Forward the new row to caller
      try {
        callback(payload.new as Message)
      } catch (err) {
        console.error("Error in subscribeToMessages callback:", err)
      }
    },
  )

  // Subscribe and add debug logs so we can confirm other clients are actually subscribed
  // `subscribe()` returns a promise-like result; cast to any to attach then/catch for debugging
  try {
    ;(channel.subscribe() as any)
      .then(() => console.debug(`subscribed to messages-${conversationId}`))
      .catch((e: any) => console.warn(`subscribe error for messages-${conversationId}:`, e))
  } catch (e) {
    // Some runtimes may throw synchronously; log and proceed
    console.warn(`subscribe exception for messages-${conversationId}:`, e)
  }

  return channel
}

// Get all users except current user
export async function getAllUsers(currentUserId: string) {
  const { data: users, error } = await supabase.from("users").select("*").neq("id", currentUserId)

  if (error) throw error
  return users as User[]
}

// Get single user by id
export async function getUserById(userId: string) {
  const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()
  if (error) throw error
  return user as User
}

// Update user status
export async function updateUserStatus(userId: string, status: "online" | "away" | "offline") {
  const { error } = await supabase.from("users").update({ status }).eq("id", userId)

  if (error) throw error
}

// Typing indicator functions
export function startTyping(conversationId: string, userId: string) {
  const channel = supabase.channel(`typing-${conversationId}`)
  channel.subscribe()
  channel.track({ user_id: userId, is_typing: true })
  return channel
}

export function stopTyping(channel: any) {
  channel.untrack()
}

export function subscribeToTyping(conversationId: string, callback: (typingUsers: string[]) => void) {
  const channel = supabase.channel(`typing-${conversationId}`)

  channel.on('presence', { event: 'sync' }, () => {
    const presenceState = channel.presenceState()
    const typingUsers = Object.values(presenceState).flat().map((state: any) => state.user_id)
    callback(typingUsers)
  })

  channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
    const typingUsers = newPresences.map((p: any) => p.user_id)
    callback(typingUsers)
  })

  channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    const typingUsers = leftPresences.map((p: any) => p.user_id)
    callback(typingUsers)
  })

  channel.subscribe()
  return channel
}
