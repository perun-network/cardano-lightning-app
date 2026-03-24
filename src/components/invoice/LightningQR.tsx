import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  bolt11: string
  amount: string
  expiresIn?: string
}

export default function LightningQR({ bolt11, amount, expiresIn }: Props) {
  const [copied, setCopied] = useState(false)

  const copyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(bolt11)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text so user can copy manually
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center shadow-[0_24px_64px_-12px_rgba(41,171,226,0.3)]">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#131313]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span className="font-label text-[#131313] font-black text-xs tracking-widest uppercase">Lightning Network</span>
        </div>
        {expiresIn && (
          <span className="bg-[#131313]/5 text-[#131313] font-label text-[10px] px-3 py-1.5 rounded-lg border border-[#131313]/10 uppercase font-black tracking-widest">
            Expires in {expiresIn}
          </span>
        )}
      </div>

      {/* QR Code */}
      <div className="w-full aspect-square bg-[#F8F9FA] rounded-[2rem] mb-8 flex items-center justify-center p-8 border-4 border-[#131313]/5">
        <QRCodeSVG
          value={bolt11}
          size={320}
          level="M"
          bgColor="#F8F9FA"
          fgColor="#131313"
          className="w-full h-full"
        />
      </div>

      <div className="w-full space-y-6">
        <div className="text-center">
          <p className="text-[#131313]/50 font-label text-xs uppercase tracking-[0.2em] mb-1 font-bold">Invoice Amount</p>
          <p className="text-[#131313] text-4xl font-headline font-black tracking-tighter">
            {amount} <span className="text-xl font-bold opacity-60">cBTC</span>
          </p>
        </div>

        {/* Invoice string (truncated) */}
        <div className="bg-[#F8F9FA] p-4 rounded-xl">
          <p className="font-label text-xs text-[#131313]/60 truncate">{bolt11}</p>
        </div>

        <button
          onClick={copyInvoice}
          className="w-full bg-[#131313] text-white font-headline font-extrabold py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
        >
          <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
          {copied ? 'Copied!' : 'Copy Invoice String'}
        </button>
        <div className="pt-4 flex items-center justify-center gap-2 text-[#131313]/40">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <p className="text-[10px] font-label uppercase tracking-[0.2em] font-black">End-to-End Encrypted Bridge</p>
        </div>
      </div>
    </div>
  )
}
