import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { toast } from "@/Components/ui/use-toast";
import { getSubscriptionStatus } from "@/services/member-service";
import { Member } from "@/types/members";
import { router } from "@inertiajs/react";
import moment from "moment";
import { useState } from "react";

export function ViewMemberDialog({
    member,
    open,
    onClose,
}: {
    member: Member;
    open: boolean;
    onClose: () => void;
}) {
    const subscriptionStatus = getSubscriptionStatus(member);

    const UnassignBlock = () => {
        const [open, setOpen] = useState(false);
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                    <Button variant={"link"} className="text-muted-foreground">
                        Unassign
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Are you sure to unassign the locker?
                        </DialogTitle>
                        <DialogDescription>
                            Unassigning the locker will allow you to assign it
                            to another member.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant={"secondary"} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            variant={"destructive"}
                            onClick={() => {
                                router.delete(
                                    route("locker.delete", member.id),
                                    {
                                        onSuccess: () => {
                                            toast({
                                                description:
                                                    "Locker unassigned successfully...",
                                            });
                                            onClose();
                                            setOpen(false);
                                        },
                                    }
                                );
                            }}
                        >
                            Unassign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[880px] max-h-[99vh] overflow-auto">
                <Card className="bg-transparent border-none shadow-none">
                    <CardHeader className="py-0 pb-2 text-center">
                        <CardTitle>{member.name}</CardTitle>
                        <DialogDescription>{member.address}</DialogDescription>
                    </CardHeader>
                    <div className="space-y-4">
                        <div>
                            <img
                                src={member.photo as string}
                                className="max-w-full max-h-48 mx-auto rounded-lg"
                            />
                        </div>
                        <DialogHeader className="m-0 col-span-4">
                            <Card className="border-none shadow-none">
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                Phone:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.phone}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                Gender:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.gender}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                Marital Status:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.marital_status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                DOB:
                                            </span>
                                            <span className="text-card-foreground">
                                                {new Date(
                                                    member.date_of_birth as Date
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                Preferred Time:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.preferred_time}
                                            </span>
                                        </div>

                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                Occupation:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.occupation}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                Emergency Contact Person:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.emergency_person_name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">
                                                Emergency Contact Number:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.emergency_person_phone}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </DialogHeader>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Membership Information */}
                        <div>
                            <Card className="bg-muted h-full">
                                <CardHeader className="pb-1 text-center">
                                    <CardTitle className="text-start text-lg pb-0">
                                        Membership Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2">
                                        <span className="font-semibold text-muted-foreground mr-2">
                                            Package Name:
                                        </span>
                                        <span className="text-card-foreground">
                                            {
                                                member.membership_package
                                                    .package_name
                                            }
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-muted-foreground mr-2">
                                            Expiry Date:
                                        </span>
                                        <span className="text-card-foreground">
                                            {moment(
                                                new Date(
                                                    member.payment_expiry_date
                                                )
                                            ).format("MMM Do YYYY")}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-muted-foreground mr-2">
                                            Subscription Status:
                                        </span>
                                        <span className="text-card-foreground">
                                            <Badge
                                                variant={
                                                    subscriptionStatus.variant
                                                }
                                                className={
                                                    subscriptionStatus.className
                                                }
                                            >
                                                {subscriptionStatus.text}
                                            </Badge>
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="font-semibold text-muted-foreground mr-2">
                                            Card Number:
                                        </span>
                                        <Badge variant="default">
                                            {member.card_number}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Locker Information */}
                        {member.locker && (
                            <div>
                                <Card className="bg-muted h-full">
                                    <CardHeader className="pb-1 text-center">
                                        <CardTitle className="text-lg flex justify-between">
                                            <span>Locker Information</span>
                                            <UnassignBlock />
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-2 mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">
                                                Locker Number:
                                            </span>
                                            <span className="text-card-foreground">
                                                {member.locker.locker_number}
                                            </span>
                                        </div>
                                        <div className="mb-2 mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">
                                                Assigned Till:
                                            </span>
                                            <span className="text-card-foreground">
                                                {moment(
                                                    new Date(
                                                        member.locker.end_date
                                                    )
                                                ).format("MMM Do YYYY")}
                                            </span>
                                        </div>
                                        <div className="mb-2 mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">
                                                Locker Status:
                                            </span>
                                            <Badge
                                                variant={
                                                    new Date(
                                                        member.locker.end_date
                                                    ) < new Date()
                                                        ? "destructive"
                                                        : member.locker
                                                              .locker_status ===
                                                          1
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {new Date(
                                                    member.locker.end_date
                                                ) < new Date()
                                                    ? "Expired"
                                                    : member.locker
                                                          .locker_status === 1
                                                    ? "Active"
                                                    : "Inactive"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {member?.remarks && member.remarks.length > 0 && (
                        <div className="mb-2 mr-6 bg-card/30 p-3 rounded shadow-sm">
                            <span className="text-muted-foreground font-bold">
                                Remarks
                            </span>
                            <div className="text-card-foreground text-sm">
                                {member.remarks}
                            </div>
                        </div>
                    )}
                </Card>
            </DialogContent>
        </Dialog>
    );
}
