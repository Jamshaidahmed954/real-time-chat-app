"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    notificationsEmail: true,
    notificationsDesktop: true,
    notificationsPush: false,
    darkMode: false,
    onlineStatus: true,
    readReceipts: true,
  })
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")

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

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePasswordChange = () => {
    if (!newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all fields")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters")
      return
    }
    setPasswordMessage("Password updated successfully!")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Customize your chat experience</p>
            </div>
            <Link href="/chat">
              <Button variant="outline">Back to Chat</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <nav className="space-y-1 p-4">
                  <a
                    href="#notifications"
                    className="block px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
                  >
                    Notifications
                  </a>
                  <a
                    href="#privacy"
                    className="block px-4 py-3 rounded-lg hover:bg-muted text-foreground font-medium text-sm"
                  >
                    Privacy
                  </a>
                  <a
                    href="#account"
                    className="block px-4 py-3 rounded-lg hover:bg-muted text-foreground font-medium text-sm"
                  >
                    Account
                  </a>
                  <a
                    href="#security"
                    className="block px-4 py-3 rounded-lg hover:bg-muted text-foreground font-medium text-sm"
                  >
                    Security
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <Card id="notifications" className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <button
                    onClick={() => handleToggle("notificationsEmail")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      settings.notificationsEmail ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        settings.notificationsEmail ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Desktop Notifications</p>
                    <p className="text-xs text-muted-foreground">Show notifications on your desktop</p>
                  </div>
                  <button
                    onClick={() => handleToggle("notificationsDesktop")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      settings.notificationsDesktop ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        settings.notificationsDesktop ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Mobile push notifications</p>
                  </div>
                  <button
                    onClick={() => handleToggle("notificationsPush")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      settings.notificationsPush ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        settings.notificationsPush ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card id="privacy" className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Manage your privacy preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Show Online Status</p>
                    <p className="text-xs text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <button
                    onClick={() => handleToggle("onlineStatus")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      settings.onlineStatus ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        settings.onlineStatus ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Read Receipts</p>
                    <p className="text-xs text-muted-foreground">Show when you've read messages</p>
                  </div>
                  <button
                    onClick={() => handleToggle("readReceipts")}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                      settings.readReceipts ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        settings.readReceipts ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card id="security" className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 bg-input border-border"
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      passwordMessage.includes("successfully")
                        ? "bg-green-500/10 text-green-700"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {passwordMessage}
                  </div>
                )}

                <Button
                  onClick={handlePasswordChange}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Account */}
            <Card id="account" className="border-0 shadow-lg border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-background border border-destructive/20">
                  <p className="text-sm text-foreground mb-3">Logging out will end your current session</p>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-background border border-destructive/20">
                  <p className="text-sm text-foreground mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
