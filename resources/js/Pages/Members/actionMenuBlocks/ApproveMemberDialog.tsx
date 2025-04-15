import { Dialog, DialogContent, DialogDescription, DialogHeader } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Member } from "@/types/members";
import { Badge } from "@/Components/ui/badge";
import moment from "moment";
import { approveMember, deleteMember, getSubscriptionStatus, formatDate } from "@/services/member-service";
import { toast } from "@/Components/ui/use-toast";
import { nepaliNumberFormat } from "nepali-number";

export function ApproveMemberDialog({ member, refetch, open, onClose }: { member: Member, refetch: any, open: boolean, onClose: () => void }) {

    const handleApprove = async () => {
        try {
            await approveMember(member.id);
            refetch();
            toast({
                title: 'Member Approved',
                description: 'The member has been approved.',
            });
        } catch (error) {
            // Handle error
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMember(member.id);
            onClose();
            refetch();
        } catch (error) {
            // Handle error
        }
    };

    const subscriptionStatus = getSubscriptionStatus(member);



    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[550px] max-h-[99vh] overflow-auto">
                <Card className="bg-transparent border-none shadow-none">
                    <CardHeader className="py-0 pb-2 text-center">
                        <CardTitle>{member.name}</CardTitle>
                        <DialogDescription>{member.address}</DialogDescription>
                    </CardHeader>
                    <div>
                        <div>
                            <img src={member.photo as string} className="max-w-full max-h-48 mx-auto rounded-lg my-2" />
                        </div>
                        <DialogHeader className="m-0 col-span-4">
                            <Card className="border-none shadow-none">
                                <CardContent>
                                    <div className="flex flex-wrap mb-2 justify-between gap-y-2">
                                        <div className="flex items-center mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">Father:</span>
                                            <span className="text-card-foreground">{member.father_name}</span>
                                        </div>
                                        <div className="flex items-center mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">Phone:</span>
                                            <span className="text-card-foreground">{member.phone}</span>
                                        </div>
                                        <div className="flex items-center mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">Gender:</span>
                                            <span className="text-card-foreground">{member.gender}</span>
                                        </div>
                                        <div className="flex items-center mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">Marital Status:</span>
                                            <span className="text-card-foreground">{member.marital_status}</span>
                                        </div>
                                        <div className="flex items-center mr-6">
                                            <span className="font-semibold text-muted-foreground mr-2">DOB:</span>
                                            <span className="text-card-foreground">{new Date(member.date_of_birth as Date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold text-muted-foreground mr-2">Preferred Time:</span>
                                            <span className="text-card-foreground">{member.preferred_time}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </DialogHeader>
                    </div>
                    <div>
                        <Card className="bg-muted">
                            <CardHeader className="pb-1 text-center">
                                <CardTitle>Membership Information</CardTitle>
                                <CardDescription className="text-card-foreground">
                                    {
                                        member.membership_package.package_name.toLowerCase().indexOf('lifetime') !== -1 ?
                                            <span>Lifetime Membership</span>
                                            :
                                            member.membership_package.package_name.toLowerCase().indexOf('aerobic') !== -1 ?
                                                <span>Aerobic/Gym/Zumba</span>
                                                :
                                                member.end_date !== null ?
                                                    <span>{moment(member.start_date).format("MMM Do YYYY")} to {moment(member.end_date).format("MMM Do YYYY")}</span>
                                                    :
                                                    <span>From {moment(member.start_date).format("MMM Do YYYY")}</span>
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2 mr-6">
                                    <span className="font-semibold text-muted-foreground mr-2">Membership Type:</span>
                                    <span className="text-card-foreground">{member.membership_package.package_name}</span>
                                </div>
                                <div className="mb-2 mr-6">
                                    <span className="font-semibold text-muted-foreground mr-2">Subscription Status:</span>
                                    <span className="text-card-foreground">
                                        <Badge variant={subscriptionStatus.variant} className={subscriptionStatus.className}>
                                            {subscriptionStatus.text}
                                        </Badge>
                                    </span>
                                </div>
                                <div className="mb-2 mr-6">
                                    <span className="font-semibold text-muted-foreground mr-2">Expiry Date:</span>
                                    <span className="text-card-foreground">{formatDate(member.payment_expiry_date)}</span>
                                </div>
                                <div className="mb-2 mr-6">
                                    <span className="font-semibold text-muted-foreground mr-2">Payment:</span>
                                    <span className="text-card-foreground">{
                                        (member as any).payments[0].bill_number > 0 || !(member as any).payments[0].payment_proof ?
                                            <Badge>
                                                Bill No. {
                                                    (member as any).payments[0].bill_number
                                                }
                                            </Badge>
                                            :
                                            <a target="_blank" href={(member as any).payments[0].payment_proof}>
                                                <Button variant={'link'}>View Receipt</Button>
                                            </a>
                                    }</span>
                                </div>
                                <div className="mb-2 mr-6">
                                    <span className="font-semibold text-muted-foreground mr-2">Amount:</span>
                                    <span className="text-card-foreground">Rs {nepaliNumberFormat((member as any).payments[0].amount)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex justify-between mt-4 gap-2">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <div className="space-x-2">
                            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>Delete</Button>
                            <Button onClick={handleApprove}>Approve</Button>
                        </div>
                    </div>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
