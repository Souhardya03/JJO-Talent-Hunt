"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Lock } from "lucide-react"
import { setAuthCookie } from "@/app/actions"

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // TODO: Replace this URL with your actual backend authentication endpoint
      const response = await fetch('https://e2li07xir9.execute-api.us-east-1.amazonaws.com/dev/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        
      })

      if (!response.ok) {
        throw new Error('Invalid email or password')
      }

      // Extract the token from the response (fallback to a basic string if your API doesn't return one yet)
      const data = await response.json().catch(() => ({}));
      const token = data.token || data.accessToken || 'authenticated';
      
      // Securely set the HttpOnly cookie using our Server Actio
      await setAuthCookie(token);

      router.push('/admin/registrations')

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Admin Access</CardTitle>
          <CardDescription>
            Enter your credentials to access the secure dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center font-medium border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-slate-700">Email Address</Label>
              <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 bg-slate-50 focus:bg-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-slate-700">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 bg-slate-50 focus:bg-white" />
            </div>
            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...</> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLogin
