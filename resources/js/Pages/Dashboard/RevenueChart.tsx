import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import React, { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dumbbell, InfoIcon, PersonStanding } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';

// Define interfaces for the detailed payload structure
interface RevenueSource {
    entry_payments: number | string;
    membership_renewals: number | string;
    locker_payments: number | string;
    miscellaneous_payments: number | string;
    refunds: number | string;
}

interface GenderBreakdown {
    male: number | string;
    female: number | string;
    others: number | string;
}

interface MembershipPackageData {
    count: number;
    sum: number;
}

interface MembershipPackageBreakdown {
    [packageName: string]: MembershipPackageData;
}

interface RevenueItem {
    date: string;
    revenue: number;
    source: RevenueSource;
    gender: GenderBreakdown;
    membership_packages: MembershipPackageBreakdown | [];
}

interface MonthlyRevenue {
    [month: string]: RevenueItem[]; // Key is the month name, value is an array of RevenueItem
}

interface RevenueChartProps {
    monthlyRevenue: MonthlyRevenue;
    totalExpense: any;
}

const sourceMap: { [key: string]: string } = {
    'entry_payments': "Admissions",
    'membership_renewals': "Renewals",
    'locker_payments': "Lockers",
    'miscellaneous_payments': "Miscellaneous",
    'refunds' : 'Refunds'
};

const RevenueChart: React.FC<RevenueChartProps> = ({ monthlyRevenue, totalExpense }) => {
    // Extract the keys (months) from the `monthlyRevenue` object dynamically
    const monthOptions = Object.keys(monthlyRevenue).map(monthKey => ({
        label: monthKey, // Example: "Jan 2024"
        value: monthKey
    }));

    // Default to the latest month (first item in the options)
    const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0]?.value || '');

    // Get the revenue data for the selected month
    const revenuesByDay: RevenueItem[] = monthlyRevenue[selectedMonth] || [];

    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

    const totalRevenue = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.revenue), 0)
    const totalEntryRevenue = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.source.entry_payments), 0)
    const totalMembershipRenewals = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.source.membership_renewals), 0)
    const totalLockerRevenue = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.source.locker_payments), 0)
    const totalMiscellaneousRevenue = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.source.miscellaneous_payments), 0)
    const totalRefunds = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.source.refunds), 0)

    const totalMaleCount = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.gender.male), 0);
    const totalFemaleCount = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.gender.female), 0);
    const totalOthersCount = revenuesByDay.reduce((acc, curr) => Number(acc) + Number(curr.gender.others), 0);


    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle className='flex items-center gap-2'>Transactions in
                        <Select defaultValue={selectedMonth} onValueChange={val => setSelectedMonth(val)}>
                            <SelectTrigger className="w-fit border-0 focus:ring-0 text-xl ps-0">
                                <SelectValue placeholder="Select a month" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map(month => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardTitle>
                    <CardDescription>Showing daily transaction for the selected month</CardDescription>
                </div>
                <div className='flex'>
                    <button data-active={true} className="relative z-30 flex flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 w-[fit]">
                        <strong className="text-sm text-muted-foreground">
                            Male:  <strong className='text-card-foreground'>{Number(totalMaleCount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                        <strong className="text-sm text-muted-foreground">
                            Female:  <strong className='text-card-foreground'>{Number(totalFemaleCount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                        <strong className="text-sm text-muted-foreground">
                            Others: <strong className='text-card-foreground'>{Number(totalOthersCount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                    </button>
                    <button data-active={true} className="relative z-30 flex flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 w-[fit]">
                        <strong className="text-sm text-muted-foreground">
                            Entry:  <strong className='text-card-foreground'> Rs {Number(totalEntryRevenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                        <strong className="text-sm text-muted-foreground">
                            Renewals:  <strong className='text-card-foreground'> Rs {Number(totalMembershipRenewals).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                        <strong className="text-sm text-muted-foreground">
                            Locker: <strong className='text-card-foreground'>Rs {Number(totalLockerRevenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                        <strong className="text-sm text-muted-foreground">
                            Miscellaneous: <strong className='text-card-foreground'>Rs {Number(totalMiscellaneousRevenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                        <strong className="text-sm text-muted-foreground">
                            Refunds: <strong className='text-card-foreground'>Rs {Number(totalRefunds).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                        </strong>
                    </button>
                    <button data-active={true} className="relative z-30 flex grow flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 w-[fit]">
                        <strong className="text-xs text-muted-foreground">Total Expenses</strong>
                        <span className="text-lg text-red-500 font-bold leading-none sm:text-3xl">
                            Rs {Number(totalExpense).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    </button>
                    <button data-active={true} className="relative z-30 flex grow flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 w-[fit]">
                        <strong className="text-xs text-muted-foreground">Total Revenue</strong>
                        <span className="text-lg text-green-500 font-bold leading-none sm:text-3xl">
                            Rs {Number(totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <Popover>
                            <PopoverTrigger>
                                <InfoIcon size={15} className='absolute top-4 right-4' />
                            </PopoverTrigger>
                            <PopoverContent className='w-fit'>
                                {/* Prepare the sum for each membership package */}
                                <div className="space-y-2">
                                    <CardTitle className="text-md">Package Details From {selectedMonth.split(" ")[0]}</CardTitle>
                                    <table cellSpacing={10} cellPadding={10}>
                                        <thead className='border-b'>
                                            <tr>
                                                <th className='text-start'>Package Name</th>
                                                <th className='text-start'>Counts</th>
                                                <th className='text-start'>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            {revenuesByDay.length > 0 ? (
                                                Object.entries(
                                                    revenuesByDay.reduce((acc, curr) => {
                                                        Object.entries(curr.membership_packages).forEach(([packageName, { count, sum }]) => {
                                                            if (!acc[packageName]) {
                                                                acc[packageName] = { count: 0, sum: 0 };
                                                            }
                                                            acc[packageName].count += count;
                                                            acc[packageName].sum += sum;
                                                        });
                                                        return acc;
                                                    }, {} as { [packageName: string]: { count: number, sum: number } })
                                                ).map(([packageName, { count, sum }]) => (
                                                    <tr>
                                                        <td>{packageName}</td>
                                                        <td>{count}</td>
                                                        <td>Rs {Number(sum).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <span>No data available for this month</span>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </PopoverContent>
                        </Popover>

                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="overflow-visible aspect-auto h-[350px] w-full">
                <BarChart 
                    data={revenuesByDay} 
                    margin={{ top: 20, right: 12, left: 12, bottom: 20 }}
                >

                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                            }}
                        />
                        <ChartTooltip
                            content={props => {
                                const { payload, label } = props;
                                if (!payload || !payload.length) return null;
                                const data = payload[0].payload;

                                return (
                                    <Card>
                                        <div className="grid grid-cols-2">
                                            {/* Membership Packages Count Section */}
                                            {
                                                Object.keys(data.membership_packages).length > 0 && (
                                                    <div>
                                                        <CardHeader className='pb-1'>
                                                            <CardTitle className='text-md'>Packagewise Counts</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {
                                                                Object.entries(data.membership_packages).map(([packageName, packageData]) => {
                                                                    const { count, sum } = packageData as MembershipPackageData; // Explicitly cast the type
                                                                    return (
                                                                        <div key={packageName} className="flex items-center gap-2 py-1">
                                                                            <div className="flex items-center gap-1 text-xs">
                                                                                <span>{packageName} ({Number(count).toLocaleString()})</span>
                                                                            </div>
                                                                            :
                                                                            <span className="text-sm text-muted-foreground">
                                                                                Rs {Number(sum).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                        </CardContent>
                                                    </div>
                                                )
                                            }



                                            {/* Payment Methods Count Section */}
                                            {
                                                Object.keys(data.source).length > 0 && (
                                                    <div>
                                                        <CardHeader className='pb-1'>
                                                            <CardTitle className='text-md'>Revenue from</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {
                                                                Object.entries(data.source).map(([methodName, count]) => (
                                                                    <div key={methodName} className="flex items-center gap-2 py-1">
                                                                        <div className="flex items-center gap-1 text-xs">
                                                                            {/*    <Dumbbell size={12} name="tag" className="text-sm text-muted-foreground" /> */}
                                                                            <span>{sourceMap[methodName]}</span>
                                                                        </div>
                                                                        <span className="text-sm text-muted-foreground">Rs {Number(count).toLocaleString()}</span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </CardContent>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </Card>

                                );
                            }}
                        />
                        <Bar dataKey="revenue" fill={`var(--color-revenue)`}>
                        <LabelList
                                position="top" 
                                offset={10} 
                                className="fill-foreground" 
                                fontSize={12}
                                formatter={(value: string | number) => 
                                    Number(value) > 0 ? Number(value).toLocaleString('en-In', { maximumFractionDigits: 2 }) : ''
                                }
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default RevenueChart;
