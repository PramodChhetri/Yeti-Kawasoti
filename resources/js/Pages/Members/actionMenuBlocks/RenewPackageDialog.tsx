import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { router, useForm } from '@inertiajs/react';
import { MembershipPackage } from '@/types';
import { Member } from '@/types/members';
import { usePage } from '@inertiajs/react';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from '@/Components/ui/use-toast';

const RenewPackageDialog = ({ member, open, onClose }: { member: Member, open: boolean, onClose: () => void }) => {
    const packages = usePage().props.packages as MembershipPackage[];
    const membershipPackage = packages.find(p => p.id === member.membership_package_id);

    const paidRef = useRef<HTMLInputElement>(null);

    // Using useForm for form management
    const { data, setData, reset, errors, post, processing, clearErrors } = useForm({
        selected_months: 1,
        extra_discount: 0,
        paid_amount: 0,
        bill_number: '',
        payment_mode: '',
        new_payment_expiry: '',
    });

    const [monthlyFees, setMonthlyFees] = useState(0);
    const [calculatedMonthlyFees, setCalculatedMonthlyFees] = useState(0);
    const [grossAmount, setGrossAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [netAmount, setNetAmount] = useState(0);

    // Function to calculate new expiry date
    const calculateNewExpiryDate = (monthsToAdd: number) => {
        const today = new Date();
        const currentExpiryDate = new Date(member.payment_expiry_date);

        const baseDate = today > currentExpiryDate ? today : currentExpiryDate;

        const newExpiry = new Date(baseDate.setMonth(baseDate.getMonth() + monthsToAdd));
        return newExpiry.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (membershipPackage) {
            const monthlyRate = Number(membershipPackage.monthly_amount) || 0;
            const totalMonthlyFees = monthlyRate * data.selected_months;

            let calculatedDiscount = 0;
            if (data.selected_months === 3) {
                calculatedDiscount = Number(membershipPackage.discount_quarterly) || 0;
            } else if (data.selected_months === 6) {
                calculatedDiscount = Number(membershipPackage.discount_half_yearly) || 0;
            } else if (data.selected_months === 12) {
                calculatedDiscount = Number(membershipPackage.discount_yearly) || 0;
            }

            const gross = totalMonthlyFees;
            const net = gross - calculatedDiscount - data.extra_discount;

            setMonthlyFees(monthlyRate);
            setCalculatedMonthlyFees(totalMonthlyFees);
            setGrossAmount(gross);
            setDiscount(calculatedDiscount);
            setNetAmount(Math.max(net, 0));

            // Calculate new payment expiry date
            const newExpiry = calculateNewExpiryDate(data.selected_months);
            setData('new_payment_expiry', newExpiry);
        }
    }, [data.selected_months, data.extra_discount, membershipPackage]);

    const calculateBalanceLabel = () => {
        if (data.paid_amount > netAmount) {
            return 'Advance Amount';
        }
        return 'Credit Amount';
    };

    const calculateBalanceAmount = () => {
        if (data.paid_amount > netAmount) {
            return data.paid_amount - netAmount;
        }
        return netAmount - data.paid_amount;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (processing)
            return false;
        // Log the form data to console
        console.log('Form Data:', data);

        clearErrors();

        // You can use the post method to submit data if needed
        post(route('renewal.store', member.id), {
            onSuccess: (response) => {
                console.log(response);
                toast({ description: "Package Renewed Successfully..." });
                onClose();
                reset();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] mx-auto rounded-lg p-6 shadow-lg overflow-auto max-h-[95vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Package Renewal</DialogTitle>
                    <DialogDescription className="text-sm">
                        Renew membership package of <strong>{member.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Left Section: Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Pricing Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <b>{membershipPackage?.package_name}</b>
                            <div className="flex justify-between">
                                <span>Current Expiry Date</span>
                                <strong>{member.payment_expiry_date as unknown as string}</strong>
                            </div>
                            <hr className='my-2' />
                            <div className="flex justify-between">
                                <span>Renewal Months</span>
                                <span>{data.selected_months} {data.selected_months === 1 ? "Month" : "Months"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Monthly Fees</span>
                                <span>Rs {monthlyFees}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Calculated Monthly Fees</span>
                                <span>Rs {calculatedMonthlyFees}</span>
                            </div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between">
                                <span>Gross Amount</span>
                                <span>Rs {grossAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount</span>
                                <span>- Rs {discount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Extra Discount</span>
                                <span>- Rs {data.extra_discount}</span>
                            </div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between font-bold">
                                <span>Net Amount</span>
                                <span className='cursor-pointer' onClick={() => {
                                    if (paidRef.current) {
                                        setData('paid_amount', netAmount);
                                        paidRef.current.value = netAmount.toString();
                                    }
                                }}>Rs {netAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{calculateBalanceLabel()}</span>
                                <span>Rs {calculateBalanceAmount()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Section: Form Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>Renewal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Renewal Period</Label>
                                        <Select
                                            value={data.selected_months.toString()}
                                            onValueChange={val => setData('selected_months', Number(val))}
                                        >
                                            <SelectTrigger id="months">
                                                <SelectValue placeholder="Select extension period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Month</SelectItem>
                                                <SelectItem value="3">3 Months</SelectItem>
                                                <SelectItem value="6">6 Months</SelectItem>
                                                <SelectItem value="12">1 Year</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.selected_months} />
                                    </div>

                                    <div>
                                        <Label>Payment Expiry Date</Label>
                                        <Input
                                            type="date"
                                            value={(new Date(data.new_payment_expiry || member.payment_expiry_date).toISOString().split('T')[0])}
                                            onChange={(e) => setData('new_payment_expiry', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Payment Method</Label>
                                        <Select
                                            value={data.payment_mode}
                                            onValueChange={val => setData('payment_mode', val)}
                                        >
                                            <SelectTrigger id="payment-method">
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="QR">QR</SelectItem>
                                                <SelectItem value="Cash + QR">Cash + QR</SelectItem>
                                                <SelectItem value="Cheque">Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.payment_mode} />
                                    </div>

                                    <div>
                                        <Label>Bill Number</Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter bill number"
                                            onChange={(e) => setData('bill_number', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.bill_number} />
                                    </div>

                                    <div>
                                        <Label>Extra Discount (Rs)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter extra discount"
                                            onChange={(e) => setData('extra_discount', Number(e.target.value))}
                                            required
                                        />
                                        <InputError message={errors.extra_discount} />
                                    </div>

                                    <div>
                                        <Label>Paid Amount (Rs)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount paid"
                                            ref={paidRef}
                                            onChange={(e) => setData('paid_amount', Number(e.target.value))}
                                            required
                                        />
                                        <InputError message={errors.paid_amount} />
                                    </div>
                                </div>
                                <Button>
                                    Confirm Renewal
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RenewPackageDialog;
