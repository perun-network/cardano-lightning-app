interface SwapInputProps {
  label: string
  value: string
  token?: string
  tokenIcon?: string
  tokenIconFill?: boolean
  balance?: string
  estimated?: boolean
  placeholder?: string
  inputType?: 'number' | 'text'
  onChange?: (value: string) => void
  readOnly?: boolean
}

export default function SwapInput({
  label,
  value,
  token,
  tokenIcon,
  tokenIconFill,
  balance,
  estimated,
  placeholder = '0',
  inputType = 'number',
  onChange,
  readOnly,
}: SwapInputProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl group focus-within:ring-1 ring-outline-variant/20 transition-all">
      <div className="flex justify-between items-center mb-4">
        <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{label}</span>
        {balance && (
          <div className="flex items-center gap-1 text-xs font-label text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            {balance}
          </div>
        )}
        {estimated && (
          <span className="font-label text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">Estimated</span>
        )}
      </div>
      <div className="flex justify-between items-center gap-3">
        <input
          className={`bg-transparent border-none p-0 focus:ring-0 focus:outline-none w-full text-on-surface placeholder:text-surface-variant ${
            inputType === 'number'
              ? 'font-headline text-4xl font-bold'
              : 'font-label text-sm'
          }`}
          placeholder={placeholder}
          type={inputType === 'number' ? 'number' : 'text'}
          min={inputType === 'number' ? '0' : undefined}
          step={inputType === 'number' ? 'any' : undefined}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
        />
        {token && tokenIcon && (
          <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl flex-shrink-0">
            <span
              className={`material-symbols-outlined ${token === 'BTC' ? 'text-secondary' : 'text-primary'}`}
              style={tokenIconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tokenIcon}
            </span>
            <span className="font-headline font-bold">{token}</span>
          </div>
        )}
      </div>
    </div>
  )
}
