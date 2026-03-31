import { create } from 'zustand'
import type { SwapDirection, PoolInfoResponse } from '../types'
import { getPoolInfo } from '../services/api'

interface BridgeStore {
  // Swap direction
  direction: SwapDirection
  toggleDirection: () => void

  // Form fields
  amount: string
  cardanoAddress: string
  bolt11Invoice: string
  setAmount: (v: string) => void
  setCardanoAddress: (v: string) => void
  setBolt11Invoice: (v: string) => void

  // Pool info
  poolInfo: PoolInfoResponse | null
  poolError: boolean
  refreshPoolInfo: () => Promise<void>
}

export const useBridgeStore = create<BridgeStore>((set) => ({
  direction: 'onramp',
  toggleDirection: () =>
    set((s) => ({
      direction: s.direction === 'onramp' ? 'offramp' : 'onramp',
      amount: '',
      cardanoAddress: '',
      bolt11Invoice: '',
    })),

  amount: '',
  cardanoAddress: '',
  bolt11Invoice: '',
  setAmount: (amount) => set({ amount }),
  setCardanoAddress: (cardanoAddress) => set({ cardanoAddress }),
  setBolt11Invoice: (bolt11Invoice) => set({ bolt11Invoice }),

  poolInfo: null,
  poolError: false,
  refreshPoolInfo: async () => {
    try {
      const info = await getPoolInfo()
      set({ poolInfo: info, poolError: false })
    } catch {
      set({ poolError: true })
    }
  },
}))
