import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { toast } from "@/Components/ui/use-toast";
import { Member } from "@/types/members";
import { useForm, usePage } from "@inertiajs/react";
import { FormEvent, useState, useEffect } from "react";

interface Locker {
    id: number;
    months: number;
    price: number;
}

export function LockerDialog({ member, open, onClose }: { member: Member; open: boolean; onClose: () => void }) {
    const { post, data, setData, errors, setError } = useForm({
        locker_id: '', // Locker ID from the dropdown
        locker_number: '', // Number entered manually
        bill_number: '', // Bill number
        locker_discount: '0', // Discount entered
        paid_amount: '', // Amount paid by the member
        payment_mode: 'Cash', // Default payment mode
        start_date: new Date().toISOString().split('T')[0], // Set start date as current date
    });

    const lockers = usePage().props.lockers as Locker[]; // Assuming lockers are passed from backend
    const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);

    // Set selected locker and calculate total based on locker_id
    useEffect(() => {
        if (data.locker_id) {
            const selected = lockers.find((locker) => locker.id.toString() === data.locker_id) || null;
            setSelectedLocker(selected);

            if (selected) {
                setData('paid_amount', selected.price.toString()); // Set paid amount to locker price by default
                setTotalAmount(selected.price); // Set total amount based on locker price
            }
        }
    }, [data.locker_id]);

    // Calculate the total amount and balance based on discount and paid amount
    useEffect(() => {
        if (selectedLocker && data.locker_discount) {
            const discount = Number(data.locker_discount);
            if (discount > selectedLocker.price) {
                setDiscountError('Discount cannot exceed the locker price.');
            } else {
                setDiscountError(null);
                const newTotal = selectedLocker.price - discount;
                setTotalAmount(newTotal); // Set total after discount
                const balanceCalc = Number(data.paid_amount) - newTotal;
                setBalance(balanceCalc); // Set balance (outstanding or advance)
            }
        }
    }, [data.locker_discount, data.paid_amount, selectedLocker]);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError('bill_number', '');
        if (!data.bill_number) {
            return setError('bill_number', 'Bill number is required.');
        }

        if (discountError) return; // Prevent submission if discount error exists

        // Submit form to backend
        post(`/member/${member.id}/locker/${data.locker_id}`, {
            onSuccess: () => {
                onClose();
                toast({
                    description: `Locker assigned to ${member.name} successfully`,
                    dir: 'left'
                });
            },
        });
    };

    const calculateOutstandingOrAdvance = () => {
        if (balance < 0) {
            return { label: 'Outstanding Amount', amount: Math.abs(balance) };
        } else if (balance > 0) {
            return { label: 'Advance Amount', amount: balance };
        } else {
            return null; // Fully paid, no balance
        }
    };

    const paymentSummary = calculateOutstandingOrAdvance();


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Locker</DialogTitle>
                    <DialogDescription>
                        Provide a locker for <b>{member.name}</b>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div>
                        <Label>Choose Locker Duration</Label>
                        <Select onValueChange={(val) => setData('locker_id', val)} value={data.locker_id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Locker Duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {lockers.map((locker) => (
                                    <SelectItem key={locker.id} value={locker.id.toString()}>
                                        {locker.months} Months - Rs. {locker.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <Label>Payment Mode</Label>
                            <Select defaultValue="Cash" onValueChange={(value) => setData('payment_mode', value)} value={data.payment_mode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Payment Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="QR">QR</SelectItem>
                                    <SelectItem value="Cash + QR">Cash + QR</SelectItem>
                                    <SelectItem value="Free">Free</SelectItem>
                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <Label>Locker Number</Label>
                            <Input
                                value={data.locker_number}
                                onChange={(e) => setData('locker_number', e.target.value)}
                                placeholder="Enter locker number"
                                required
                            />
                            {errors.locker_number && <InputError message={errors.locker_number} />}
                        </div>

                        <div>
                            <Label>Bill Number</Label>
                            <Input
                                onChange={(e) => setData('bill_number', e.target.value)}
                                placeholder="Enter bill number"
                                required
                            />
                            {errors.bill_number && <InputError message={errors.bill_number} />}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <Label>Discount</Label>
                            <Input
                                type="number"
                                onChange={(e) => setData('locker_discount', e.target.value)}
                                placeholder="Enter discount (if any)"
                            />
                            {discountError && <InputError message={discountError} />}
                        </div>

                        <div>
                            <Label>Paid Amount</Label>
                            <Input
                                type="number"
                                value={data.paid_amount}
                                onChange={(e) => setData('paid_amount', e.target.value)}
                                placeholder="Enter paid amount"
                                required
                            />
                        </div>
                    </div>

                    {selectedLocker && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h3 className="text-lg font-medium">Payment Summary</h3>
                            <p>
                                <b>Locker Duration:</b> {selectedLocker.months} months
                            </p>
                            <p>
                                <b>Price:</b> Rs. {selectedLocker.price}
                            </p>
                            <p>
                                <b>Discount:</b> Rs. {data.locker_discount || 0}
                            </p>
                            <p>
                                <b>Total Amount:</b> Rs {totalAmount}
                            </p>
                            {paymentSummary && (
                                <p>
                                    <b>{paymentSummary.label}:</b> Rs {paymentSummary.amount}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={!!discountError || !data.bill_number || !selectedLocker}>
                            Assign Locker
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
