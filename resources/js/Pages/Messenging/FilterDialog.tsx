import { useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import { Filter } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { MembershipPackage } from "@/types";
import { Input } from "@/Components/ui/input";
import SegmentedControl from "@/Components/ui/segmented-control";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { ScrollArea } from "@/Components/ui/scroll-area";

interface FilterDialogProps {
    packages: MembershipPackage[];
    initialRecipientType?: string;
    initialFilters?: {
        membership_package_id?: string;
        member_gender?: string;
        member_status?: string;
        member_joining_date_start?: string;
        member_joining_date_end?: string;
        member_expiry_date_start?: string;
        member_expiry_date_end?: string;
        position?: string;
        official_gender?: string;
        official_status?: string;
        official_joining_date_start?: string;
        official_joining_date_end?: string;
    };
}

export default function FilterDialog({
    packages,
    initialRecipientType = "both",
    initialFilters = {},
}: FilterDialogProps) {
    const [open, setOpen] = useState(false);
    const currentUrl = usePage().url;
    const urlParams = new URLSearchParams(window.location.search);

    // State for toggling filters
    const [memberEnabled, setMemberEnabled] = useState(
        initialRecipientType === "members" || initialRecipientType === "both"
    );
    const [officialEnabled, setOfficialEnabled] = useState(
        initialRecipientType === "officials" || initialRecipientType === "both"
    );

    // Initialize Member filter state from URL params or defaults
    const [memberFilters, setMemberFilters] = useState({
        membership_package_id:
            initialFilters.membership_package_id ||
            urlParams.get("membership_package_id") ||
            "all",
        gender:
            initialFilters.member_gender ||
            urlParams.get("member_gender") ||
            "all",
        status:
            initialFilters.member_status ||
            urlParams.get("member_status") ||
            "all",
        joiningDateRange: {
            start:
                initialFilters.member_joining_date_start ||
                urlParams.get("member_joining_date_start") ||
                "",
            end:
                initialFilters.member_joining_date_end ||
                urlParams.get("member_joining_date_end") ||
                "",
        },
        expiryDateRange: {
            start:
                initialFilters.member_expiry_date_start ||
                urlParams.get("member_expiry_date_start") ||
                "",
            end:
                initialFilters.member_expiry_date_end ||
                urlParams.get("member_expiry_date_end") ||
                "",
        },
    });

    // Initialize Official filter state from URL params or defaults
    const [officialFilters, setOfficialFilters] = useState({
        position: initialFilters.position || urlParams.get("position") || "all",
        gender:
            initialFilters.official_gender ||
            urlParams.get("official_gender") ||
            "all",
        status:
            initialFilters.official_status ||
            urlParams.get("official_status") ||
            "all",
    });

    // Segmented Control Handlers for Members - initialize from filter state
    const [memberGender, setMemberGender] = useState(memberFilters.gender);
    const [memberStatus, setMemberStatus] = useState(memberFilters.status);

    // Segmented Control Handlers for Officials - initialize from filter state
    const [officialGender, setOfficialGender] = useState(
        officialFilters.gender
    );
    const [officialStatus, setOfficialStatus] = useState(
        officialFilters.status
    );

    // Effect to update Segmented Controls when filters change
    useEffect(() => {
        setMemberGender(memberFilters.gender);
        setMemberStatus(memberFilters.status);
        setOfficialGender(officialFilters.gender);
        setOfficialStatus(officialFilters.status);
    }, [memberFilters, officialFilters]);

    // Function to handle member filter changes
    const handleMemberFilterChange = (name: string, value: any) => {
        setMemberFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Function to handle official filter changes
    const handleOfficialFilterChange = (name: string, value: any) => {
        setOfficialFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Function to get button label based on filter state
    const getButtonLabel = () => {
        if (memberEnabled && officialEnabled) {
            return "Filter Members & Officials";
        } else if (memberEnabled) {
            return "Filter Members";
        } else if (officialEnabled) {
            return "Filter Officials";
        } else {
            return "Filter Recipients";
        }
    };

    // Function to apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();

        // Only include member filters if enabled
        if (memberEnabled) {
            if (memberFilters.membership_package_id !== "all") {
                params.append(
                    "membership_package_id",
                    memberFilters.membership_package_id
                );
            }
            if (memberFilters.gender !== "all") {
                params.append("member_gender", memberFilters.gender);
            }
            if (memberFilters.status !== "all") {
                params.append("member_status", memberFilters.status);
            }
            if (memberFilters.joiningDateRange.start) {
                params.append(
                    "member_joining_date_start",
                    memberFilters.joiningDateRange.start
                );
            }
            if (memberFilters.joiningDateRange.end) {
                params.append(
                    "member_joining_date_end",
                    memberFilters.joiningDateRange.end
                );
            }
            if (memberFilters.expiryDateRange.start) {
                params.append(
                    "member_expiry_date_start",
                    memberFilters.expiryDateRange.start
                );
            }
            if (memberFilters.expiryDateRange.end) {
                params.append(
                    "member_expiry_date_end",
                    memberFilters.expiryDateRange.end
                );
            }
        }

        // Only include official filters if enabled
        if (officialEnabled) {
            if (officialFilters.position !== "all") {
                params.append("position", officialFilters.position);
            }
            if (officialFilters.gender !== "all") {
                params.append("official_gender", officialFilters.gender);
            }
            if (officialFilters.status !== "all") {
                params.append("official_status", officialFilters.status);
            }
        }

        // Add recipient type based on which filters are enabled
        if (memberEnabled && officialEnabled) {
            params.append("recipient_type", "both");
        } else if (memberEnabled) {
            params.append("recipient_type", "members");
        } else if (officialEnabled) {
            params.append("recipient_type", "officials");
        } else {
            // If neither is enabled, default to "none" to indicate no contacts should be fetched
            params.append("recipient_type", "none");
        }

        // Add a cache buster to ensure the page refreshes with new filter settings
        params.append("cache_buster", Date.now().toString());

        // Navigate with the filters
        router.get("/messenging", Object.fromEntries(params));

        // Close the dialog
        setOpen(false);
    };

    // Clear all filters
    const clearFilters = () => {
        setMemberFilters({
            membership_package_id: "all",
            gender: "all",
            status: "all",
            joiningDateRange: { start: "", end: "" },
            expiryDateRange: { start: "", end: "" },
        });

        setOfficialFilters({
            position: "all",
            gender: "all",
            status: "all",
        });

        // Reset segment controls
        setMemberGender("all");
        setMemberStatus("all");
        setOfficialGender("all");
        setOfficialStatus("all");

        // Reset toggle states to default
        setMemberEnabled(true);
        setOfficialEnabled(true);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="border">
                    <Filter size={14} className="mr-2" /> {getButtonLabel()}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl overflow-hidden p-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-lg font-bold">
                        Filter Recipients
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[75vh] px-6 pb-2">
                    <div className="space-y-6 py-4">
                        {/* Recipient Types */}
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">
                                    Select Recipient Types
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="memberFilter"
                                            checked={memberEnabled}
                                            onCheckedChange={(checked) =>
                                                setMemberEnabled(
                                                    checked as boolean
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="memberFilter"
                                            className="text-base font-semibold cursor-pointer"
                                        >
                                            Members
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="officialFilter"
                                            checked={officialEnabled}
                                            onCheckedChange={(checked) =>
                                                setOfficialEnabled(
                                                    checked as boolean
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="officialFilter"
                                            className="text-base font-semibold cursor-pointer"
                                        >
                                            Officials
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Member Filters */}
                        {memberEnabled && (
                            <Card>
                                <CardHeader className="py-3">
                                    <CardTitle className="text-base">
                                        Member Filters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-medium">
                                                Package
                                            </Label>
                                            <Select
                                                value={
                                                    memberFilters.membership_package_id
                                                }
                                                onValueChange={(value) =>
                                                    handleMemberFilterChange(
                                                        "membership_package_id",
                                                        value
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1.5">
                                                    <SelectValue placeholder="Select package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Packages
                                                    </SelectItem>
                                                    {packages.map((pkg) => (
                                                        <SelectItem
                                                            key={pkg.id}
                                                            value={pkg.id.toString()}
                                                        >
                                                            {pkg.package_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="font-medium">
                                                Gender
                                            </Label>
                                            <SegmentedControl
                                                items={[
                                                    {
                                                        label: "Male",
                                                        value: "male",
                                                    },
                                                    {
                                                        label: "Female",
                                                        value: "female",
                                                    },
                                                    {
                                                        label: "All",
                                                        value: "all",
                                                    },
                                                ]}
                                                value={memberGender}
                                                onChange={(value) => {
                                                    setMemberGender(value);
                                                    handleMemberFilterChange(
                                                        "gender",
                                                        value
                                                    );
                                                }}
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <Label className="font-medium">
                                                Status
                                            </Label>
                                            <SegmentedControl
                                                items={[
                                                    {
                                                        label: "Active",
                                                        value: "active",
                                                    },
                                                    {
                                                        label: "Expired",
                                                        value: "expired",
                                                    },
                                                    {
                                                        label: "Unapproved",
                                                        value: "unapproved",
                                                    },
                                                    {
                                                        label: "All",
                                                        value: "all",
                                                    },
                                                ]}
                                                value={memberStatus}
                                                onChange={(value) => {
                                                    setMemberStatus(value);
                                                    handleMemberFilterChange(
                                                        "status",
                                                        value
                                                    );
                                                }}
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div>
                                            <Label className="font-medium">
                                                Joining Date Range
                                            </Label>
                                            <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                                                <div className="flex-1">
                                                    <Label className="text-xs text-muted-foreground">
                                                        From
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            memberFilters
                                                                .joiningDateRange
                                                                .start
                                                        }
                                                        onChange={(e) =>
                                                            handleMemberFilterChange(
                                                                "joiningDateRange",
                                                                {
                                                                    ...memberFilters.joiningDateRange,
                                                                    start: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="mt-0.5"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-xs text-muted-foreground">
                                                        To
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            memberFilters
                                                                .joiningDateRange
                                                                .end
                                                        }
                                                        onChange={(e) =>
                                                            handleMemberFilterChange(
                                                                "joiningDateRange",
                                                                {
                                                                    ...memberFilters.joiningDateRange,
                                                                    end: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="mt-0.5"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="font-medium">
                                                Expiry Date Range
                                            </Label>
                                            <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                                                <div className="flex-1">
                                                    <Label className="text-xs text-muted-foreground">
                                                        From
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            memberFilters
                                                                .expiryDateRange
                                                                .start
                                                        }
                                                        onChange={(e) =>
                                                            handleMemberFilterChange(
                                                                "expiryDateRange",
                                                                {
                                                                    ...memberFilters.expiryDateRange,
                                                                    start: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="mt-0.5"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-xs text-muted-foreground">
                                                        To
                                                    </Label>
                                                    <Input
                                                        type="date"
                                                        value={
                                                            memberFilters
                                                                .expiryDateRange
                                                                .end
                                                        }
                                                        onChange={(e) =>
                                                            handleMemberFilterChange(
                                                                "expiryDateRange",
                                                                {
                                                                    ...memberFilters.expiryDateRange,
                                                                    end: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        className="mt-0.5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Officials Filters */}
                        {officialEnabled && (
                            <Card>
                                <CardHeader className="py-3">
                                    <CardTitle className="text-base">
                                        Official Filters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-medium">
                                                Position
                                            </Label>
                                            <Select
                                                value={officialFilters.position}
                                                onValueChange={(value) =>
                                                    handleOfficialFilterChange(
                                                        "position",
                                                        value
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1.5">
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All Positions
                                                    </SelectItem>
                                                    <SelectItem value="Owner">
                                                        Owner
                                                    </SelectItem>
                                                    <SelectItem value="Manager">
                                                        Manager
                                                    </SelectItem>
                                                    <SelectItem value="Trainer">
                                                        Trainer
                                                    </SelectItem>
                                                    <SelectItem value="Reception">
                                                        Reception
                                                    </SelectItem>
                                                    <SelectItem value="Guard">
                                                        Guard
                                                    </SelectItem>
                                                    <SelectItem value="House-Keeping">
                                                        House Keeping
                                                    </SelectItem>
                                                    <SelectItem value="other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="font-medium">
                                                Gender
                                            </Label>
                                            <SegmentedControl
                                                items={[
                                                    {
                                                        label: "Male",
                                                        value: "male",
                                                    },
                                                    {
                                                        label: "Female",
                                                        value: "female",
                                                    },
                                                    {
                                                        label: "All",
                                                        value: "all",
                                                    },
                                                ]}
                                                value={officialGender}
                                                onChange={(value) => {
                                                    setOfficialGender(value);
                                                    handleOfficialFilterChange(
                                                        "gender",
                                                        value
                                                    );
                                                }}
                                                className="mt-1.5"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <Label className="font-medium">
                                                Status
                                            </Label>
                                            <SegmentedControl
                                                items={[
                                                    {
                                                        label: "Active",
                                                        value: "active",
                                                    },
                                                    {
                                                        label: "Inactive",
                                                        value: "inactive",
                                                    },
                                                    {
                                                        label: "All",
                                                        value: "all",
                                                    },
                                                ]}
                                                value={officialStatus}
                                                onChange={(value) => {
                                                    setOfficialStatus(value);
                                                    handleOfficialFilterChange(
                                                        "status",
                                                        value
                                                    );
                                                }}
                                                className="mt-1.5"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 pt-2 border-t">
                    <Button variant="outline" onClick={clearFilters}>
                        Clear All
                    </Button>
                    <Button onClick={applyFilters}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
