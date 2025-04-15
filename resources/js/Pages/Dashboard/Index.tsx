import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Member } from '@/types/members';
import { nepaliNumberFormat } from 'nepali-number';
import { ScrollArea, ScrollBar } from '@/Components/ui/scroll-area';
import { Badge } from '@/Components/ui/badge';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';
import React, { useState } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/Components/ui/select';
import RevenueChart from './RevenueChart';

export default function Dashboard({
    auth,
    totalMembers,
    totalActiveMembers,
    pendingAdmissionApprovals,
    pendingRenewalApprovals,
    todaysRenewals,
    todaysRevenue,
    todaysRegistrations,
    expiredCount,
    todaysCredits,
    todaysPayments,
    monthlyRevenue, 
    totalExpense,
}: {
    auth: any,
    totalMembers: number,
    totalActiveMembers: number,
    pendingAdmissionApprovals: number,
    pendingRenewalApprovals: number,
    todaysRenewals: any[],
    todaysRevenue: number,
    todaysRegistrations: any[],
    expiredCount: number,
    todaysCredits: any[],
    todaysPayments: any[],
    monthlyRevenue: any,
    totalExpense: any,
}) {
    const [selectedMonth, setSelectedMonth] = useState('jan'); // Default to January

    // Month options
    const months = [
        { label: 'January', value: 'jan' },
        { label: 'February', value: 'feb' },
        { label: 'March', value: 'mar' },
        { label: 'April', value: 'apr' },
        { label: 'May', value: 'may' },
        { label: 'June', value: 'jun' },
        { label: 'July', value: 'jul' },
        { label: 'August', value: 'aug' },
        { label: 'September', value: 'sep' },
        { label: 'October', value: 'oct' },
        { label: 'November', value: 'nov' },
        { label: 'December', value: 'dec' }
    ];


    // Get the revenue data for the selected month
    const revenuesByDay = monthlyRevenue[selectedMonth] || [];

    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    const totalRevenue = revenuesByDay.reduce((acc: any, curr: any) => Number(acc) + Number(curr.revenue), 0);


    const registrationsTotal = todaysRegistrations.reduce((acc, curr) => acc + (curr as any).paid, 0);
    const renewalsTotal = todaysRenewals.reduce((acc, curr) => acc + curr.paid, 0);
    const creditsTotal = todaysCredits.reduce((acc, curr) => acc + curr.amount, 0);
    const paymentsTotal = todaysPayments.reduce((acc, curr) => acc + curr.paid, 0);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className=" grid max-[400px]:grid-cols-1 grid-cols-2 min-[600px]:grid-cols-3 min-[1000px]:grid-cols-4 min-[1260px]:grid-cols-5 min-[1420px]:grid-cols-6 gap-5">
                <Card className="w-full bg-blue-500 text-white">
                    <CardHeader>
                        <CardTitle>{totalMembers}</CardTitle>
                        <CardDescription className='text-white/90'>Total Members</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="w-full bg-green-500 text-white">
                    <CardHeader>
                        <CardTitle>{totalActiveMembers}</CardTitle>
                        <CardDescription className='text-white/90'>Active Members</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="w-full bg-red-500 text-white">
                    <CardHeader>
                        <CardTitle>{expiredCount}</CardTitle>
                        <CardDescription className='text-white/90'>Expired Members</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="w-full bg-orange-500 text-white cursor-pointer" onClick={() => (router.visit(route('applications.index')))}>
                    <CardHeader>
                        <CardTitle>{pendingAdmissionApprovals}</CardTitle>
                        <CardDescription className='text-white/90'>Pending Admissions</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="w-full bg-purple-500 text-white cursor-pointer" onClick={() => (router.visit(route('applications.index', { 'tab': 'renewal_applications' })))}>
                    <CardHeader>
                        <CardTitle>{pendingRenewalApprovals}</CardTitle>
                        <CardDescription className='text-white/90'>Pending Renewals</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="w-full bg-teal-500 text-white">
                    <CardHeader>
                        <CardTitle>Rs {nepaliNumberFormat(todaysRevenue)}</CardTitle>
                        <CardDescription className='text-white/90'>Today's Collection</CardDescription>
                    </CardHeader>
                </Card>

            </div>

            <div>
                <RevenueChart monthlyRevenue={monthlyRevenue} totalExpense={totalExpense}/>
            </div>

            <div className="grid grid-cols-2 max-[1356px]:grid-cols-1 gap-5">
                <Card>
                    <CardContent>
                        <CardHeader className="pb-1 text-center">
                            <CardTitle>Today's Registrations</CardTitle>
                        </CardHeader>
                        <ScrollArea className='h-96 mt-4 mb-0'>
                            <ScrollBar orientation='horizontal' />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Membership</TableHead>
                                        <TableHead>Months</TableHead>
                                        <TableHead>Bill no.</TableHead>
                                        <TableHead>Paid Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {todaysRegistrations.map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell>{data.member.name}</TableCell>
                                            <TableCell>{data.member.membership_package.package_name}</TableCell>
                                            <TableCell>{(data as any).total_months} Months</TableCell>
                                            <TableCell>
                                                {
                                                    data.bill_number > 0 ?
                                                        <Badge>
                                                            {data.bill_number}
                                                        </Badge> :
                                                        data.payment_proof?.length ?
                                                            <a target="_blank" href={data.payment_proof} className='text-primary'>
                                                                Receipt
                                                            </a>
                                                            :
                                                            '-'
                                                }
                                            </TableCell>
                                            <TableCell>Rs {nepaliNumberFormat((data as any).paid_amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {
                                        todaysRegistrations.length === 0 &&
                                        <TableRow>
                                            <TableCell className='text-center' colSpan={10}>No Registerations Today</TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card className='h-fit'>
                    <CardContent>
                        <CardHeader className="pb-1 text-center">
                            <CardTitle>Today's Renewals</CardTitle>
                        </CardHeader>
                        <ScrollArea className='h-96 mt-4 mb-0'>
                            <ScrollBar orientation='horizontal' />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Package</TableHead>
                                        <TableHead>Months</TableHead>
                                        <TableHead>Bill no.</TableHead>
                                        <TableHead>Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {todaysRenewals.length > 0 && todaysRenewals.map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell>{data.member.name}</TableCell>
                                            <TableCell>{data.member.membership_package.package_name}</TableCell>
                                            <TableCell>{(data as any).total_months} Month(s)</TableCell>
                                            <TableCell>
                                                {
                                                    data.bill_number > 0 ?
                                                        <Badge>
                                                            {data.bill_number}
                                                        </Badge> :
                                                        data.payment_proof?.length ?
                                                            <a target="_blank" href={data.payment_proof} className='text-primary'>
                                                                Receipt
                                                            </a>
                                                            :
                                                            '-'
                                                }
                                            </TableCell>
                                            <TableCell>Rs {nepaliNumberFormat(data.paid_amount)}</TableCell>
                                        </TableRow>
                                    ))}

                                    {
                                        todaysRenewals.length === 0 &&
                                        <TableRow>
                                            <TableCell className='text-center' colSpan={10}>No Renewals Today</TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
