import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { toast } from "@/Components/ui/use-toast";
import { Official } from "@/types";
import axios from "axios";
import React, { useState } from "react";

const DisableStaffDialog = ({ refetch, staff, onClose }: { refetch: () => void, staff: Official, onClose: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const disableStaff = () => {
        setIsLoading(true);
        axios
            .put(`/disable-staff/${staff.id}`)
            .then(() => {
                toast({ description: "Staff disabled successfully" });
                refetch(); // Refresh data
                onClose(); // Close dialog
            })
            .catch(() => {
                toast({ description: "Failed to disable staff", variant: "destructive" });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Disable Staff</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to disable this staff member?
                    </DialogDescription>
                    <div className="text-end">
                        <Button variant="destructive" onClick={disableStaff} disabled={isLoading}>
                            {isLoading ? "Disabling..." : "Disable"}
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default DisableStaffDialog;
