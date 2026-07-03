'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Crown, Copy, Check, Loader2, AlertCircle, BookOpen } from 'lucide-react'

type OrderInfo = {
  type: 'pro' | 'pack'
  orderCode: string
  amount: number
  essayBonus: number | null
  accountNumber: string
  accountName: string
  bankBin: string
}

const POLL_INTERVAL_MS = 5000
const POLL_MAX_MS = 5 * 60 * 1000

function PaymentModal({
  order,
  open,
  onClose,
}: {
  order: OrderInfo
  open: boolean
  onClose: () => void
}) {
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

  useEffect(() => {
    if (!open) return
    setPollStatus('waiting')
    pollStartRef.current = Date.now()
    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > POLL_MAX_MS) {
        setPollStatus('timeout')
        stopPolling()
        return
      }
      try {
        const url = order.type === 'pack'
          ? `/api/payment/status?orderCode=${order.orderCode}`
          : '/api/payment/status'
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        const done = order.type === 'pro'
          ? data.subscriptionStatus === 'active'
          : data.packCompleted
        if (done) {
          setPollStatus('success')
          stopPolling()
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch {
        // network hiccup, keep polling
      }
    }, POLL_INTERVAL_MS)
    return () => stopPolling()
  }, [open, order.type, order.orderCode])

  const handleClose = () => {
    stopPolling()
    onClose()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(order.orderCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const qrUrl = `https://img.vietqr.io/image/${order.bankBin}-${order.accountNumber}-compact.png?amount=${order.amount}&addInfo=${encodeURIComponent(order.orderCode)}&accountName=${encodeURIComponent(order.accountName)}`

  const title = order.type === 'pro' ? 'Pro Subscription Payment' : 'Essay Pack Payment'
  const successMsg = order.type === 'pro'
    ? 'Payment confirmed! Updating your account...'
    : `Payment confirmed! ${order.essayBonus} essays added to your account...`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-800">
            {order.type === 'pro'
              ? <Crown className="h-5 w-5" />
              : <BookOpen className="h-5 w-5" />
            }
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="VietQR MB Bank"
              className="w-56 h-56 rounded-xl border border-green-200 shadow"
            />
          </div>

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
                <p className="text-sm text-green-700 font-semibold">{successMsg}</p>
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
      </DialogContent>
    </Dialog>
  )
}

function usePaymentOrder(type: 'pro' | 'pack') {
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payment/create-order?type=${type}`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Something went wrong. Please try again.')
        return
      }
      const data: OrderInfo = await res.json()
      setOrder(data)
      setModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return { loading, order, modalOpen, setModalOpen, handleOrder }
}

export function UpgradeProButton() {
  const { loading, order, modalOpen, setModalOpen, handleOrder } = usePaymentOrder('pro')

  return (
    <>
      <Button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Crown className="mr-2 h-4 w-4" />
        )}
        Upgrade to Pro
      </Button>

      {order && (
        <PaymentModal order={order} open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}

export function BuyPackButton() {
  const { loading, order, modalOpen, setModalOpen, handleOrder } = usePaymentOrder('pack')

  return (
    <>
      <Button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-ocean-600 hover:bg-ocean-700 text-white py-2"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BookOpen className="mr-2 h-4 w-4" />
        )}
        Buy Pack
      </Button>

      {order && (
        <PaymentModal order={order} open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
