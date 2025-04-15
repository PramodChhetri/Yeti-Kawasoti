import InputError from "@/Components/InputError";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "@/Components/ui/use-toast";
import { Official } from "@/types";
import { Member } from "@/types/members";
import { useForm } from "@inertiajs/react";
import axios from "axios";
import { format } from "date-fns";
import { FormEvent, useEffect, useMemo } from "react";

export function StaffAccountsDialog({ refetch, official, open, onClose }: {refetch: () => void,  official: Official, open: boolean, onClose: () => void }) {

    console.log(official);

    // Combine all types of payments into a unified array
    const ledger = Object.values(official?.transactions || []);

    const AddTransactionDialog = () => {

        const { data, setData, errors, post, processing, reset } = useForm({
            official_id: official.id,
            transaction_type: '',
            description: '',
            amount: '',
            transaction_date: '',
            voucher_number: '',
        });

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
        
            if (!data.transaction_type || !data.amount || !data.transaction_date) {
                toast({ description: 'Please fill all required fields!' });
                return;
            }
        
            post('/official-transactions/store', {
                onSuccess: () => {
                    toast({ description: 'Transaction created successfully!' });
                    reset();
                    refetch(); 

                },
                onError: (err) => {
                    console.error('Submission error:', err);
                    toast({ description: 'Failed to create Transaction.' });
                },
            });
        };
        

        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant={"default"} className="w-fit ms-auto">Add Transaction</Button>
                </DialogTrigger>
                <DialogContent className="max-w-[500px]">
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Add Transaction</h4>
                            <p className="text-sm text-muted-foreground">
                                Enter the transaction details for <strong>{official.name}</strong>
                            </p>
                        </div>
                        <div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Transaction Type</Label>
                                    <Select
                                        value={data.transaction_type}
                                        onValueChange={(val) => setData('transaction_type', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="advance_payment">Advance Payment</SelectItem>
                                            <SelectItem value="salary_payment">Salary Payment</SelectItem>
                                            <SelectItem value="bonus">Bonus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.transaction_type} />
                                </div>

                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                    />
                                    <InputError message={errors.amount} />
                                </div>

                                <div>
                                    <Label>Transaction Date</Label>
                                    <Input
                                        type="date"
                                        value={data.transaction_date}
                                        onChange={(e) => setData('transaction_date', e.target.value)}
                                    />
                                    <InputError message={errors.transaction_date} />
                                </div>

                                <div>
                                    <Label>Voucher Number (optional)</Label>
                                    <Input
                                        placeholder="Enter voucher number (if applicable)"
                                        onChange={(e) => setData('voucher_number', e.target.value)}
                                    />
                                    <InputError message={errors.voucher_number} />
                                </div>
                            </div>

                            {/* Full-width for larger fields */}
                            <div className="grid grid-cols-1 gap-4 mt-4">
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        placeholder="Enter Description of the transaction"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="mt-4 w-full" disabled={processing}>
                                {processing ? 'Processing...' : 'Create Transaction'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[1600px] w-[95vw] max-h-[99vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Official Transactions</DialogTitle>
                    <DialogDescription>Efficiently analyze the payments of a official.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-2">
                <Card className="bg-blue-500">
                    <CardHeader>
                        <CardTitle className="text-white">{ledger.length}</CardTitle>
                        <CardDescription className="text-white/80">Total Transactions</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-fuchsia-600">
                    <CardHeader>
                        <CardTitle className="text-white">
                            Rs {ledger.reduce((sum, t) => sum + Number(t.amount), 0)}
                        </CardTitle>
                        <CardDescription className="text-white/80">Total Paid Amount</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-green-500">
                    <CardHeader>
                        <CardTitle className="text-white">
                            Rs{" "}
                            {ledger
                                .filter((t) => t.transaction_type === "advance_payment")
                                .reduce((sum, t) => sum + Number(t.amount), 0)}
                        </CardTitle>
                        <CardDescription className="text-white/80">Total Advanced Salary</CardDescription>
                    </CardHeader>
                </Card>

                </div>
                <div className="w-fit ms-auto space-x-2">
                    <AddTransactionDialog />
                </div>
                <Card>
                    <CardContent>
                        <Table className="text-center">
                            <TableHeader>
                                <TableRow className="hover:bg-card">
                                    <TableHead className="text-center">Transaction Date</TableHead>
                                    <TableHead className="text-center">Paid Amount</TableHead>
                                    <TableHead className="text-center">Voucher No.</TableHead>
                                    <TableHead className="text-center">Transaction Type</TableHead>
                                    <TableHead className="text-center">Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {ledger.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No transactions available.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ledger.map((transaction: any, index: number) => (
                                        <TableRow key={transaction.id || `transaction-${index}`} className="hover:bg-muted/15">
                                            {/* Date formatted to "dd MMM yyyy" */}
                                            <TableCell>{format(new Date(transaction.transaction_date), 'dd MMM yyyy')}</TableCell>
                                            {/* Paid Amount */}
                                            <TableCell>Rs {Number(transaction.amount)}</TableCell>
                                            {/* Voucher Number */}
                                            <TableCell>{transaction.voucher_number || "-"}</TableCell>
                                            {/* Transaction Type */}
                                            <TableCell>
                                                {transaction.transaction_type.replace(/_/g, " ").replace(/\b\w/g, (char : any) => char.toUpperCase())}
                                            </TableCell>
                                            {/* Remarks */}
                                            <TableCell>{transaction.description || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>

                        </Table>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
