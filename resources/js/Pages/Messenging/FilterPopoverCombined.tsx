import { useState, useEffect, useRef } from "react";
import { Input } from "@/Components/ui/input";
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
import SegmentedControl from "@/Components/ui/segmented-control";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { MembershipPackage } from "@/types";
import { Filter } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

interface FilterPopoverCombinedProps {
    packages: MembershipPackage[];
}

function parseFiltersFromUrl(url: string) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    const filters: any = {};
    const memberFilters: any = {};
    const officialFilters: any = {};

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
        // Store regular filter parameters
        if (key.startsWith("filter[")) {
            // Extract the inner key from the URL parameter
            const match = key.match(/filter\[(.+?)\]/);
            if (match && match[1]) {
                const filterKey = match[1];

                // Split the filterKey into parts for nested structure
                const keys = filterKey.split(/\[|\]/).filter(Boolean); // Split by [ or ] and remove empty strings

                // Check if this is a prefixed filter parameter for member or official
                if (filterKey.startsWith("member_")) {
                    // For member filters, store without the prefix
                    const memberKey = filterKey.substring(7); // Remove "member_" prefix
                    // Handle nested parameters
                    if (memberKey.includes("[")) {
                        const memberMatch = memberKey.match(/(.+?)\[(.+?)\]/);
                        if (memberMatch) {
                            const memberMainKey = memberMatch[1];
                            const memberSubKey = memberMatch[2];

                            if (!memberFilters[memberMainKey]) {
                                memberFilters[memberMainKey] = {};
                            }
                            memberFilters[memberMainKey][memberSubKey] = value;
                        }
                    } else {
                        memberFilters[memberKey] = value;
                    }
                } else if (filterKey.startsWith("official_")) {
                    // For official filters, store without the prefix
                    const officialKey = filterKey.substring(9); // Remove "official_" prefix
                    // Handle nested parameters
                    if (officialKey.includes("[")) {
                        const officialMatch =
                            officialKey.match(/(.+?)\[(.+?)\]/);
                        if (officialMatch) {
                            const officialMainKey = officialMatch[1];
                            const officialSubKey = officialMatch[2];

                            if (!officialFilters[officialMainKey]) {
                                officialFilters[officialMainKey] = {};
                            }
                            officialFilters[officialMainKey][officialSubKey] =
                                value;
                        }
                    } else {
                        officialFilters[officialKey] = value;
                    }
                } else {
                    // For regular non-prefixed filters
                    // Set the value in the nested structure as before
                    setNestedValue(filters, keys, value);
                }
            }
        }
    }

    return {
        filters,
        memberFilters,
        officialFilters,
    };
}

export default function FilterPopoverCombined({
    packages,
}: FilterPopoverCombinedProps) {
    const currentUrl = usePage().url;
    const {
        memberFilters: initialMemberFilters,
        officialFilters: initialOfficialFilters,
    } = parseFiltersFromUrl(currentUrl);
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("both");

    // Member filters - initialize from URL parameters if available
    const [memberFilters, setMemberFilters] = useState({
        membership_package_id:
            initialMemberFilters.membership_package_id || "all",
        gender: initialMemberFilters.gender || "all",
        status: initialMemberFilters.status || "all",
        joiningDateRange: {
            start: initialMemberFilters.start_date?.start || "",
            end: initialMemberFilters.start_date?.end || "",
        },
        expiryDateRange: {
            start: initialMemberFilters.payment_expiry_date?.start || "",
            end: initialMemberFilters.payment_expiry_date?.end || "",
        },
    });

    // Official filters - initialize from URL parameters if available
    const [officialFilters, setOfficialFilters] = useState({
        position: initialOfficialFilters.position || "all",
        gender: initialOfficialFilters.gender || "all",
        status: initialOfficialFilters.status || "all",
        joiningDateRange: {
            start: initialOfficialFilters.joining_date?.start || "",
            end: initialOfficialFilters.joining_date?.end || "",
        },
    });

    // SegmentedControl values
    const [memberGender, setMemberGender] = useState(memberFilters.gender);
    const [memberStatus, setMemberStatus] = useState(memberFilters.status);
    const [officialGender, setOfficialGender] = useState(
        officialFilters.gender
    );
    const [officialStatus, setOfficialStatus] = useState(
        officialFilters.status
    );

    // Update segmented control values when filters change
    useEffect(() => {
        setMemberGender(memberFilters.gender);
        setMemberStatus(memberFilters.status);
        setOfficialGender(officialFilters.gender);
        setOfficialStatus(officialFilters.status);
    }, [
        memberFilters.gender,
        memberFilters.status,
        officialFilters.gender,
        officialFilters.status,
    ]);

    const applyFilters = () => {
        const urlParams = new URLSearchParams();

        // Set recipient type to 'both'
        urlParams.append("recipient_type", "both");

        // Make sure auto_load is false when applying filters
        urlParams.append("auto_load", "false");

        // Always include both member and official filters regardless of active tab

        // Member filters
        urlParams.append("filter[member_filter]", "true");

        if (memberFilters.membership_package_id !== "all")
            urlParams.append(
                "filter[member_membership_package_id]",
                memberFilters.membership_package_id
            );

        if (memberFilters.gender !== "all")
            urlParams.append("filter[member_gender]", memberFilters.gender);

        if (memberFilters.status !== "all")
            urlParams.append("filter[member_status]", memberFilters.status);

        if (memberFilters.joiningDateRange.start)
            urlParams.append(
                "filter[member_start_date][start]",
                memberFilters.joiningDateRange.start
            );

        if (memberFilters.joiningDateRange.end)
            urlParams.append(
                "filter[member_start_date][end]",
                memberFilters.joiningDateRange.end
            );

        if (memberFilters.expiryDateRange.start)
            urlParams.append(
                "filter[member_payment_expiry_date][start]",
                memberFilters.expiryDateRange.start
            );

        if (memberFilters.expiryDateRange.end)
            urlParams.append(
                "filter[member_payment_expiry_date][end]",
                memberFilters.expiryDateRange.end
            );

        // Official filters - always include
        urlParams.append("official_filter_enabled", "true");

        if (officialFilters.position !== "all")
            urlParams.append(
                "filter[official_position]",
                officialFilters.position
            );

        if (officialFilters.gender !== "all")
            urlParams.append("filter[official_gender]", officialFilters.gender);

        if (officialFilters.status !== "all")
            urlParams.append("filter[official_status]", officialFilters.status);

        if (officialFilters.joiningDateRange.start)
            urlParams.append(
                "filter[official_joining_date][start]",
                officialFilters.joiningDateRange.start
            );

        if (officialFilters.joiningDateRange.end)
            urlParams.append(
                "filter[official_joining_date][end]",
                officialFilters.joiningDateRange.end
            );

        console.log(
            "Applying combined filters:",
            Object.fromEntries(urlParams.entries())
        );

        // Close the dialog
        setOpen(false);

        // Visit the URL with all filters
        const url = `/messenging?${urlParams.toString()}`;
        router.visit(url);
    };

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
        setMemberGender("all");
        setMemberStatus("all");
        setOfficialGender("all");
        setOfficialStatus("all");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="border">
                    <Filter size={14} /> &nbsp; Filter Recipients
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">
                        Filter Members and Officials
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="members">
                            Member Filters
                        </TabsTrigger>
                        <TabsTrigger value="officials">
                            Official Filters
                        </TabsTrigger>
                        <TabsTrigger value="both">Apply Both</TabsTrigger>
                    </TabsList>

                    {/* Member Filters Tab */}
                    <TabsContent value="members" className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Gender</Label>
                                <SegmentedControl
                                    items={[
                                        { label: "Male", value: "male" },
                                        { label: "Female", value: "female" },
                                        { label: "All", value: "all" },
                                    ]}
                                    value={memberGender}
                                    onChange={(value) => {
                                        setMemberGender(value);
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
                                    value={memberStatus}
                                    onChange={(value) => {
                                        setMemberStatus(value);
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Gender</Label>
                                <SegmentedControl
                                    items={[
                                        { label: "Male", value: "male" },
                                        { label: "Female", value: "female" },
                                        { label: "All", value: "all" },
                                    ]}
                                    value={officialGender}
                                    onChange={(value) => {
                                        setOfficialGender(value);
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
                                    value={officialStatus}
                                    onChange={(value) => {
                                        setOfficialStatus(value);
                                        setOfficialFilters((prev) => ({
                                            ...prev,
                                            status: value,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* Both Filters Tab */}
                    <TabsContent value="both" className="space-y-4">
                        <div className="border p-4 rounded-md mb-4">
                            <h3 className="font-medium mb-2">Member Filters</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <strong>Gender:</strong>{" "}
                                    {memberGender === "all"
                                        ? "All"
                                        : memberGender}
                                </div>
                                <div>
                                    <strong>Status:</strong>{" "}
                                    {memberStatus === "all"
                                        ? "All"
                                        : memberStatus}
                                </div>
                                <div>
                                    <strong>Package:</strong>{" "}
                                    {memberFilters.membership_package_id ===
                                    "all"
                                        ? "All"
                                        : packages.find(
                                              (p) =>
                                                  p.id.toString() ===
                                                  memberFilters.membership_package_id
                                          )?.package_name || "Unknown"}
                                </div>
                                <div>
                                    <strong>Date Ranges:</strong>{" "}
                                    {memberFilters.joiningDateRange.start ||
                                    memberFilters.joiningDateRange.end ||
                                    memberFilters.expiryDateRange.start ||
                                    memberFilters.expiryDateRange.end
                                        ? "Customized"
                                        : "None"}
                                </div>
                            </div>
                        </div>

                        <div className="border p-4 rounded-md">
                            <h3 className="font-medium mb-2">
                                Official Filters
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <strong>Gender:</strong>{" "}
                                    {officialGender === "all"
                                        ? "All"
                                        : officialGender}
                                </div>
                                <div>
                                    <strong>Status:</strong>{" "}
                                    {officialStatus === "all"
                                        ? "All"
                                        : officialStatus}
                                </div>
                                <div>
                                    <strong>Position:</strong>{" "}
                                    {officialFilters.position === "all"
                                        ? "All"
                                        : officialFilters.position}
                                </div>
                                <div>
                                    <strong>Joining Date:</strong>{" "}
                                    {officialFilters.joiningDateRange.start ||
                                    officialFilters.joiningDateRange.end
                                        ? "Customized"
                                        : "None"}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-100 rounded-md mt-4">
                            <p className="text-sm text-gray-600">
                                Applying both filters will search for contacts
                                matching either member OR official criteria.
                                This will combine the results from both filter
                                sets.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={clearFilters}>
                        Clear All
                    </Button>
                    <Button onClick={applyFilters}>Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
