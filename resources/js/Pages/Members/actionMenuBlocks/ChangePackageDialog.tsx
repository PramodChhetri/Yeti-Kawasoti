import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { MembershipPackage } from "@/types";
import { Member } from "@/types/members";
import { useForm, usePage } from "@inertiajs/react";
import { FormEvent, useContext } from "react";

export function ChangePackageDialog({ member, open, onClose }: { member: Member, open: boolean, onClose: () => void }) {
    const { put, errors, data, setData, processing } = useForm({
        package_id: ""
    });

    const packages = usePage().props.packages as MembershipPackage[];

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (processing)
            return;
        put(`/update-package/${member.id}`, {
            onSuccess: () => {
                onClose();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Change membership package...</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-3">
                    <div>
                        <Label> Current Package: </Label><span className="font-bold">{member.membership_package.package_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>Choose new Package</Label>
                        <Select
                            defaultValue={member.membership_package_id.toString()}
                            onValueChange={val => setData('package_id', val)}
                        >
                            <SelectTrigger className="max-w-[250px]">
                                <SelectValue placeholder="Select a membership package" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {
                                        packages.map((p: MembershipPackage) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.package_name}</SelectItem>
                                        ))
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <InputError message={errors.package_id} />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {
                                processing ? "Processing..." : "Change Package"
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
