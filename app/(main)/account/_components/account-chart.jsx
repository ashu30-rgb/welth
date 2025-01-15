"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { endOfDay, format, startOfDay, subDays } from 'date-fns'
import React, { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
const DATE_RANGES = {
    "7D": { label: "Last 7 Days", days: 7 },
    "1M": { label: "Last Month", days: 30 },
    "3M": { label: "Last 3 Months", days: 90 },
    "6M": { label: "Last 6 Months", days: 180 },
    ALL: { label: "All time", days: null }
}

const AccountChart = ({ transactions }) => {
    const [dateRange, setDateRange] = useState("1M");

    const filteredData = useMemo(() => {
        const range = DATE_RANGES[dateRange];
        const now = new Date();
        const startDate = range.days
            ? startOfDay(subDays(now, range.days))
            : startOfDay(new Date(0));

        // Filter transactions within date range
        const filtered = transactions.filter(
            (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
        );

        // Group transactions by date
        const grouped = filtered.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), "MMM dd");
            if (!acc[date]) {
                acc[date] = { date, income: 0, expense: 0 };
            }
            if (transaction.type === "INCOME") {
                acc[date].income += parseFloat(transaction.amount);
            } else {
                acc[date].expense += parseFloat(transaction.amount);
            }
            return acc;
        }, {});

        // Convert to array and sort by date
        return Object.values(grouped).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );
    }, [transactions, dateRange]);

    // Calculate totals for the selected period
    const totals = useMemo(() => {
        return filteredData.reduce(
            (acc, day) => ({
                income: acc.income + day.income,
                expense: acc.expense + day.expense,
            }),
            { income: 0, expense: 0 }
        );
    }, [filteredData]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle className="text-base font-normal">Card Title</CardTitle>
                <Select defaultValue={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(DATE_RANGES).map(([key, { label }]) => {
                            return <SelectItem value={key} key={key}>{label}</SelectItem>
                        })}
                    </SelectContent>
                </Select>

            </CardHeader>
            <CardContent>
                <div className='flex justify-around mb-6 text-sm'>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Income</p>
                        <p className='text-lg font-bold text-green-500'>{parseFloat(totals.income).toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                        <p className='text-muted-foreground'>Total Expenses</p>
                        <p className='text-lg font-bold text-red-500'>{parseFloat(totals.expense).toFixed(2)}</p>
                    </div>
                    <div className='text-center'>
                        <p className={`text-muted-foreground `}>Net</p>
                        <p className={`text-lg font-bold ${parseFloat(totals.income) - parseFloat(totals.expense) > 0 ? "text-green-500" : "text-red-500"}`}>{(parseFloat(totals.income) - parseFloat(totals.expense)).toFixed(2)}</p>
                    </div>
                </div>

                <div className='h-[300px]'>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={filteredData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis tickFormatter={(value) => `${value}`} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="income" name="income" fill="#22c55e" radius={[4, 4, 0, 4]} />
                            <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 4]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default AccountChart