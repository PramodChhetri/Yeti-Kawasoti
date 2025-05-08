import { useState, useEffect } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import SegmentedControl from "@/Components/ui/segmented-control";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Filter } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { MembershipPackage } from "@/types";

interface CombinedFilterDialogProps {
    packages: MembershipPackage[];
    recipientType: string;
}

function parseFiltersFromUrl(url: string) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    const filters: any = {};

    // Helper function to set nested properties
    const setNestedValue = (obj: any, keys: string[], value: string) => {
        keys.reduce((acc, key, index) => {
            if (index === keys.length - 1) {
                acc[key] = value; // Set the value at the last key
            } else {
                acc[key] = acc[key] || {}; // Create an object if it doesn't exist
            }
            return acc[key];
        }, obj);
    };

    // Extract filters from URL params
    for (const [key, value] of urlParams.entries()) {
        if (key.startsWith("filter[")) {
            // Extract the inner key from the URL parameter
            const match = key.match(/filter\[(.+?)\]/);
            if (match && match[1]) {
                const filterKey = match[1];

                // Split the filterKey into parts for nested structure
                const keys = filterKey.split(/\[|\]/).filter(Boolean);

                // Set the value in the nested structure
                setNestedValue(filters, keys, value);
            }
        }
    }

    return filters;
}

export default function CombinedFilterDialog({
    packages,
    recipientType,
}: CombinedFilterDialogProps) {
    const currentUrl = usePage().url;
    const initialFilters = parseFiltersFromUrl(currentUrl);
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("members");

    // Member filters state
    const [memberFilters, setMemberFilters] = useState({
        membership_package_id: initialFilters.membership_package_id || "all",
        gender: initialFilters.gender || "all",
        status: initialFilters.status || "all",
        joiningDateRange: {
            start: initialFilters.start_date?.start || "",
            end: initialFilters.start_date?.end || "",
        },
        expiryDateRange: {
            start: initialFilters.payment_expiry_date?.start || "",
            end: initialFilters.payment_expiry_date?.end || "",
        },
    });

    // Official filters state
    const [officialFilters, setOfficialFilters] = useState({
        position: initialFilters.position || "all",
        gender: initialFilters.gender || "all",
        status: initialFilters.status || "all",
        joiningDateRange: {
            start: initialFilters.joining_date?.start || "",
            end: initialFilters.joining_date?.end || "",
        },
    });

    // SegmentedControl state for Member filters
    const [selectedMemberGender, setSelectedMemberGender] = useState(
        memberFilters.gender
    );
    const [selectedMemberStatus, setSelectedMemberStatus] = useState(
        memberFilters.status
    );

    // SegmentedControl state for Official filters
    const [selectedOfficialGender, setSelectedOfficialGender] = useState(
        officialFilters.gender
    );
    const [selectedOfficialStatus, setSelectedOfficialStatus] = useState(
        officialFilters.status
    );

    useEffect(() => {
        setSelectedMemberGender(memberFilters.gender);
        setSelectedMemberStatus(memberFilters.status);
        setSelectedOfficialGender(officialFilters.gender);
        setSelectedOfficialStatus(officialFilters.status);
    }, [
        memberFilters.gender,
        memberFilters.status,
        officialFilters.gender,
        officialFilters.status,
    ]);

    // Handle change in member filters
    const handleMemberFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setMemberFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle change in official filters
    const handleOfficialFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setOfficialFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Apply both member and official filters
    const applyFilters = () => {
        const urlParams = new URLSearchParams();

        // Add recipient type as a query parameter
        urlParams.append("recipient_type", recipientType);

        // Make sure auto_load is false when applying filters
        urlParams.append("auto_load", "false");

        // Determine which filters to apply based on the active tab
        if (activeTab === "members" || activeTab === "both") {
            // Add member filter flag
            urlParams.append("filter[member_filter]", "true");

            // Apply member filters
            if (memberFilters.membership_package_id !== "all") {
                urlParams.append(
                    "filter[membership_package_id]",
                    memberFilters.membership_package_id
                );
            }

            if (memberFilters.gender !== "all") {
                urlParams.append("filter[gender]", memberFilters.gender);
            }

            if (memberFilters.status !== "all") {
                urlParams.append("filter[status]", memberFilters.status);
            }

            if (memberFilters.joiningDateRange.start) {
                urlParams.append(
                    "filter[start_date][start]",
                    memberFilters.joiningDateRange.start
                );
            }

            if (memberFilters.joiningDateRange.end) {
                urlParams.append(
                    "filter[start_date][end]",
                    memberFilters.joiningDateRange.end
                );
            }

            if (memberFilters.expiryDateRange.start) {
                urlParams.append(
                    "filter[payment_expiry_date][start]",
                    memberFilters.expiryDateRange.start
                );
            }

            if (memberFilters.expiryDateRange.end) {
                urlParams.append(
                    "filter[payment_expiry_date][end]",
                    memberFilters.expiryDateRange.end
                );
            }
        }

        if (activeTab === "officials" || activeTab === "both") {
            // Add official filter flag
            urlParams.append("official_filter_enabled", "true");

            // Apply official filters
            if (officialFilters.position !== "all") {
                urlParams.append("filter[position]", officialFilters.position);
            }

            if (officialFilters.gender !== "all") {
                urlParams.append("filter[gender]", officialFilters.gender);
            }

            if (officialFilters.status !== "all") {
                urlParams.append("filter[status]", officialFilters.status);
            }

            if (officialFilters.joiningDateRange.start) {
                urlParams.append(
                    "filter[joining_date][start]",
                    officialFilters.joiningDateRange.start
                );
            }

            if (officialFilters.joiningDateRange.end) {
                urlParams.append(
                    "filter[joining_date][end]",
                    officialFilters.joiningDateRange.end
                );
            }
        }

        console.log(
            "Applying combined filters with params:",
            Object.fromEntries(urlParams.entries())
        );

        // Visit URL with all filters
        const url = `/messenging?${urlParams.toString()}`;
        router.visit(url);
        setOpen(false);
    };

    // Clear all filters
    const clearFilters = () => {
        // Reset member filters
        setMemberFilters({
            membership_package_id: "all",
            gender: "all",
            status: "all",
            joiningDateRange: { start: "", end: "" },
            expiryDateRange: { start: "", end: "" },
        });

        // Reset official filters
        setOfficialFilters({
            position: "all",
            gender: "all",
            status: "all",
            joiningDateRange: { start: "", end: "" },
        });

        // Reset segmented controls
        setSelectedMemberGender("all");
        setSelectedMemberStatus("all");
        setSelectedOfficialGender("all");
        setSelectedOfficialStatus("all");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="border">
                    <Filter size={14} /> &nbsp; Apply Filters
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Filter Recipients</DialogTitle>
                </DialogHeader>

                <Tabs
                    defaultValue="members"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-4"
                >
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="officials">Officials</TabsTrigger>
                        <TabsTrigger value="both">Apply Both</TabsTrigger>
                    </TabsList>

                    {/* Member Filters Tab */}
                    <TabsContent value="members" className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            Member Filters
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Gender</Label>
                                <SegmentedControl
                                    items={[
                                        { label: "Male", value: "male" },
                                        { label: "Female", value: "female" },
                                        { label: "All", value: "all" },
                                    ]}
                                    value={selectedMemberGender}
                                    onChange={(value) => {
                                        setSelectedMemberGender(value);
                                        setMemberFilters((prev) => ({
                                            ...prev,
                                            gender: value,
                                        }));
                                    }}
                                />
                            </div>

                            <div>
                                <Label htmlFor="membership-package">
                                    Membership Package
                                </Label>
                                <Select
                                    value={memberFilters.membership_package_id}
                                    onValueChange={(value) =>
                                        setMemberFilters((prev) => ({
                                            ...prev,
                                            membership_package_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select membership package" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        {packages.map((p) => (
                                            <SelectItem
                                                key={p.id}
                                                value={p.id.toString()}
                                            >
                                                {p.package_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-full">
                                <Label>Joining Date Range</Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="date"
                                        name="joining_start_date"
                                        value={
                                            memberFilters.joiningDateRange.start
                                        }
                                        onChange={(e) => {
                                            setMemberFilters((prev) => ({
                                                ...prev,
                                                joiningDateRange: {
                                                    ...prev.joiningDateRange,
                                                    start: e.target.value,
                                                },
                                            }));
                                        }}
                                        className="w-full"
                                    />
                                    <span>-</span>
                                    <Input
                                        type="date"
                                        name="joining_end_date"
                                        value={
                                            memberFilters.joiningDateRange.end
                                        }
                                        onChange={(e) =>
                                            setMemberFilters((prev) => ({
                                                ...prev,
                                                joiningDateRange: {
                                                    ...prev.joiningDateRange,
                                                    end: e.target.value,
                                                },
                                            }))
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <Label>Expiry Date Range</Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="date"
                                        name="expiry_start_date"
                                        value={
                                            memberFilters.expiryDateRange.start
                                        }
                                        onChange={(e) => {
                                            setMemberFilters((prev) => ({
                                                ...prev,
                                                expiryDateRange: {
                                                    ...prev.expiryDateRange,
                                                    start: e.target.value,
                                                },
                                            }));
                                        }}
                                        className="w-full"
                                    />
                                    <span>-</span>
                                    <Input
                                        type="date"
                                        name="expiry_end_date"
                                        value={
                                            memberFilters.expiryDateRange.end
                                        }
                                        onChange={(e) =>
                                            setMemberFilters((prev) => ({
                                                ...prev,
                                                expiryDateRange: {
                                                    ...prev.expiryDateRange,
                                                    end: e.target.value,
                                                },
                                            }))
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <Label>Status</Label>
                                <SegmentedControl
                                    items={[
                                        { label: "Active", value: "active" },
                                        { label: "Expired", value: "expired" },
                                        {
                                            label: "Unapproved",
                                            value: "unapproved",
                                        },
                                        { label: "All", value: "all" },
                                    ]}
                                    value={selectedMemberStatus}
                                    onChange={(value) => {
                                        setSelectedMemberStatus(value);
                                        setMemberFilters((prev) => ({
                                            ...prev,
                                            status: value,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Official Filters Tab */}
                    <TabsContent value="officials" className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            Official Filters
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Gender</Label>
                                <SegmentedControl
                                    items={[
                                        { label: "Male", value: "male" },
                                        { label: "Female", value: "female" },
                                        { label: "All", value: "all" },
                                    ]}
                                    value={selectedOfficialGender}
                                    onChange={(value) => {
                                        setSelectedOfficialGender(value);
                                        setOfficialFilters((prev) => ({
                                            ...prev,
                                            gender: value,
                                        }));
                                    }}
                                />
                            </div>

                            <div>
                                <Label htmlFor="position">Position</Label>
                                <Select
                                    value={officialFilters.position}
                                    onValueChange={(value) => {
                                        setOfficialFilters((prev) => ({
                                            ...prev,
                                            position: value,
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
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

                            <div className="col-span-full">
                                <Label>Joining Date Range</Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="date"
                                        name="official_joining_start_date"
                                        value={
                                            officialFilters.joiningDateRange
                                                .start
                                        }
                                        onChange={(e) => {
                                            setOfficialFilters((prev) => ({
                                                ...prev,
                                                joiningDateRange: {
                                                    ...prev.joiningDateRange,
                                                    start: e.target.value,
                                                },
                                            }));
                                        }}
                                        className="w-full"
                                    />
                                    <span>-</span>
                                    <Input
                                        type="date"
                                        name="official_joining_end_date"
                                        value={
                                            officialFilters.joiningDateRange.end
                                        }
                                        onChange={(e) =>
                                            setOfficialFilters((prev) => ({
                                                ...prev,
                                                joiningDateRange: {
                                                    ...prev.joiningDateRange,
                                                    end: e.target.value,
                                                },
                                            }))
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <Label>Status</Label>
                                <SegmentedControl
                                    items={[
                                        { label: "Active", value: "active" },
                                        {
                                            label: "Disabled",
                                            value: "disabled",
                                        },
                                        { label: "All", value: "all" },
                                    ]}
                                    value={selectedOfficialStatus}
                                    onChange={(value) => {
                                        setSelectedOfficialStatus(value);
                                        setOfficialFilters((prev) => ({
                                            ...prev,
                                            status: value,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Combined Filters Tab */}
                    <TabsContent value="both" className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">
                                Member Filters
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <Label>Gender</Label>
                                    <SegmentedControl
                                        items={[
                                            { label: "Male", value: "male" },
                                            {
                                                label: "Female",
                                                value: "female",
                                            },
                                            { label: "All", value: "all" },
                                        ]}
                                        value={selectedMemberGender}
                                        onChange={(value) => {
                                            setSelectedMemberGender(value);
                                            setMemberFilters((prev) => ({
                                                ...prev,
                                                gender: value,
                                            }));
                                        }}
                                    />
                                </div>

                                <div>
                                    <Label>Status</Label>
                                    <SegmentedControl
                                        items={[
                                            {
                                                label: "Active",
                                                value: "active",
                                            },
                                            { label: "All", value: "all" },
                                        ]}
                                        value={selectedMemberStatus}
                                        onChange={(value) => {
                                            setSelectedMemberStatus(value);
                                            setMemberFilters((prev) => ({
                                                ...prev,
                                                status: value,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <div>
                            <h3 className="font-semibold text-lg">
                                Official Filters
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <Label>Gender</Label>
                                    <SegmentedControl
                                        items={[
                                            { label: "Male", value: "male" },
                                            {
                                                label: "Female",
                                                value: "female",
                                            },
                                            { label: "All", value: "all" },
                                        ]}
                                        value={selectedOfficialGender}
                                        onChange={(value) => {
                                            setSelectedOfficialGender(value);
                                            setOfficialFilters((prev) => ({
                                                ...prev,
                                                gender: value,
                                            }));
                                        }}
                                    />
                                </div>

                                <div>
                                    <Label>Status</Label>
                                    <SegmentedControl
                                        items={[
                                            {
                                                label: "Active",
                                                value: "active",
                                            },
                                            { label: "All", value: "all" },
                                        ]}
                                        value={selectedOfficialStatus}
                                        onChange={(value) => {
                                            setSelectedOfficialStatus(value);
                                            setOfficialFilters((prev) => ({
                                                ...prev,
                                                status: value,
                                            }));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={clearFilters}>
                        Clear All
                    </Button>
                    <Button onClick={applyFilters}>Apply Filters</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
