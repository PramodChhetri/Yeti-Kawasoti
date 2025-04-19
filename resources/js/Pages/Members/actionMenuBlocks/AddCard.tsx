import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Member } from "@/types/members";
import { toast } from "@/Components/ui/use-toast";

interface AddCardDialogProps {
    member: Member;
    open: boolean;
    onClose: () => void;
}

export default function AddCardDialog({
    member,
    open,
    onClose,
}: AddCardDialogProps) {
    const { data, setData, post, errors } = useForm({
        card_number: "", // Pre-fill with current card number
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Submit the form to update the card number
        post(`/members/${member.id}/add-card`, {
            onSuccess: () => {
                onClose();
                toast({
                    description: "Card added successfully...",
                });
                setData("card_number", "");
            },
            onError: (error: any) => {
                // Check if error.response is available and handle accordingly
                if (error.error) {
                    toast({
                        variant: "destructive",
                        description: error.error || "Error adding card.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        description:
                            "Error adding card... Please try again later.",
                    });
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Card</DialogTitle>
                    <DialogDescription>
                        Add the card number for {member.name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <Label>Card Number</Label>
                        <Input
                            value={data.card_number}
                            onChange={(e) =>
                                setData("card_number", e.target.value)
                            }
                            placeholder="Enter new card number"
                        />
                        {errors.card_number && (
                            <div className="text-red-600">
                                {errors.card_number}
                            </div>
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
