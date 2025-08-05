// src/components/TradeModal.tsx
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { executeTrade } from '../api/portfolio'
import './TradeModal.css'

type TradeModalProps = {
  symbol: string
  isOpen: boolean
  onClose: () => void
}

export default function TradeModal({
  symbol,
  isOpen,
  onClose,
}: TradeModalProps) {
  const [type, setType]     = useState<'buy'|'sell'>('buy')
  const [amount, setAmount] = useState<string>('')       // string to allow clearing
  const [error, setError]   = useState<string|null>(null)

  // close on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  async function submit() {
    const n = parseInt(amount, 10)
    if (!amount || isNaN(n) || n <= 0) {
      setError('Please enter a positive integer')
      return
    }
    setError(null)
    await executeTrade(symbol, n, type)
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Trade: {symbol}</h2>

        <div className="trade-buttons">
          <button
            onClick={() => setType('buy')}
            className={type === 'buy' ? 'active' : ''}
          >
            Buy
          </button>
          <button
            onClick={() => setType('sell')}
            className={type === 'sell' ? 'active' : ''}
          >
            Sell
          </button>
        </div>

        <div className="trade-input">
          <label>Amount</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            placeholder="0"
            value={amount}
            onKeyPress={e => {
              if (!/[0-9]/.test(e.key)) e.preventDefault()
            }}
            onChange={e => {
              const v = e.target.value
              if (/^\d*$/.test(v)) setAmount(v)
            }}
          />
        </div>

        {error && <div className="error-banner">{error}</div>}

        <button className="submit-btn" onClick={submit}>Submit</button>
      </div>
    </div>,
    document.body
  )
}
