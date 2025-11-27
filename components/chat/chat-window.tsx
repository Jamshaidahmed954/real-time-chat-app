"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMessages, sendMessage, subscribeToMessages, getUserById, startTyping, stopTyping, subscribeToTyping } from "@/lib/supabase/chat"

interface ChatWindowProps {
  chatId: string | null
  currentUserId: string
}

export default function ChatWindow({ chatId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [typingChannel, setTypingChannel] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!chatId) return

    const loadMessages = async () => {
      try {
        setIsLoading(true)
        const data = await getMessages(chatId)
        setMessages(data)
      } catch (error) {
        console.error("Error loading messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // load current user details for optimistic UI
    const loadCurrentUser = async () => {
      try {
        const user = await getUserById(currentUserId)
        setCurrentUser(user)
      } catch (err) {
        // ignore, optional
      }
    }

    loadMessages()
    loadCurrentUser()

    // Subscribe to real-time messages
    const subscription = subscribeToMessages(chatId, (newMessage) => {
      setMessages((prev) => {
        // Avoid duplicates if message already exists (optimistic or already added)
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
    })

    // Subscribe to typing indicators
    const typingSub = subscribeToTyping(chatId, (users) => {
      setTypingUsers(users.filter(id => id !== currentUserId))
    })

    setTypingChannel(typingSub)

    return () => {
      subscription.unsubscribe()
      typingSub.unsubscribe()
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatId || isSending) return

    const messageText = inputValue
    setInputValue("")
    setIsSending(true)

    // Stop typing when sending message
    if (typingChannel) {
      stopTyping(typingChannel)
    }

    try {
      // Optimistic UI: add temporary message so sender sees it immediately
      const tempId = `temp-${Date.now()}`
      const optimisticMessage = {
        id: tempId,
        conversation_id: chatId,
        sender_id: currentUserId,
        sender: currentUser || { id: currentUserId, name: "You", avatar_url: "/placeholder.svg" },
        text: messageText,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      const sent = await sendMessage(chatId, currentUserId, messageText)

      // Replace optimistic message with server message (match temp id)
      setMessages((prev) => {
        const replaced = prev.map((m) => (m.id === tempId ? sent : m))
        // Deduplicate by id, keeping the last occurrence
        const unique = Array.from(new Map(replaced.map((m) => [m.id, m])).values())
        return unique
      })
    } catch (error) {
      console.error("Error sending message:", error)
      setInputValue(messageText) // Restore input on error
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    if (!chatId || !currentUserId) return

    // Start typing
    if (typingChannel) {
      startTyping(chatId, currentUserId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (typingChannel) {
        stopTyping(typingChannel)
      }
    }, 3000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin">
              <div className="w-8 h-8 rounded-full border-4 border-muted border-t-primary"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender_id === currentUserId ? "flex-row-reverse" : ""}`}
            >
              <img
                src={message.sender?.avatar_url || "/placeholder.svg"}
                alt={message.sender?.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div
                className={`flex flex-col gap-1 max-w-xs ${message.sender_id === currentUserId ? "items-end" : "items-start"}`}
              >
                <p className="text-xs text-muted-foreground px-3">{message.sender?.name || "Unknown"}</p>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                </div>
                <p className="text-xs text-muted-foreground px-3">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        {typingUsers.length > 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1 max-w-xs items-start">
              <p className="text-xs text-muted-foreground px-3">
                {typingUsers.length === 1 ? "Someone is typing..." : `${typingUsers.length} people are typing...`}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0">
            <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 h-10 bg-input border-border"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-10"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99701575 L3.03521743,10.4380088 C3.03521743,10.5950961 3.19218622,10.7521935 3.50612381,10.7521935 L16.6915026,11.5377804 C16.6915026,11.5377804 17.1624089,11.5377804 17.1624089,12.0090725 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
