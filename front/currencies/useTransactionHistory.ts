import { useEffect, useState } from 'react'

import { UnifiedTransaction } from '../../api-client'
import { defaultFilters } from '../const'
import { useStores } from '../mobx'
import { Pagination, TransactionHistoryMode, TxFiltes } from '../types'
import { noop, sleep } from '../utils/fn'
import { pollPromise } from '../utils/poll'

type ReturnType = [
  UnifiedTransaction[],
  {
    loadNext: (direction: 'next_page' | 'prev_page') => void
    reset: () => void
    filters: TxFiltes
    onChangeFilters: (filters: TxFiltes) => void
    pagination: Pagination
    loading: boolean
  },
]

const useTransactionHistory = (
  mode: TransactionHistoryMode,
  initialFilters: Partial<TxFiltes> = {},
  address?: string[],
): ReturnType => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([])
  const [filters, setFilters] = useState({ ...defaultFilters, ...initialFilters })
  const [loading, setIsLoading] = useState(true)

  const { accountStore, chainStore, walletStore } = useStores()

  const [paginationMeta, setPaginationMeta] = useState<Pagination>({
    page: 0,
    isFinish: false,
  })

  useEffect(() => {
    const ac = new AbortController()

    pollPromise<void>(request, ac.signal, Infinity, 5000, false).catch(noop)

    return () => {
      ac.abort()
    }
  }, [filters])

  useEffect(() => {
    setPaginationMeta({
      page: 0,
      isFinish: false,
    })
    setFilters({ ...defaultFilters, ...initialFilters })
  }, [accountStore.activeAccount?.address, chainStore.activeChain?.id, mode])

  const loadNext = (direction: 'next_page' | 'prev_page') => {
    const nextPage = direction === 'next_page' ? paginationMeta.page + 1 : paginationMeta.page - 1

    setIsLoading(true)
    setFilters({ ...filters, page: nextPage })
  }

  const onChangeFilters = (filters: TxFiltes) => {
    setIsLoading(true)
    setFilters(filters)
  }

  const reset = () => {
    setIsLoading(true)
    setFilters({ ...defaultFilters, ...initialFilters })
  }

  const request = async () => {
    const [page1, page2] = await Promise.all([
      walletStore.getTransactionsHistory(mode, { ...filters, page: filters.page || 0 }, address),
      walletStore.getTransactionsHistory(
        mode,
        { ...filters, page: filters.page ? filters.page + 1 : 1 },
        address,
      ),
      sleep(300),
    ])

    setTransactions(page1)
    setPaginationMeta({
      page: filters.page || 0,
      isFinish: page2.length === 0,
    })
    setIsLoading(false)
  }

  return [
    transactions,
    { loadNext, reset, filters, onChangeFilters, pagination: paginationMeta, loading },
  ]
}

export default useTransactionHistory
