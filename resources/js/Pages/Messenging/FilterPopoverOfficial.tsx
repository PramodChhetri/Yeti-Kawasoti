import { useState, useEffect, useRef } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Label } from "@/Components/ui/label";
import SegmentedControl from "@/Components/ui/segmented-control";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Filter } from "lucide-react";
import { router, usePage } from "@inertiajs/react";

interface FilterPopoverOfficialProps {
    recipientType?: string;
    initialFilters?: {
        gender?: string;
        status?: string;
        joiningDateRange?: { start?: string; end?: string };
        position?: string;
    };
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
                const keys = filterKey.split(/\[|\]/).filter(Boolean); // Split by [ or ] and remove empty strings

                // Set the value in the nested structure
                setNestedValue(filters, keys, value);
            }
        }
    }

    return filters;
}

export default function FilterPopoverOfficial({
    recipientType = "officials",
}: FilterPopoverOfficialProps) {
    const currentUrl = usePage().url;
    const initialFilters = parseFiltersFromUrl(currentUrl);
    const [filters, setFilters] = useState({
        position: initialFilters.position || "all",
        gender: initialFilters.gender || "all",
        status: initialFilters.status || "all",
        joiningDateRange: {
            start: initialFilters.joiningDateRange?.start || "",
            end: initialFilters.joiningDateRange?.end || "",
        },
    });

    const [selectedGender, setSelectedGender] = useState(filters.gender);
    const [selectedStatus, setSelectedStatus] = useState(filters.status);
    const [selectedPosition, setSelectedPosition] = useState(filters.position);

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setSelectedGender(filters.gender);
        setSelectedStatus(filters.status);
    }, [filters.gender, filters.status]);

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        const urlParams = new URLSearchParams();

        // Add recipient type as a query parameter, not a filter
        if (recipientType) {
            urlParams.append("recipient_type", recipientType);
        }

        // Make sure auto_load is false when applying filters
        urlParams.append("auto_load", "false");

        // Add official filters
        if (filters.position !== "all") {
            urlParams.append("filter[position]", filters.position);
        }

        if (filters.gender !== "all") {
            urlParams.append("filter[gender]", filters.gender);
        }

        if (filters.status !== "all") {
            urlParams.append("filter[status]", filters.status);
        }

        if (filters.joiningDateRange.start) {
            urlParams.append(
                "filter[joining_date][start]",
                filters.joiningDateRange.start
            );
        }

        if (filters.joiningDateRange.end) {
            urlParams.append(
                "filter[joining_date][end]",
                filters.joiningDateRange.end
            );
        }

        // Keep existing query parameters for 'both' mode
        if (recipientType === "both") {
            // When in 'both' mode, preserve any existing filter parameters from member filters
            const currentParams = new URLSearchParams(window.location.search);

            // Add member filters that don't conflict with official filters
            for (const [key, value] of currentParams.entries()) {
                if (
                    key.startsWith("filter[") &&
                    !key.startsWith("filter[gender]") &&
                    !key.startsWith("filter[status]") &&
                    !key.startsWith("filter[position]") &&
                    !key.startsWith("filter[joining_date]")
                ) {
                    urlParams.append(key, value);
                }
            }
        }

        console.log(
            "Applying official filters with params:",
            Object.fromEntries(urlParams.entries())
        );

        const url = `/messenging?${urlParams.toString()}`;
        router.visit(url);
    };

    const clearFilters = () => {
        setFilters({
            position: "all",
            gender: "all",
            status: "all",
            joiningDateRange: { start: "", end: "" },
        });
        setSelectedGender("all");
        setSelectedStatus("all");
        setSelectedPosition("all");
    };

    const getButtonLabel = () => {
        return recipientType === "both" ? "Filter Officials" : "Filter";
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="secondary" className="border ml-2">
                    <Filter size={14} /> &nbsp; {getButtonLabel()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 space-y-4 w-fit max-w-full overflow-auto">
                <h3 className="font-bold text-lg">Filter Officials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Gender</Label>
                        <SegmentedControl
                            items={[
                                { label: "Male", value: "male" },
                                { label: "Female", value: "female" },
                                { label: "All", value: "all" },
                            ]}
                            value={selectedGender}
                            onChange={(value) => {
                                setSelectedGender(value);
                                setFilters((prev) => ({
                                    ...prev,
                                    gender: value,
                                }));
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="position">Position</Label>
                        <Select
                            value={filters.position}
                            onValueChange={(value) => {
                                setSelectedPosition(value);
                                setFilters((prev) => ({
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
                                <SelectItem value="Owner">Owner</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="Trainer">Trainer</SelectItem>
                                <SelectItem value="Reception">
                                    Reception
                                </SelectItem>
                                <SelectItem value="Guard">Guard</SelectItem>
                                <SelectItem value="House-Keeping">
                                    House Keeping
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-full">
                        <Label>Joining Date Range</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="date"
                                name="joining_start_date"
                                value={filters.joiningDateRange.start}
                                onChange={(e) => {
                                    setFilters((prev) => ({
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
                                value={filters.joiningDateRange.end}
                                onChange={(e) =>
                                    setFilters((prev) => ({
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
                                { label: "Disabled", value: "disabled" },
                                { label: "All", value: "all" },
                            ]}
                            value={selectedStatus}
                            onChange={(value) => {
                                setSelectedStatus(value);
                                setFilters((prev) => ({
                                    ...prev,
                                    status: value,
                                }));
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={clearFilters}>
                        Clear
                    </Button>
                    <Button onClick={applyFilters} ref={buttonRef}>
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
