'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
const supabase = getSupabaseBrowserClient()
import { Building2, Lock, Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  const [tokenChecking, setTokenChecking] = useState(true)

  useEffect(() => {
    // Check if there's a valid reset token in the URL
    async function checkToken() {
      try {
        // Get the current session to see if reset token exists
        const { data: { session } } = await supabase.auth.getSession()

        // If no session with reset context, the token might be invalid
        // We'll let the updateUser call handle the validation
        setTokenChecking(false)
      } catch (err) {
        console.error('Token check error:', err)
        setTokenChecking(false)
      }
    }

    checkToken()
