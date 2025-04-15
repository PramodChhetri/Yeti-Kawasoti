import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Official } from "@/types";


export function ViewStaffDialog({ official, open, onClose }: { official: Official, open: boolean, onClose: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[880px] max-h-[99vh] overflow-auto">
                <Card className="bg-transparent border-none shadow-none">
                    <CardHeader className="py-0 pb-2 text-center">
                        <CardTitle>{official.name}</CardTitle>
                        <DialogDescription>Status: {official.status=='active' ? <Badge variant={'default'}>Active</Badge> : <Badge variant={'secondary'} className='text-muted-foreground'>Disabled</Badge>}</DialogDescription>
                    </CardHeader>
                    <div className="space-y-4">
                        <div>
                            {official.photo && (
                                <img src={official.photo} alt={`${official.name}'s photo`} className="max-w-full max-h-48 mx-auto rounded-lg" />
                            )}
                        </div>
                        <DialogHeader className="m-0 col-span-4">
                            <Card className="border-none shadow-none">
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">Phone:</span>
                                            <span className="text-card-foreground">{official.phone}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">Gender:</span>
                                            <span className="text-card-foreground">{official.gender}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">Active:</span>
                                            <span className="text-card-foreground">{official.is_active ? "Yes" : "No"}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">Joining Date:</span>
                                            <span className="text-card-foreground">{official.joining_date || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-muted-foreground me-2">Position:</span>
                                            <span className="text-card-foreground">{official.position}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </DialogHeader>
                    </div>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
