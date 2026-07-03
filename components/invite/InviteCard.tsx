'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { formatInviteCode } from '@/lib/invite/utils'

interface InviteCardProps {
  inviteCode: string
}

export function InviteCard({ inviteCode }: InviteCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Card className="border-ocean-200">
      <CardHeader>
        <CardTitle className="text-ocean-800">Your Invite Code</CardTitle>
        <CardDescription>
          Share this code with friends to earn bonus essays
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Code Display */}
          <div className="bg-gradient-to-r from-ocean-50 to-cyan-50 rounded-lg p-4 sm:p-6 border-2 border-ocean-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-2xl sm:text-3xl font-bold text-ocean-800 text-center tracking-wider break-all">
              {formatInviteCode(inviteCode)}
            </p>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="border-ocean-300 hover:bg-ocean-50 flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* How it works */}
          <div className="space-y-2">
            <h4 className="font-semibold text-ocean-800 text-sm">How it works:</h4>
            <ul className="text-sm text-ocean-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-ocean-400 mt-0.5">•</span>
                <span>Friends use your code when signing up</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ocean-400 mt-0.5">•</span>
                <span>They get 2 bonus essays instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ocean-400 mt-0.5">•</span>
                <span>You earn 2 bonus essays per signup</span>
              </li>
            </ul>
          </div>

          {/* Share message template */}
          <div className="p-3 bg-gradient-to-r from-ocean-50 to-cyan-50 border border-ocean-200 rounded-lg">
            <p className="text-xs text-ocean-800 font-medium mb-1">Share message:</p>
            <p className="text-xs text-ocean-600 italic">
              "Try IELTS4Life for AI essay scoring! Use my code {inviteCode} for 2 free bonus essays"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}