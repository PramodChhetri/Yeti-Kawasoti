import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import SingleImageUploader from '@/Components/ui/SingleImageUploader';
import { toast } from '@/Components/ui/use-toast';
import { MembershipPackage } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const MembershipCreationDialog = () => {
    const packages = usePage().props.packages as MembershipPackage[];
    const { data, setData, errors, post, processing, clearErrors } = useForm({
        name: '',
        phone: '',
        occupation: '',
        gender: '' as 'male' | 'female',
        marital_status: '' as 'married' | 'single',
        date_of_birth: new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString().split('T')[0],
        address: '',
        preferred_time: '',
        payment_proof: '',
        membership_package_id: packages[0].id,
        months: 1,
        photo: null as null | File,
        emergency_person_name: '',
        emergency_person_phone: '',
    });

    const [admissionAmount, setAdmissionAmount] = useState(0);
    const [monthlyAmount, setMonthlyAmount] = useState(0);
    const [totalMonthlyFees, setTotalMonthlyFees] = useState(0);
    const [grossPackageAmount, setGrossPackageAmount] = useState(0);
    const [packageDiscount, setPackageDiscount] = useState(0);
    const [netPackageAmount, setNetPackageAmount] = useState(0);

    const url = new URLSearchParams(window.location.search);
    const [openDialog, setOpenDialog] = useState(url.get('form') === 'register');

    // Function to calculate pricing details
    const calculatePricingDetails = () => {
        const selectedPackage = packages.find(p => p.id === data.membership_package_id);
        if (selectedPackage) {
            const admission = Number(selectedPackage.admission_amount) || 0;
            const monthly = Number(selectedPackage.monthly_amount) || 0;
            const totalMonthlyFees = monthly * data.months;
            const grossAmount = admission + totalMonthlyFees;
            let discount = 0;
            if (data.months === 3) {
                discount = Number(selectedPackage.discount_quarterly) || 0;
            } else if (data.months === 6) {
                discount = Number(selectedPackage.discount_half_yearly) || 0;
            } else if (data.months === 12) {
                discount = Number(selectedPackage.discount_yearly) || 0;
            }

            setAdmissionAmount(admission);
            setMonthlyAmount(monthly);
            setTotalMonthlyFees(totalMonthlyFees);
            setGrossPackageAmount(grossAmount);
            setPackageDiscount(discount);
            setNetPackageAmount(grossAmount - discount);
        }
    };

    useEffect(() => {
        calculatePricingDetails();
    }, [data.membership_package_id, data.months]);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        clearErrors();
        post("/member/store/apply", {
            onSuccess: () => {
                setOpenDialog(false);
                toast({ description: "Membership registration application submitted, pending admin approval...", duration: 5000 });
            }
        });
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger>
                <Button className="hidden md:block w-full" color="primary" type="submit" disabled={processing}>
                    Register Membership
                </Button>
                <Button className="w-full md:hidden" size={'sm'} color="primary" type="submit" disabled={processing}>
                    Register Membership
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-7xl w-[97%] max-h-[97vh] overflow-auto rounded'>
                <DialogHeader>
                    <DialogTitle>Register a Membership</DialogTitle>
                </DialogHeader>
                <div className="w-full mx-auto space-y-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-6 xl:col-span-7 2xl:col-span-8 space-y-6">
                                {/* Member Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Member Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex gap-2 flex-wrap">
                                            <div className='w-32'>
                                                <SingleImageUploader
                                                    onImageUpload={file => setData('photo', file)}
                                                    className="aspect-square px-2 w-full"
                                                    label="Upload Member Photo"
                                                />
                                                <InputError message={errors.photo} className="mt-2" />
                                            </div>
                                            <div className="grow">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => {
                                                        const formattedValue = e.target.value
                                                            .toLowerCase()
                                                            .replace(/\b\w/g, (char) => char.toUpperCase());
                                                        setData('name', formattedValue);
                                                    }}
                                                    placeholder="Enter member's name"
                                                    required
                                                />
                                                <InputError message={errors.name} className="mt-2" />

                                                <Label htmlFor="address">Address</Label>
                                                <Input
                                                    id="address"
                                                    value={data.address}
                                                    onChange={e => setData('address', e.target.value)}
                                                    placeholder="Enter address"
                                                    required
                                                />
                                                <InputError message={errors.address} className="mt-2" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            <div>
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    placeholder="Enter phone number"
                                                    required
                                                    maxLength={10}
                                                    minLength={10}
                                                />
                                                <InputError message={errors.phone} className="mt-2" />
                                            </div>

                                            <div>
                                                <Label htmlFor="occupation">Occupation</Label>
                                                <Select
                                                    defaultValue={data.occupation}
                                                    onValueChange={val => setData('occupation', val)}
                                                >
                                                    <SelectTrigger id="occupation">
                                                        <SelectValue placeholder="Select occupation" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="private-job">Private Job</SelectItem>
                                                        <SelectItem value="government-job">Government Job</SelectItem>
                                                        <SelectItem value="business">Business</SelectItem>
                                                        <SelectItem value="student">Student</SelectItem>
                                                        <SelectItem value="housewife">House Wife</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.occupation} className="mt-2" />
                                            </div>

                                            <div>
                                                <Label>Gender</Label>
                                                <Select
                                                    defaultValue={data.gender}
                                                    onValueChange={(val: 'male' | 'female') => setData('gender', val)}
                                                >
                                                    <SelectTrigger id="gender">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.gender} className="mt-2" />
                                            </div>

                                            <div>
                                                <Label>Marital Status</Label>
                                                <Select
                                                    defaultValue={data.marital_status}
                                                    onValueChange={val => setData('marital_status', val as any)}
                                                >
                                                    <SelectTrigger id="marital_status">
                                                        <SelectValue placeholder="Select marital status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="single">Single</SelectItem>
                                                        <SelectItem value="married">Married</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.marital_status} className="mt-2" />
                                            </div>

                                            <div>
                                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                                <Input
                                                    id="date_of_birth"
                                                    type="date"
                                                    value={data.date_of_birth}
                                                    onChange={e => setData('date_of_birth', e.target.value)}
                                                    required
                                                />
                                                <InputError message={errors.date_of_birth} className="mt-2" />
                                            </div>

                                           <div>
                                                <Label htmlFor="preferred_time">Preferred Shift</Label>
                                                <Select onValueChange={val => setData('preferred_time', val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select preferred shift" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Morning">Morning</SelectItem>
                                                        <SelectItem value="Day">Day</SelectItem>
                                                        <SelectItem value="Evening">Evening</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.preferred_time} className="mt-2" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Membership and Payment Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Membership and Payment Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <Label htmlFor="membership_package">Membership Package</Label>
                                            <Select
                                                defaultValue={data.membership_package_id.toString()}
                                                onValueChange={val => setData('membership_package_id', Number(val))}
                                            >
                                                <SelectTrigger id="membership_package">
                                                    <SelectValue placeholder="Select membership package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packages.map((p) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            {p.package_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.membership_package_id} className="mt-2" />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className='grow'>
                                                <Label htmlFor="months">Initial Registration Months</Label>
                                                <Select
                                                    defaultValue={data.months.toString()}
                                                    onValueChange={val => setData('months', Number(val))}
                                                >
                                                    <SelectTrigger id="months">
                                                        <SelectValue placeholder="Select membership months" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Month</SelectItem>
                                                        <SelectItem value="3">3 Months</SelectItem>
                                                        <SelectItem value="6">6 Months</SelectItem>
                                                        <SelectItem value="12">1 Year</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.months} className="mt-2" />
                                            </div>
                                            <div>
                                                <Label htmlFor="payment_proof">Payment Proof</Label>
                                                <Input type='file' accept='image/*' onChange={(e) => {
                                                    setData('payment_proof', e.target.files ? e.target.files[0] : '' as unknown as any);
                                                }} />
                                                <InputError message={errors.payment_proof} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-6 xl:col-span-5 2xl:col-span-4 space-y-6">
                                {/* Emergency Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Emergency Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="gap-2 flex flex-col flex-wrap">
                                        <div className='grow'>
                                            <Label htmlFor="emergency_person_name">Person Name</Label>
                                            <Input
                                                id="emergency_person_name"
                                                value={data.emergency_person_name}
                                                onChange={(e) => {
                                                    const formattedValue = e.target.value
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, (char) => char.toUpperCase());
                                                    setData('emergency_person_name', formattedValue);
                                                }}
                                                placeholder="Enter emergency contact person name"
                                                required
                                            />
                                            <InputError message={errors.emergency_person_name} className="mt-2" />
                                        </div>
                                        <div className='grow'>
                                            <Label htmlFor="emergency_person_phone">Phone</Label>
                                            <Input
                                                id="emergency_person_phone"
                                                value={data.emergency_person_phone}
                                                onChange={e => setData('emergency_person_phone', e.target.value)}
                                                placeholder="Enter emergency contact phone number"
                                                required
                                            />
                                            <InputError message={errors.emergency_person_phone} className="mt-2" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Pricing and Payment Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Pricing and Payment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-start mb-3">
                                            <strong>{packages.find(p => p.id === data.membership_package_id)?.package_name}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <Label>Admission Amount</Label>
                                            <span>Rs {admissionAmount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <Label>Monthly Amount</Label>
                                            <span>Rs {monthlyAmount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <Label>Total Months</Label>
                                            <span>{data.months} Months</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <Label>Total Monthly Fees</Label>
                                            <span>Rs {totalMonthlyFees}</span>
                                        </div>
                                        <div className="border mb-2"></div>
                                        <div className="flex justify-between">
                                            <Label>Gross Package Amount</Label>
                                            <span>Rs {grossPackageAmount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <Label>Package Discount</Label>
                                            <span>- Rs {packageDiscount}</span>
                                        </div>
                                        <div className="border mb-2"></div>
                                        <strong className="flex justify-between">
                                            <Label>Net Amount</Label>
                                            <span>Rs {netPackageAmount}</span>
                                        </strong>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full mt-3"
                                        >
                                            {processing ? 'Processing...' : 'Apply for registration'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MembershipCreationDialog;
