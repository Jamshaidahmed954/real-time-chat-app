"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Sidebar from "@/components/chat/sidebar"
import ChatWindow from "@/components/chat/chat-window"

export default function ChatPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      <ChatWindow chatId={selectedChat} currentUserId={user.id} />
    </div>
  )
}
