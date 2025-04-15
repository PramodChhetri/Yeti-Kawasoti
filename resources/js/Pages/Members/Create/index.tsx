import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import SingleImageUploader from "@/Components/ui/SingleImageUploader";
import { toast } from "@/Components/ui/use-toast";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Locker, MembershipPackage, PageProps } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import axios from "axios";
import React, { FormEvent, useEffect, useState } from "react";

const MembershipCreationForm = ({
    auth,
    packages,
    lockers,
}: PageProps<{
    packages: MembershipPackage[];
    lockers: Locker[];
}>) => {
    const { data, setData, errors, post, processing, setError, clearErrors } =
        useForm({
            name: "",
            phone: "",
            occupation: "",
            gender: "" as "male" | "female",
            marital_status: "" as "married" | "single",
            date_of_birth: new Date(
                new Date().setFullYear(new Date().getFullYear() - 20)
            )
                .toISOString()
                .split("T")[0],
            start_date: new Date(
                new Date().setFullYear(new Date().getFullYear())
            )
                .toISOString()
                .split("T")[0],
            address: "",
            preferred_time: "",
            membership_package: packages[0].id,
            months: 1,
            payment_mode: "",
            bill_number: 0,
            extra_discount: 0,
            photo: null as null | File,
            emergency_person_name: "",
            emergency_person_phone: "",
            locker_access: false,
            locker_id: lockers[0]?.id,
            locker_discount: 0,
            locker_number: "",
            paid: 0,

            //for temporary membership
            net_amount: 0,
            days_count: 1,
        });

    const [admissionAmount, setAdmissionAmount] = useState(0);
    const [monthlyAmount, setMonthlyAmount] = useState(0);
    const [totalMonthlyFees, setTotalMonthlyFees] = useState(0);
    const [grossPackageAmount, setGrossPackageAmount] = useState(0);
    const [packageDiscount, setPackageDiscount] = useState(0);
    const [netPackageAmount, setNetPackageAmount] = useState(0);
    const [lockerCharge, setLockerCharge] = useState(0);

    useEffect(() => {
        const selectedPackage = packages.find(
            (p) => p.id === data.membership_package
        );
        if (selectedPackage) {
            const admission = Number(selectedPackage.admission_amount) || 0;
            const monthly = Number(selectedPackage.monthly_amount) || 0;
            const calculatedTotalMonthlyFees = monthly * data.months;
            const calculatedGrossAmount =
                admission + calculatedTotalMonthlyFees;

            let calculatedDiscount = 0;
            if (data.months === 3) {
                calculatedDiscount =
                    Number(selectedPackage.discount_quarterly) || 0;
            } else if (data.months === 6) {
                calculatedDiscount =
                    Number(selectedPackage.discount_half_yearly) || 0;
            } else if (data.months === 12) {
                calculatedDiscount =
                    Number(selectedPackage.discount_yearly) || 0;
            }

            const tempNetPackageAmount =
                calculatedGrossAmount - calculatedDiscount;
            const validated_extra_discount = Math.min(
                data.extra_discount,
                tempNetPackageAmount
            );

            setAdmissionAmount(admission);
            setMonthlyAmount(monthly);
            setTotalMonthlyFees(calculatedTotalMonthlyFees);
            setGrossPackageAmount(calculatedGrossAmount);
            setPackageDiscount(calculatedDiscount);
            setNetPackageAmount(
                tempNetPackageAmount - validated_extra_discount
            );

            setData("extra_discount", validated_extra_discount);
        }

        if (data.locker_access) {
            const selectedLocker = lockers.find(
                (locker) => locker.id === data.locker_id
            );
            const lockerPrice = selectedLocker ? selectedLocker.price : 0;
            const validatedLockerDiscount = Math.min(
                data.locker_discount,
                lockerPrice
            );

            setLockerCharge(lockerPrice - validatedLockerDiscount);
            setData("locker_discount", validatedLockerDiscount);
        } else {
            setLockerCharge(0);
            setData("locker_discount", 0);
            setData("locker_id", lockers[0]?.id || 1);
        }
    }, [
        data.membership_package,
        data.months,
        data.extra_discount,
        data.locker_access,
        data.locker_id,
        data.locker_discount,
        packages,
        lockers,
    ]);

    const calculateNetAmount = () =>
        Number(data.months) === 0
            ? data.net_amount
            : netPackageAmount + lockerCharge;

    const calculateBalanceLabel = () => {
        const netAmount = calculateNetAmount();
        const paidAmount = data.paid || 0;
        if (paidAmount > netAmount) {
            return "Advance Amount";
        }
        return "Credit Amount";
    };

    const calculateBalanceAmount = () => {
        const netAmount = calculateNetAmount();
        const paidAmount = data.paid || 0;
        if (paidAmount > netAmount) {
            return paidAmount - netAmount;
        }
        return netAmount - paidAmount;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        post("/member/store", {
            onSuccess: () => {
                toast({ description: "Member Created Successfully..." });

                setData({
                    name: "",
                    phone: "",
                    occupation: "",
                    gender: "" as "male" | "female",
                    marital_status: "" as "married" | "single",
                    date_of_birth: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 20)
                    )
                        .toISOString()
                        .split("T")[0],
                    start_date: new Date(
                        new Date().setFullYear(new Date().getFullYear() - 20)
                    )
                        .toISOString()
                        .split("T")[0],
                    address: "",
                    preferred_time: "",
                    membership_package: packages[0].id,
                    months: 1,
                    payment_mode: "",
                    bill_number: 0,
                    extra_discount: 0,
                    photo: null as null | File,
                    emergency_person_name: "",
                    emergency_person_phone: "",
                    locker_access: false,
                    locker_id: lockers[0]?.id,
                    locker_discount: 0,
                    locker_number: "",
                    paid: 0,

                    //for temporary membership
                    net_amount: 0,
                    days_count: 1,
                });
            },
        });
    };

    return (
        <Authenticated user={auth.user}>
            <Head title="Create Member" />
            <div className="w-full mx-auto space-y-8">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold">Create a Membership</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-6 xl:col-span-7 2xl:col-span-8 space-y-8">
                            {/* Member Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Member Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="w-32">
                                            <SingleImageUploader
                                                onImageUpload={(file) =>
                                                    setData("photo", file)
                                                }
                                                className="aspect-square px-2 w-full"
                                                label="Upload Member Photo"
                                            />
                                            <InputError
                                                message={errors.photo}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="flex-col grow">
                                            <div className="grow">
                                                <Label htmlFor="name">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => {
                                                        const formattedValue =
                                                            e.target.value
                                                                .toLowerCase()
                                                                .replace(
                                                                    /\b\w/g,
                                                                    (char) =>
                                                                        char.toUpperCase()
                                                                );
                                                        setData(
                                                            "name",
                                                            formattedValue
                                                        );
                                                    }}
                                                    placeholder="Enter member's name"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.name}
                                                    className="mt-2"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                                                <div>
                                                    <Label htmlFor="address">
                                                        Address
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        value={data.address}
                                                        onChange={(e) =>
                                                            setData(
                                                                "address",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter address"
                                                        required
                                                    />
                                                    <InputError
                                                        message={errors.address}
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phone">
                                                        Phone
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        value={data.phone}
                                                        onChange={(e) =>
                                                            setData(
                                                                "phone",
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Enter phone number"
                                                        required
                                                        maxLength={10}
                                                        minLength={10}
                                                    />
                                                    <InputError
                                                        message={errors.phone}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <div>
                                            <Label htmlFor="phone">
                                                Start Date
                                            </Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) =>
                                                    setData(
                                                        "start_date",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.start_date}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="occupation">
                                                Occupation
                                            </Label>
                                            <Select
                                                defaultValue={data.occupation}
                                                onValueChange={(val) =>
                                                    setData("occupation", val)
                                                }
                                            >
                                                <SelectTrigger id="occupation">
                                                    <SelectValue placeholder="Select occupation" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="private-job">
                                                        Private Job
                                                    </SelectItem>
                                                    <SelectItem value="government-job">
                                                        Government Job
                                                    </SelectItem>
                                                    <SelectItem value="business">
                                                        Business
                                                    </SelectItem>
                                                    <SelectItem value="student">
                                                        Student
                                                    </SelectItem>
                                                    <SelectItem value="housewife">
                                                        House Wife
                                                    </SelectItem>
                                                    <SelectItem value="other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.occupation}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label>Gender</Label>
                                            <Select
                                                defaultValue={data.gender}
                                                onValueChange={(
                                                    val: "male" | "female"
                                                ) => setData("gender", val)}
                                            >
                                                <SelectTrigger id="gender">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">
                                                        Male
                                                    </SelectItem>
                                                    <SelectItem value="female">
                                                        Female
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.gender}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label>Marital Status</Label>
                                            <Select
                                                defaultValue={
                                                    data.marital_status
                                                }
                                                onValueChange={(val) =>
                                                    setData(
                                                        "marital_status",
                                                        val as any
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="marital_status">
                                                    <SelectValue placeholder="Select marital status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">
                                                        Single
                                                    </SelectItem>
                                                    <SelectItem value="married">
                                                        Married
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.marital_status}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="date_of_birth">
                                                Date of Birth
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) =>
                                                    setData(
                                                        "date_of_birth",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                            <InputError
                                                message={errors.date_of_birth}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="preferred_time">
                                                Preferred Shift
                                            </Label>
                                            <Select
                                                onValueChange={(val) =>
                                                    setData(
                                                        "preferred_time",
                                                        val
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select preferred shift" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Morning">
                                                        Morning
                                                    </SelectItem>
                                                    <SelectItem value="Day">
                                                        Day
                                                    </SelectItem>
                                                    <SelectItem value="Evening">
                                                        Evening
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.preferred_time}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Membership and Payment Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Membership and Payment Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        <div className="grow">
                                            <Label htmlFor="membership_package">
                                                Membership Package
                                            </Label>
                                            <Select
                                                defaultValue={data.membership_package.toString()}
                                                onValueChange={(val) =>
                                                    setData(
                                                        "membership_package",
                                                        Number(val)
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="membership_package">
                                                    <SelectValue placeholder="Select membership package" />
                                                </SelectTrigger>
                                                <SelectContent>
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
                                            <InputError
                                                message={
                                                    errors.membership_package
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="grow">
                                            <Label htmlFor="months">
                                                Initial Registration Months
                                            </Label>
                                            <Select
                                                defaultValue={data.months.toString()}
                                                onValueChange={(val) =>
                                                    setData(
                                                        "months",
                                                        Number(val)
                                                    )
                                                }
                                            >
                                                <SelectTrigger id="months">
                                                    <SelectValue placeholder="Select membership months" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 Month
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 Months
                                                    </SelectItem>
                                                    <SelectItem value="6">
                                                        6 Months
                                                    </SelectItem>
                                                    <SelectItem value="12">
                                                        1 Year
                                                    </SelectItem>
                                                    <SelectItem value="0">
                                                        Temporary
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.months}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <div className="grow">
                                            <Label htmlFor="payment_mode">
                                                Payment Mode
                                            </Label>
                                            <Select
                                                defaultValue={data.payment_mode}
                                                onValueChange={(val) =>
                                                    setData("payment_mode", val)
                                                }
                                            >
                                                <SelectTrigger id="payment_mode">
                                                    <SelectValue placeholder="Select payment mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Cash">
                                                        Cash
                                                    </SelectItem>
                                                    <SelectItem value="QR">
                                                        QR
                                                    </SelectItem>
                                                    <SelectItem value="Cash + QR">
                                                        Cash + QR
                                                    </SelectItem>
                                                    <SelectItem value="Cheque">
                                                        Cheque
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.payment_mode}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="grow">
                                            <Label htmlFor="bill_number">
                                                Bill Number
                                            </Label>
                                            <Input
                                                id="bill_number"
                                                type="number"
                                                onChange={(e) =>
                                                    setData(
                                                        "bill_number",
                                                        Number(e.target.value)
                                                    )
                                                }
                                                placeholder="Enter bill number"
                                            />
                                            <InputError
                                                message={errors.bill_number}
                                                className="mt-2"
                                            />
                                        </div>

                                        {data.months > 0 ? (
                                            <div className="grow">
                                                <Label htmlFor="extra_discount">
                                                    Extra Discount
                                                </Label>
                                                <Input
                                                    id="extra_discount"
                                                    type="number"
                                                    onChange={(e) =>
                                                        setData(
                                                            "extra_discount",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    placeholder="Enter extra discount"
                                                />
                                                <InputError
                                                    message={
                                                        errors.extra_discount
                                                    }
                                                    className="mt-2"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grow">
                                                <Label htmlFor="days_count">
                                                    Days Count
                                                </Label>
                                                <Input
                                                    id="days_count"
                                                    placeholder="Enter total number of days"
                                                    type="number"
                                                    onChange={(e) =>
                                                        setData(
                                                            "days_count",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    required
                                                    min={
                                                        new Date(
                                                            Date.now() +
                                                                86400000
                                                        )
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                />
                                                <InputError
                                                    message={errors.days_count}
                                                    className="mt-2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Locker Information Section */}
                            {/* <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Locker Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Label className="flex gap-2 items-center">
                                        <Checkbox
                                            checked={data.locker_access}
                                            onCheckedChange={() => setData('locker_access', !data.locker_access)}
                                        />
                                        Provide Locker Access
                                    </Label>

                                    <div className="flex gap-2">
                                        <div className='grow'>
                                            <Label>Provide Locker Access for</Label>
                                            <Select
                                                disabled={!data.locker_access}
                                                defaultValue={lockers[0]?.id.toString()}
                                                onValueChange={val => setData('locker_id', Number(val))}
                                                value={data.locker_id.toString()}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select accessible months" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {lockers.map(locker => (
                                                        <SelectItem key={locker.id} value={locker.id.toString()}>
                                                            {locker.months} {locker.months === 1 ? "Month" : "Months"} in Rs {locker.price}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.locker_id} className="mt-2" />
                                        </div>

                                        <div className='grow'>
                                            <Label htmlFor="locker_number">Locker Number</Label>
                                            <Input
                                                id="locker_number"
                                                type="text"
                                                value={data.locker_number || ''}
                                                disabled={!data.locker_access}
                                                onChange={e => setData('locker_number', e.target.value)}
                                                placeholder="Enter Locker Number"
                                            />
                                            <InputError message={errors.locker_number} className="mt-2" />
                                        </div>

                                        <div className='grow'>
                                            <Label htmlFor="locker_discount">Locker Discount</Label>
                                            <Input
                                                id="locker_discount"
                                                type="number"
                                                disabled={!data.locker_access}
                                                onChange={e => setData('locker_discount', Number(e.target.value))}
                                                placeholder="Enter locker discount"
                                            />
                                            <InputError message={errors.locker_discount} className="mt-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card> */}
                        </div>

                        <div className="lg:col-span-6 xl:col-span-5 2xl:col-span-4 space-y-2">
                            {/* Emergency Information */}
                            <Card>
                                <CardContent className="gap-2 flex flex-col flex-wrap">
                                    <div className="text-lg mb-2 mt-2">
                                        <strong>Emergency Information</strong>
                                    </div>

                                    <div className="grow">
                                        <Label htmlFor="emergency_person_name">
                                            Person Name
                                        </Label>
                                        <Input
                                            id="emergency_person_name"
                                            value={data.emergency_person_name}
                                            onChange={(e) =>
                                                setData(
                                                    "emergency_person_name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter emergency contact person name"
                                        />
                                        <InputError
                                            message={
                                                errors.emergency_person_name
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="grow">
                                        <Label htmlFor="emergency_person_phone">
                                            Phone
                                        </Label>
                                        <Input
                                            id="emergency_person_phone"
                                            value={data.emergency_person_phone}
                                            onChange={(e) =>
                                                setData(
                                                    "emergency_person_phone",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter emergency contact phone number"
                                        />
                                        <InputError
                                            message={
                                                errors.emergency_person_phone
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing and Payment Section */}
                            <Card>
                                <CardContent>
                                    <div className="text-lg mb-2 mt-2">
                                        <strong>Pricing Summary</strong>
                                    </div>

                                    <div className="text-start mb-1">
                                        <strong>
                                            {
                                                packages.find(
                                                    (p) =>
                                                        p.id ===
                                                        data.membership_package
                                                )?.package_name
                                            }
                                        </strong>
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
                                    <div className="flex justify-between">
                                        <Label>Extra Discount</Label>
                                        <span>- Rs {data.extra_discount}</span>
                                    </div>
                                    <div className="border mb-2"></div>
                                    <div className="flex justify-between">
                                        <Label>Net Package Amount</Label>
                                        <span>Rs {netPackageAmount}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                        <Label>Locker Charge ({data.locker_access ? lockers.find(locker => locker.id === data.locker_id)?.months : 0} Months)</Label>
                                        <span>Rs {data.locker_access ? lockers.find(locker => locker.id === data.locker_id)?.price : 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <Label>Locker Discount</Label>
                                        <span>- Rs {data.locker_access ? data.locker_discount : 0}</span>
                                    </div> */}
                                    <div className="border mb-2"></div>
                                    <strong className="flex justify-between">
                                        <Label>Net Amount</Label>
                                        {data.months > 0 ? (
                                            <span
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    setData(
                                                        "paid",
                                                        calculateNetAmount()
                                                    )
                                                }
                                            >
                                                Rs {calculateNetAmount()}
                                            </span>
                                        ) : (
                                            <input
                                                id="paidAmount"
                                                className="w-fit max-w-48 text-end border-0 border-b-2 focus:ring-0  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                type="number"
                                                min={0}
                                                placeholder="Enter Net Amount"
                                                onChange={(e) =>
                                                    setData(
                                                        "net_amount",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        )}
                                    </strong>
                                    <div className="flex justify-between">
                                        <Label>Paid Amount (Rs)</Label>
                                        <input
                                            id="paidAmount"
                                            className="w-fit max-w-48 text-end border-0 border-b-2 focus:ring-0  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            type="number"
                                            min={0}
                                            placeholder="Enter Paid Amount"
                                            value={data.paid || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "paid",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.paid}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <Label>{calculateBalanceLabel()}</Label>
                                        <span>
                                            Rs {calculateBalanceAmount()}
                                        </span>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full mt-3"
                                    >
                                        {processing
                                            ? "Processing..."
                                            : "Confirm and Register"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </Authenticated>
    );
};

export default MembershipCreationForm;
