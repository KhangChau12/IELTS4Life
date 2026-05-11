'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Crown, Copy, Check, Loader2, AlertCircle } from 'lucide-react'

type OrderInfo = {
  orderCode: string
  amount: number
  accountNumber: string
  accountName: string
  bankBin: string
}

const POLL_INTERVAL_MS = 5000
const POLL_MAX_MS = 5 * 60 * 1000

export function UpgradeButton() {
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pollStatus, setPollStatus] = useState<'waiting' | 'success' | 'timeout'>('waiting')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollStartRef = useRef<number>(0)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startPolling = () => {
    pollStartRef.current = Date.now()
    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > POLL_MAX_MS) {
        setPollStatus('timeout')
        stopPolling()
        return
      }
      try {
        const res = await fetch('/api/payment/status')
        if (!res.ok) return
        const data = await res.json()
        if (data.subscriptionStatus === 'active') {
          setPollStatus('success')
          stopPolling()
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch {
        // network hiccup, keep polling
      }
    }, POLL_INTERVAL_MS)
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/payment/create-order', { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Something went wrong. Please try again.')
        return
      }
      const data: OrderInfo = await res.json()
      setOrder(data)
      setPollStatus('waiting')
      setOpen(true)
      startPolling()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    stopPolling()
    setOpen(false)
  }

  const handleCopy = async () => {
    if (!order) return
    await navigator.clipboard.writeText(order.orderCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const qrUrl = order
    ? `https://img.vietqr.io/image/${order.bankBin}-${order.accountNumber}-compact.png?amount=${order.amount}&addInfo=${encodeURIComponent(order.orderCode)}&accountName=${encodeURIComponent(order.accountName)}`
    : ''

  return (
    <>
      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Crown className="mr-2 h-4 w-4" />
        )}
        Upgrade to Pro — 75,000 VND/month
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-800">
              <Crown className="h-5 w-5" /> Pro Payment
            </DialogTitle>
          </DialogHeader>

          {order && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="VietQR MB Bank"
                  className="w-56 h-56 rounded-xl border border-green-200 shadow"
                />
              </div>

              {/* Bank info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ocean-600">Bank</span>
                  <span className="font-semibold">MB Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocean-600">Account number</span>
                  <span className="font-mono font-semibold">{order.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocean-600">Account name</span>
                  <span className="font-semibold">{order.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ocean-600">Amount</span>
                  <span className="font-bold text-green-700">{order.amount.toLocaleString('vi-VN')} VND</span>
                </div>
              </div>

              {/* Transfer note — required */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <p className="text-xs text-amber-700 font-semibold mb-2">
                  Transfer note (must be exact):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-white border border-amber-200 rounded px-3 py-2 break-all">
                    {order.orderCode}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="flex-shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Poll status */}
              <div className="flex items-center gap-3 py-2">
                {pollStatus === 'waiting' && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-ocean-500 flex-shrink-0" />
                    <p className="text-sm text-ocean-600">Waiting for payment confirmation...</p>
                  </>
                )}
                {pollStatus === 'success' && (
                  <>
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-semibold">Payment confirmed! Updating your account...</p>
                  </>
                )}
                {pollStatus === 'timeout' && (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      Payment not detected yet. If you&apos;ve already transferred, please wait a few minutes and reload the page.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
