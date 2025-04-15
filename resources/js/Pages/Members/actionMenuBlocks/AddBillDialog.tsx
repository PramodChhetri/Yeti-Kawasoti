import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Member } from "@/types/members";
import { useForm } from "@inertiajs/react";
import { FormEvent, useContext } from "react";

export function AddBillDialog({ member, refetch, open, onClose }: { member: Member, refetch: any, open: boolean, onClose: () => void }) {
    const { put, data, setData, errors, setError } = useForm({
        bill_number: 0
    });

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setError("bill_number", '');
        if (Number(data.bill_number) === 0 || !data.bill_number)
            return setError('bill_number', 'Invalid bill number');

        

    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Set Bill Number</DialogTitle>
                    <DialogDescription>This will apply to the latest payment of <b>{member.name}</b></DialogDescription>
                </DialogHeader>

                <form onSubmit={submit}>
                    <Label htmlFor="bill_number">Bill Number</Label>
                    <Input
                        type="number"
                        id="bill_number"
                        onChange={(e) => setData('bill_number', parseInt(e.target.value))}
                    />
                    <InputError message={errors.bill_number} />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" onClick={submit}>Assign</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
