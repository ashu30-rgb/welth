import { getAccountsWithTransactions } from '@/actions/accounts'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import TransactionsTable from '../_components/transaction-table'
import { BarLoader } from 'react-spinners'
import AccountChart from '../_components/account-chart'

const AccountsPage = async ({ params }) => {
    const resolvedParams = await params; 
    const { id } = resolvedParams;
    const accountData = await getAccountsWithTransactions(id)
    if (!accountData) {
        notFound()
    }

    const { transaction, ...account } = accountData
    return (
        <div className='space-y-8 px-5 '>
            <div className='flex gap-4 items-end justify-between'>
            <div>
                <h1 className='text-5xl sm:text-6xl font-bold gradient-title capitalize'>{account.name}</h1>
                <p className='text-muted-foreground'>{account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
            </div>
            <div className='text-right pb-2'>
                <div className='text-xl sm:text-2xl font-bold'>{parseFloat(account.balance).toFixed(2)}</div>
                <p className='text-sm text-muted-foreground'>{account._count.transaction} Transactions</p>
            </div>
            </div>

            {/* Chart Section */}
            <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea' />}>
                <AccountChart transactions = {JSON.parse(JSON.stringify(transaction))} />
            </Suspense>


            {/* Transaction Table */}
            <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea' />}>
                <TransactionsTable  transactions={JSON.parse(JSON.stringify(transaction))}/>
            </Suspense>
        </div>
    )
}

export default AccountsPage