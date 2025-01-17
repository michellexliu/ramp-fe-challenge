import { useCallback, useEffect, useState } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()

  const [transactionApprovals, setTransactionApprovals] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setTransactionApprovals((prevApprovals) => {
      const newApprovals = transactions?.reduce<Record<string, boolean>>((acc, { id, approved }) => {
        if (id in prevApprovals) {
          return acc
        }

        acc[id] = approved
        return acc
      }, {})

      return { ...prevApprovals, ...newApprovals } || {}
    })
  }, [transactions])

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      setTransactionApprovals((prevApprovals) => ({
        ...prevApprovals,
        [transactionId]: newValue,
      }))
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
          approved={transactionApprovals[transaction.id]}
        />
      ))}
    </div>
  )
}
