import { usePage, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { toast } from '@/Components/ui/use-toast';
import { AccessControl } from '@/types/access-controls';
import { Checkbox } from '@/Components/ui/checkbox';

const AddPackageDialog = () => {
    const accessControls = usePage().props.accessControls as AccessControl[];
    const [selectedAccessControls, setSelectedAccessControls] = useState<number[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    // Using useForm from Inertia.js for form handling
    const { data, setData, post, processing, reset, errors } = useForm({
        package_name: '',
        admission_amount: '',
        months: '',
        monthly_amount: '',
        discount_quarterly: '',
        discount_half_yearly: '',
        discount_yearly: '',
    });


    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.package_name.trim()) errors.package_name = 'Package name is required.';
        if (!data.admission_amount || isNaN(Number(data.admission_amount)) || Number(data.admission_amount) < 0)
            errors.admission_amount = 'Admission amount must be a valid non-negative number.';
        if (!data.months || isNaN(Number(data.months)) || data.months == null || Number(data.months) < 0)
            errors.months = 'Months must be a valid number.';
        if (data.monthly_amount && (isNaN(Number(data.monthly_amount)) || Number(data.monthly_amount) < 0))
            errors.monthly_amount = 'Monthly amount must be a valid non-negative number.';
        if (data.discount_quarterly && (isNaN(Number(data.discount_quarterly)) || Number(data.discount_quarterly) < 0))
            errors.discount_quarterly = 'Quarterly discount must be a valid non-negative number.';
        if (data.discount_half_yearly && (isNaN(Number(data.discount_half_yearly)) || Number(data.discount_half_yearly) < 0))
            errors.discount_half_yearly = 'Half-yearly discount must be a valid non-negative number.';
        if (data.discount_yearly && (isNaN(Number(data.discount_yearly)) || Number(data.discount_yearly) < 0))
            errors.discount_yearly = 'Yearly discount must be a valid non-negative number.';


        router.post(route('settings.storePackage'), {
            ...data,
            access_control_ids: selectedAccessControls,
        }, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Package added successfully' });
                reset();
                setIsOpen(false);
            },
            onError: () => {
                // toast({ title: 'Error', description: 'Failed to add package', variant: 'destructive' });
            },
        });
    };

    // Handle checkbox selection
    const handleSelectAccessControl = (id: number) => {
        const updatedControls = selectedAccessControls.includes(id)
            ? selectedAccessControls.filter((item) => item !== id)
            : [...selectedAccessControls, id];

        setSelectedAccessControls(updatedControls);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Add Package</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Package</DialogTitle>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                    {/* Full Width Package Name */}
                    <div className="col-span-2">
                        <Label htmlFor="package_name">Package Name</Label>
                        <Input
                            id="package_name"
                            value={data.package_name}
                            onChange={(e) => setData('package_name', e.target.value)}
                            placeholder="Enter package name"
                            disabled={processing}
                            className="w-full"
                        />
                        {errors.package_name && <p className="text-red-500 text-sm">{errors.package_name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="months">Total Months</Label>
                        <Input
                            id="months"
                            value={data.months}
                            onChange={(e) => setData('months', e.target.value)}
                            type="number"
                            disabled={processing}
                        />
                        {errors.months && <p className="text-red-500 text-sm">{errors.months}</p>}
                    </div>

                    <div>
                        <Label htmlFor="admission_amount">Admission Amount</Label>
                        <Input
                            id="admission_amount"
                            value={data.admission_amount}
                            onChange={(e) => setData('admission_amount', e.target.value)}
                            type="number"
                            disabled={processing}
                        />
                        {errors.admission_amount && <p className="text-red-500 text-sm">{errors.admission_amount}</p>}
                    </div>

                    <div>
                        <Label htmlFor="monthly_amount">Monthly Amount</Label>
                        <Input
                            id="monthly_amount"
                            value={data.monthly_amount}
                            onChange={(e) => setData('monthly_amount', e.target.value)}
                            type="number"
                            disabled={processing}
                        />
                        {errors.monthly_amount && <p className="text-red-500 text-sm">{errors.monthly_amount}</p>}
                    </div>
                    <div>
                        <Label htmlFor="discount_quarterly">Quarterly Discount</Label>
                        <Input
                            id="discount_quarterly"
                            value={data.discount_quarterly}
                            onChange={(e) => setData('discount_quarterly', e.target.value)}
                            type="number"
                            disabled={processing}
                        />
                        {errors.discount_quarterly && <p className="text-red-500 text-sm">{errors.discount_quarterly}</p>}
                    </div>

                    <div>
                        <Label htmlFor="discount_half_yearly">Half-Yearly Discount</Label>
                        <Input
                            id="discount_half_yearly"
                            value={data.discount_half_yearly}
                            onChange={(e) => setData('discount_half_yearly', e.target.value)}
                            type="number"
                            disabled={processing}
                        />
                        {errors.discount_half_yearly && <p className="text-red-500 text-sm">{errors.discount_half_yearly}</p>}
                    </div>

                    <div>
                        <Label htmlFor="discount_yearly">Yearly Discount</Label>
                        <Input
                            id="discount_yearly"
                            value={data.discount_yearly}
                            onChange={(e) => setData('discount_yearly', e.target.value)}
                            type="number"
                            disabled={processing}
                        />
                        {errors.discount_yearly && <p className="text-red-500 text-sm">{errors.discount_yearly}</p>}
                    </div>

                    {/* Access Controls Selector */}
                    <div className="col-span-2">
                        <Label>Access Controls</Label>
                        <div className="border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4">
                            {accessControls.map((control) => (
                                <div key={control.id}>
                                    <Label className="flex items-center space-x-2 cursor-pointer">
                                        <Checkbox
                                            checked={selectedAccessControls.includes(control.id)}
                                            onCheckedChange={() => handleSelectAccessControl(control.id)}
                                        />
                                        <span>{control.name}</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-2">
                        <Button type="submit" disabled={processing} className="w-full mt-4">
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    );
};

export default AddPackageDialog;
