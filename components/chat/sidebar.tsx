"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getConversations } from "@/lib/supabase/chat"
import type { ConversationWithUser } from "@/lib/types"
import { supabase } from "@/lib/supabase/client"

interface SidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
}

export default function Sidebar({ selectedChat, onSelectChat }: SidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState<ConversationWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadConversations = async () => {
      try {
        setIsLoading(true)
        const data = await getConversations(user.id)
        setConversations(data)
      } catch (error) {
        console.error("Error loading conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()

    // Subscribe to conversation updates
    const channel = supabase.channel(`conversations-${user.id}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "conversations",
      },
      () => {
        loadConversations()
      },
    )

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const filteredChats = conversations.filter((chat) =>
    chat.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-full max-w-xs h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <Link href="/profile" className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sidebar-primary-foreground font-bold hover:shadow-lg transition-shadow">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-sidebar-foreground text-sm hover:text-primary transition-colors">
                {user?.name}
              </h2>
              <p className="text-xs text-sidebar-accent-foreground">{user?.status}</p>
            </div>
          </Link>
          <div className="flex gap-1">
            <Link href="/settings">
              <button className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors" title="Settings">
                <svg className="w-5 h-5 text-sidebar-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c.426 1.756 2.924 1.756 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5 text-sidebar-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-accent-foreground"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-sidebar-accent-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sidebar-accent-foreground text-sm">Loading conversations...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-sidebar-accent-foreground text-sm">No conversations yet</div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3 rounded-lg transition-colors text-left group ${
                  selectedChat === chat.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <img
                      src={chat.other_user.avatar_url || "/placeholder.svg"}
                      alt={chat.other_user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-sidebar ${
                        chat.other_user.status === "online"
                          ? "bg-green-500"
                          : chat.other_user.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{chat.other_user.name}</p>
                    <p
                      className={`text-xs truncate ${selectedChat === chat.id ? "opacity-80" : "text-sidebar-accent-foreground"}`}
                    >
                      {chat.last_message?.text || "No messages yet"}
                    </p>
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {chat.unread_count}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent bg-transparent"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}
