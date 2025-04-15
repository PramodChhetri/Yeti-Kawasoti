import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { toast } from "@/Components/ui/use-toast";
import { Member } from "@/types/members";
import { useForm } from "@inertiajs/react";
import { useContext } from "react";

export function DeleteCard({
    member,
    open,
    onClose,
}: {
    member: Member;
    open: boolean;
    onClose: () => void;
}) {
    const { post } = useForm();

    const handleDelete = () => {
        post(`/members/${member.id}/remove-card`, {
            onSuccess: () => {
                onClose();
                toast({
                    description: "Card deleted successfully...",
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete card for this member?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
