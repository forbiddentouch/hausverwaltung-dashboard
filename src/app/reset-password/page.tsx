'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (newPassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

      if (updateError) {
        // Check if it's a token expiration issue
        if (updateError.message.includes('invalid') || updateError.message.includes('expired')) {
          setError('Der Zurücksetzen-Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an.')
          setIsValidToken(false)
        } else {
          setError(updateError.message)
        }
        return
      }

      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (tokenChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Wird geladen...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ImmoGreta</h1>
          <p className="text-slate-500 text-sm mt-1">Passwort zurücksetzen</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {success ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Passwort erfolgreich zurückgesetzt</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Ihr neues Passwort ist aktiv. Sie werden in Kürze zur Anmeldung weitergeleitet.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Zur Anmeldung
              </button>
            </div>
          ) : !isValidToken ? (
            <div className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Link ungültig oder abgelaufen</h2>
                <p className="text-sm text-slate-600">
                  Der Passwort-Zurücksetzen-Link ist ungültig oder abgelaufen. Bitte besuchen Sie die Anmeldungsseite und fordern Sie einen neuen Link an.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Zur Anmeldung
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Neues Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Verwenden Sie ein starkes Passwort mit Groß- und Kleinbuchstaben, Zahlen und Symbolen.</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Passwort bestätigen</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {newPassword && confirmPassword && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  newPassword === confirmPassword
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {newPassword === confirmPassword ? (
                    <><Check className="w-4 h-4" /> Passwörter stimmen überein</>
                  ) : (
                    <><AlertCircle className="w-4 h-4" /> Passwörter stimmen nicht überein</>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird aktualisiert...
                  </>
                ) : (
                  'Passwort aktualisieren'
                )}
              </button>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Zur Anmeldung zurück
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 ImmoGreta · Alle Daten DSGVO-konform gespeichert
        </p>
      </div>
    </div>
  )
}
