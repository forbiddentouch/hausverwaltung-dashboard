'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
const supabase = getSupabaseBrowserClient()
import { Building2, ArrowRight, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'name' | 'creating'>('name')
  const [orgName, setOrgName] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const handleCreate = async () => {
    if (!orgName.trim()) {
      setError('Bitte geben Sie einen Namen ein.')
      return
    }
    setError('')
    setLoading(true)
    setStep('creating')

    try {
