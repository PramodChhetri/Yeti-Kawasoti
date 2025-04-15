// PublicRenewPackageDialog.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useEffect, useState, FormEvent } from 'react';
import { toast } from '@/Components/ui/use-toast';
import { MembershipPackage } from '@/types';

const PublicRenewPackageDialog = ({ member, open, onClose }: { member: any, open: boolean, onClose: () => void }) => {
    const { data, setData, reset, errors, post, processing, clearErrors } = useForm({
        selected_months: 1,
        payment_proof: null as null | File,
    });

    const [monthlyFees, setMonthlyFees] = useState(0);
    const [calculatedMonthlyFees, setCalculatedMonthlyFees] = useState(0);
    const [grossAmount, setGrossAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [netAmount, setNetAmount] = useState(0);
    const [newPaymentExpiry, setNewPaymentExpiry] = useState('');

    // Calculate the new expiry date
    const calculateNewExpiryDate = (monthsToAdd: number) => {
        const currentExpiryDate = new Date(member.payment_expiry_date);
        const newExpiry = new Date(currentExpiryDate.setMonth(currentExpiryDate.getMonth() + monthsToAdd));
        return newExpiry.toISOString().split('T')[0];
    };

    useEffect(() => {
        const monthlyRate = Number(member.membership_package.monthly_amount) || 0;
        const totalMonthlyFees = monthlyRate * data.selected_months;

        let calculatedDiscount = 0;
        if (data.selected_months === 3) {
            calculatedDiscount = Number(member.membership_package.discount_quarterly) || 0;
        } else if (data.selected_months === 6) {
            calculatedDiscount = Number(member.membership_package.discount_half_yearly) || 0;
        } else if (data.selected_months === 12) {
            calculatedDiscount = Number(member.membership_package.discount_yearly) || 0;
        }

        const gross = totalMonthlyFees;
        const net = gross - calculatedDiscount;

        setMonthlyFees(monthlyRate);
        setCalculatedMonthlyFees(totalMonthlyFees);
        setGrossAmount(gross);
        setDiscount(calculatedDiscount);
        setNetAmount(Math.max(net, 0));

        const newExpiry = calculateNewExpiryDate(data.selected_months);
        setNewPaymentExpiry(newExpiry);
    }, [data.selected_months]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();

        post(route('renewal.public.store', member.id), {
            onSuccess: () => {
                toast({ description: "Membership renewal submitted, pending admin approval..." });
                onClose();
                reset();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] mx-auto rounded-lg p-6 shadow-lg overflow-auto max-h-[95vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Membership Renewal</DialogTitle>
                    <DialogDescription className="text-sm">
                        Renew membership package of <strong>{member.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Pricing Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Renewal Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Current Expiry Date</span>
                                <strong>{member.payment_expiry_date}</strong>
                            </div>
                            <hr className='my-2' />
                            <div className="flex justify-between">
                                <span>Monthly Fees</span>
                                <span>Rs {monthlyFees}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Monthly Fees</span>
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
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between font-bold">
                                <span>Net Amount</span>
                                <span>Rs {netAmount}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Renewal Form */}
                    <Card>
                        <CardHeader className='pb-0' />
                        <CardContent className="space-y-4">
                            <div className="flex gap-2 bg-muted p-3 rounded-lg">
                                <div className="">
                                    <img
                                        className="size-[40px] rounded-full object-cover"
                                        src={member.photo}
                                        alt={member.name}
                                    />
                                </div>
                                <div className="grow flex flex-col">
                                    <span className='font-semibold font-lg'>{member.name}</span>
                                    <small className='font-xs'>{member.phone}</small>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Renewal Period (in months)</Label>
                                    <Select
                                        value={data.selected_months.toString()}
                                        onValueChange={val => setData('selected_months', Number(val))}
                                    >
                                        <SelectTrigger id="months">
                                            <SelectValue placeholder="Select duration" />
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
                                    <Label>Payment Proof (Optional)</Label>
                                    <Input
                                        type="file"
                                        onChange={(e) => setData('payment_proof', e.target.files ? e.target.files[0] : null)}
                                    />
                                    <InputError message={errors.payment_proof} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Processing...' : 'Confirm Renewal'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PublicRenewPackageDialog;
