import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { Official } from "@/types";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import EditDialog from "./EditStaffDialog";
import axios from "axios";
import { toast } from "@/Components/ui/use-toast";
import DisableStaffDialog from "./DisableStaffDialog";
import { ViewStaffDialog } from "./ViewStaffDialog";
import { StaffAccountsDialog } from "./StaffAccountsDialog";

export default function OfficialTableActions({ refetch, official }: { refetch: () => void, official: Official }) {
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openViewAccount, setOpenViewAccount] = useState(false);
    const [openDisableStaff, setOpenDisableStaff] = useState(false);
    const [isEnabling, setIsEnabling] = useState(false); 

    const handleEnableStaff = (id: number) => {
        setIsEnabling(true);
        axios
            .put(`/enable-staff/${id}`)
            .then(() => {
                toast({ description: "Staff enabled successfully" });
                refetch(); 
            })
            .catch(() => {
                toast({ description: "Failed to enable staff", variant: "destructive" });
            })
            .finally(() => {
                setIsEnabling(false); 
            });
    };

    return (
        <div>
            {/* Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {/* View */}
                    <DropdownMenuItem onClick={() => setOpenView(true)}>View</DropdownMenuItem>
                    {/* Edit Action */}
                    <DropdownMenuItem onClick={() => setOpenEdit(true)}>Edit</DropdownMenuItem>
                    {/* Enable/Disable */}
                    {official.status === "disabled" ? (
                        <DropdownMenuItem disabled={isEnabling} onClick={() => handleEnableStaff(official.id)}>
                            {isEnabling ? "Enabling..." : "Enable"}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => setOpenDisableStaff(true)}>Disable</DropdownMenuItem>
                    )}
                    {/* View Account */}
                    <DropdownMenuItem onClick={() => setOpenViewAccount(true)}>Accounts</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>


            {/* View Staff Dialog */}
            {openView && (
                <ViewStaffDialog
                    official={official}
                    open={openView}
                    onClose={() => setOpenView(false)}
                />
            )}

            {/* Edit Dialog */}
            {openEdit && (
                <EditDialog
                    refetch={refetch}
                    official={official}
                    onClose={() => setOpenEdit(false)}
                />
            )}

            {/* Disable Staff Dialog */}
            {openDisableStaff && (
                <DisableStaffDialog
                    refetch={refetch}
                    staff={official}
                    onClose={() => setOpenDisableStaff(false)} 
                />
            )}


            {/* View Account Dialog */}
            {openViewAccount && (
                <StaffAccountsDialog
                    official={official}
                    open={openViewAccount}
                    onClose={() => setOpenViewAccount(false)}
                    refetch={refetch}
                />
            )}
        </div>
    );
}
