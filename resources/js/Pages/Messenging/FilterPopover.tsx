import { useState, useEffect, useRef } from 'react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Label } from '@/Components/ui/label';
import SegmentedControl from '@/Components/ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { MembershipPackage } from '@/types';
import { Filter } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';

interface FilterPopoverProps {
    packages: MembershipPackage[];
    initialFilters?: {
        membership_package_id?: string;
        gender?: string;
        status?: string;
        joiningDateRange?: { start?: string; end?: string };
        expiryDateRange?: { start?: string; end?: string };
    };
}



function parseFiltersFromUrl(url: string) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
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
        if (key.startsWith('filter[')) {
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


export default function FilterPopover({ packages }: FilterPopoverProps) {
    const currentUrl = usePage().url;
    const initialFilters = parseFiltersFromUrl(currentUrl);
    const [filters, setFilters] = useState({
        membership_package_id: initialFilters.membership_package_id || 'all',
        gender: initialFilters.gender || 'all',
        status: initialFilters.status || 'all',
        joiningDateRange: {
            start: initialFilters.joiningDateRange?.start || '',
            end: initialFilters.joiningDateRange?.end || '',
        },
        expiryDateRange: {
            start: initialFilters.expiryDateRange?.start || '',
            end: initialFilters.expiryDateRange?.end || '',
        },
    });

    const [selectedGender, setSelectedGender] = useState(filters.gender);
    const [selectedStatus, setSelectedStatus] = useState(filters.status);

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setSelectedGender(filters.gender);
        setSelectedStatus(filters.status);
    }, [filters.gender, filters.status]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const applyFilters = () => {
        const urlParams = new URLSearchParams();
        if (filters.membership_package_id !== 'all') urlParams.append('filter[membership_package_id]', filters.membership_package_id);
        if (filters.gender !== 'all') urlParams.append('filter[gender]', filters.gender);
        if (filters.status !== 'all') urlParams.append('filter[status]', filters.status);

        if (filters.joiningDateRange.start) urlParams.append('filter[start_date][start]', filters.joiningDateRange.start);
        if (filters.joiningDateRange.end) urlParams.append('filter[start_date][end]', filters.joiningDateRange.end);

        if (filters.expiryDateRange.start) urlParams.append('filter[payment_expiry_date][start]', filters.expiryDateRange.start);
        if (filters.expiryDateRange.end) urlParams.append('filter[payment_expiry_date][end]', filters.expiryDateRange.end);

        const url = `/messenging?${urlParams.toString()}`;
        router.visit(url);
    };

    const clearFilters = () => {
        setFilters({
            membership_package_id: 'all',
            gender: 'all',
            status: 'all',
            joiningDateRange: { start: '', end: '' },
            expiryDateRange: { start: '', end: '' },
        });
        setSelectedGender('all');
        setSelectedStatus('all');
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="secondary" className='border'>
                    <Filter size={14} /> &nbsp; Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 space-y-4 w-fit max-w-full overflow-auto">
                <h3 className='font-bold text-lg'>Filter Members</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Label>Gender</Label>
                        <SegmentedControl
                            items={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'All', value: 'all' }]}
                            value={selectedGender}
                            onChange={(value) => {
                                setSelectedGender(value);
                                setFilters((prev) => ({ ...prev, gender: value }));
                            }}
                        />
                    </div>
                    <div>
                        <Label htmlFor="membership-package">Membership Package</Label>
                        <Select
                            value={filters.membership_package_id}
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, membership_package_id: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select membership package" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {packages.map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.package_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='col-span-full'>
                        <Label>Joining Date Range</Label>
                        <div className='flex gap-2 items-center'>
                            <Input
                                type="date"
                                name="joining_start_date"
                                value={filters.joiningDateRange.start}
                                onChange={(e) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        joiningDateRange: { ...prev.joiningDateRange, start: e.target.value },
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
                                        joiningDateRange: { ...prev.joiningDateRange, end: e.target.value },
                                    }))
                                }
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className='col-span-full'>
                        <Label>Payment Expiry Date Range</Label>
                        <div className='flex gap-2 items-center'>
                            <Input
                                type="date"
                                name="expiry_start_date"
                                value={filters.expiryDateRange.start}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        expiryDateRange: { ...prev.expiryDateRange, start: e.target.value },
                                    }))
                                }
                                className="w-full"
                            />
                            <span>-</span>
                            <Input
                                type="date"
                                name="expiry_end_date"
                                value={filters.expiryDateRange.end}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        expiryDateRange: { ...prev.expiryDateRange, end: e.target.value },
                                    }))
                                }
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className='col-span-full'>
                        <Label>Status</Label>
                        <SegmentedControl
                            items={[{ label: 'Active', value: 'active' }, { label: 'Expired', value: 'expired' }, { label: 'Unapproved', value: 'unapproved' }, { label: 'All', value: 'all' }]}
                            value={selectedStatus}
                            onChange={(value) => {
                                setSelectedStatus(value);
                                setFilters((prev) => ({ ...prev, status: value }));
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={clearFilters}>Clear</Button>
                    <Button onClick={applyFilters} ref={buttonRef}>Apply</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
