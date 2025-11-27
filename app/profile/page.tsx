"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: "Software enthusiast and creative thinker",
        phone: "+1 (555) 123-4567",
      })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveChanges = () => {
    setIsEditing(false)
    // Here you would typically save to backend
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account information</p>
            </div>
            <Link href="/chat">
              <Button variant="outline">Back to Chat</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-primary"
                />
                <div>
                  <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2 w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Upload Photo
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    Remove Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Conversations</span>
                <span className="font-bold text-foreground">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Messages</span>
                <span className="font-bold text-foreground">456</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="font-bold text-foreground">2024</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-10 bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="h-10 bg-input border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-10 bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveChanges}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="border-0 shadow-lg mt-6">
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">Last login</p>
                  <p className="text-xs text-muted-foreground">Today at 2:30 PM from Chrome on macOS</p>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Change Password
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Two-Factor Authentication
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
