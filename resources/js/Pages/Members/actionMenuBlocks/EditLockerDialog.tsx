import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Member } from "@/types/members";
import { useState } from "react";
import { toast } from "@/Components/ui/use-toast";

interface EditLockerDialogProps {
    member: Member;
    open: boolean;
    onClose: () => void;
}

export default function EditLockerDialog({ member, open, onClose }: EditLockerDialogProps) {
    const { data, setData, post, errors } = useForm({
        locker_number: member.active_locker?.locker_number || '', // Pre-fill with current locker number
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit the form to update the locker number
        post(`/member/${member.id}/locker/edit`, {
            onSuccess: () => {
                onClose();
                toast({
                    description: 'Locker number updated successfully...',
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Locker Number</DialogTitle>
                    <DialogDescription>Edit the locker number for {member.name}.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <Label>Locker Number</Label>
                        <Input
                            value={data.locker_number}
                            onChange={(e) => setData('locker_number', e.target.value)}
                            placeholder="Enter new locker number"
                        />
                        {errors.locker_number && (
                            <div className="text-red-600">{errors.locker_number}</div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
