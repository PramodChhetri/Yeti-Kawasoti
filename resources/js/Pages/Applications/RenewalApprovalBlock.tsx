import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { Member } from '@/types/members';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from '@/Components/ui/use-toast';
import { CheckCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';

const ConfirmRenewalDialog = ({ application }: { application: any }) => {
    const member = application.member as Member;
    const receivedRef = useRef<HTMLInputElement>(null);

    // Using useForm for form management
    const { data, setData, reset, errors, post, processing, clearErrors } = useForm({
        extra_discount: 0,
        paid_amount: 0,
        bill_number: '',
        payment_mode: 'Cash', // Default to 'Cash'
    });

    const months = Number(application.months);
    const membershipPackage = member.membership_package || {}; // Ensure membership_package exists
    const monthlyFees = Number(membershipPackage.monthly_amount) || 0;
    const calculatedMonthlyFees = months * monthlyFees;
    let packageDiscount = 0;

    switch (months) {
        case 3: packageDiscount = Number(membershipPackage.discount_quarterly) || 0; break;
        case 6: packageDiscount = Number(membershipPackage.discount_half_yearly) || 0; break;
        case 12: packageDiscount = Number(membershipPackage.discount_yearly) || 0; break;
        default: packageDiscount = 0;
    }

    const [netAmount, setNetAmount] = useState(0);
    const actualReceivable = calculatedMonthlyFees - packageDiscount;

    useEffect(() => {
        if (actualReceivable) {
            // Ensure extra_discount and paid_amount are non-negative
            setData('extra_discount', Math.max(0, data.extra_discount));
            setData('paid_amount', Math.max(0, data.paid_amount));
            setNetAmount(actualReceivable - Number(data.extra_discount));
        }
    }, [data.extra_discount, data.paid_amount]);

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
        if (processing) return;

        clearErrors();

        // Validate form fields
        if (!data.payment_mode || !data.bill_number || data.paid_amount <= 0) {
            toast({ description: "Please fill in all required fields correctly.", variant: 'destructive' });
            return;
        }

        // return console.log(data);

        // Posting confirmation of public-side renewal request
        post(route('public-renewal.confirm', application.id), {
            onSuccess: () => {
                toast({ description: "Renewal request confirmed successfully." });
                setOpen(false);
                reset();
            },
            onError: (errors) => {
                console.error(errors);
                toast({ description: "An error occurred during submission.", variant: 'destructive' });
            }
        });
    };

    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button size={'icon'} variant={'ghost'}><CheckCircle className='text-primary' /></Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] mx-auto rounded-lg p-6 shadow-lg overflow-auto max-h-[95vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Confirm Renewal Request</DialogTitle>
                    <DialogDescription className="text-sm">
                        Confirm the renewal request for <strong>{member.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Left Section: Summary */}
                    <Card>
                        <CardHeader className='flex justify-between flex-row'>
                            <CardTitle className="text-lg font-semibold">Pricing Summary</CardTitle>
                            <div>
                                <Popover>
                                    <PopoverTrigger>
                                        <a href='javascript:'><u>Payment Proof</u></a>
                                    </PopoverTrigger>
                                    <PopoverContent className='border rounded-md size-[370px]'>
                                        <img src={application.payment_proof_path} alt="Payment Proof" className='object-contain w-full h-full border' />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <b>{membershipPackage.package_name || 'N/A'}</b>
                            <div className="flex justify-between">
                                <span>Requested Renewal Period</span>
                                <strong>{months} {months === 1 ? "Month" : "Months"}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Monthly Fees</span>
                                <strong>Rs {monthlyFees}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Calculated Monthly Fees</span>
                                <strong>Rs {calculatedMonthlyFees}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span>Package Discount</span>
                                <strong>- Rs {packageDiscount}</strong>
                            </div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between">
                                <span>Actual Receivable</span>
                                <b className='cursor-pointer' onClick={() => {
                                    if (receivedRef.current) {
                                        setData('paid_amount', actualReceivable);
                                        receivedRef.current.value = actualReceivable.toString();
                                    }
                                }}>Rs {actualReceivable}</b>
                            </div>
                            <div className="flex justify-between">
                                <span>Received Amount</span>
                                <span>Rs {data.paid_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Extra Discount</span>
                                <span>- Rs {data.extra_discount}</span>
                            </div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between">
                                <span>{calculateBalanceLabel()}</span>
                                <span>Rs {calculateBalanceAmount()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Section: Form Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-lg'>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label>Payment Method</Label>
                                    <Select
                                        required
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
                                        required
                                        type="text"
                                        placeholder="Enter bill number"
                                        onChange={(e) => setData('bill_number', e.target.value)}
                                    />
                                    <InputError message={errors.bill_number} />
                                </div>

                                <div className="flex gap-x-1 gap-y-2 flex-wrap">
                                    <div className='grow'>
                                        <Label>Extra Discount</Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter extra discount"
                                            onChange={(e) => setData('extra_discount', Math.max(0, Number(e.target.value)))}
                                        />
                                        <InputError message={errors.extra_discount} />
                                    </div>

                                    <div className='grow'>
                                        <Label>Received Amount</Label>
                                        <Input
                                            required
                                            type="number"
                                            placeholder="Enter amount"
                                            ref={receivedRef}
                                            onChange={(e) => setData('paid_amount', Math.max(0, Number(e.target.value)))}
                                        />
                                        <InputError message={errors.paid_amount} />
                                    </div>
                                </div>

                                <Button disabled={processing}>
                                    {processing ? 'Processing...' : 'Confirm Renewal'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter />
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmRenewalDialog;
