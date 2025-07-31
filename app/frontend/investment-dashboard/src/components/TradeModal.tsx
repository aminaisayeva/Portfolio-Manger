// src/components/TradeModal.tsx
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { executeTrade } from '../api/portfolio'

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
  const [type,   setType]   = useState<'buy'|'sell'>('buy')
  const [amount, setAmount] = useState<number>(0)

  // close on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  async function submit() {
    await executeTrade(symbol, amount, type)
    onClose()
  }

  if (!isOpen) return null

  // portal into document.body
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
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
            type="number"
            value={amount}
            onChange={e => setAmount(+e.target.value)}
          />
        </div>

        <button onClick={submit}>Submit</button>
      </div>
    </div>,
    document.body
  )
}
