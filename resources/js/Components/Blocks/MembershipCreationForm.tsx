import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '../InputError';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
import { capitalizeWords, cn } from '@/lib/utils';
import { MembershipPackage } from '@/types';
import axios from 'axios';
import { Card, CardContent, CardHeader } from '../ui/card';
import { toast } from '../ui/use-toast';

interface FormData {
    name: string;
    phone: string;
    fatherName: string;
    gender: 'male' | 'female' | 'other';
    maritalStatus: 'single' | 'married';
    dateOfBirth: Date | undefined;
    address: string;
    preferredTime: string;
    photo: File | null;
    membershipPackage: number,
    amount: number,
    months: number,
    paymentMode: 'cash' | 'esewa' | 'khalti' | 'fonepay' | 'cheque',
    paymentProof: File | null;
    billNumber: number;
    extra_discount: number;
    paid: number;
}

const MembershipCreationForm = (
    { packages, trigger = null, onCreate = () => { return false } }:
        { packages: MembershipPackage[], trigger?: any | null, onCreate?: Function }) => {

    const { data, setData, post, errors, setError, clearErrors, processing, reset } = useForm<FormData>({
        name: '',
        gender: 'male',
        phone: '',
        address: '',
        maritalStatus: 'single',
        fatherName: '',
        dateOfBirth: undefined,
        photo: null,
        preferredTime: '',
        membershipPackage: 1,
        months: 1,
        amount: 0,
        paymentMode: 'cash',
        paymentProof: null,
        billNumber: 0,
        extra_discount: 0,
        paid: 0,
    });

    const [dialogContent, setDialogContent] = useState<'form' | 'data' | 'payment'>('form');
    const [validData, setValidData] = useState<any>({});

    const [loading, setLoading] = useState<'form' | 'data' | 'payment' | null>(null);

    const [open, setOpen] = useState(false);

    const { auth } = usePage().props as any;

    useEffect(() => {
        if (validData?.imageUrl && dialogContent === 'form') {
            setDialogContent('data');
        }
    }, [validData])

    console.log(data);


    const submitCreationForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log(data);
        const selectedPackage = packages.find(p => p.id.toString() === data.membershipPackage.toString());
        const admissionAmt = Number(selectedPackage?.admission_amount);
        const monthlyAmt = Number(selectedPackage?.monthly_amount);
        const totalAmt = admissionAmt + monthlyAmt * data.months;

        let discount = 0;
        switch (Number(data.months)) {
            case 3: discount = Number(selectedPackage?.discount_quarterly); break;
            case 6: discount = Number(selectedPackage?.discount_half_yearly); break;
            case 12: discount = Number(selectedPackage?.discount_yearly); break;
        }
        const discountAmt = discount;
        const amount = totalAmt - discountAmt;



        // Set the calculated amount
        setData('amount', amount);
        //test data if provided credentials are valid
        if (dialogContent === 'form') {
            clearErrors();
            const imageUrl = data.photo && URL.createObjectURL(data.photo);

            setLoading("form");

            axios.post('/check-membership-credentials', data, { headers: { Accept: 'application/json', "Content-Type": "multipart/form-data" } })
                .then(response => {
                    setValidData({ ...response.data.data, imageUrl });
                })
                .catch(error => {
                    if (error.response.status === 422) {
                        // Assign the validation errors to the useForm errors
                        const { errors } = error.response.data;
                        Object.keys(errors).forEach((key) => {
                            setError(key as keyof FormData, errors[key][0]);
                        });
                    } else {
                        // Handle other errors
                        console.error(error);
                        alert('something went wrong');
                    }
                })
                .finally(() => {
                    setLoading(null);
                });
        }

        else if (dialogContent === 'payment') {
            setLoading("payment");
            /* return alert(JSON.stringify({
                'admission_amount': admissionAmt,
                'total_amount': totalAmt,
                'discount_amount': discountAmt,
                'amount': amount,
                'months': Number(data.months),
            })); */
            axios.post('/member/store', data, { headers: { Accept: 'application/json', "Content-Type": 'multipart/form-data' } })
                .then(async (response) => {
                    toast({
                        title: 'Success!',
                        description: response.data?.is_approved ? 'Membership created and approved Successfully' : 'Membership created but yet to be approved. You will be notified on your phone',
                        duration: 10000,
                        className: 'bg-muted'
                    })

                    /*  if (response.data?.is_approved) {
                         const setupResponse = await memberSetup({
                             id: response.data.id,
                             name: response.data.name,
                             gender: response.data.gender,
                             begin_date: response.data.start_date,
                             expiry_date: response.data.payment_expiry_date,
                             photo_path: response.data.photo
                         });
                         console.log(setupResponse);
                     } */
                    setOpen(false);
                    reset();
                    setValidData({});
                    setDialogContent('form');
                    onCreate();
                })
                .catch((err) => {
                    console.log(err);
                    toast({
                        title: 'Error!',
                        description: err?.response?.data?.message || 'Something went wrong',
                        duration: 3000,
                        className: 'bg-destructive text-destructive-foreground'
                    })
                })
                .finally(() => {
                    setLoading(null);
                });
        }
    };

    useEffect(() => {
        setData('months', 1);
    }, [data.membershipPackage]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                {
                    trigger ?
                        trigger :
                        <Button variant={'default'} onClick={() => setOpen(true)}>
                            Create a Membership
                        </Button>
                }
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] w-[90%] overflow-auto'>
                <DialogHeader>
                    <DialogTitle>Create a Membership</DialogTitle>
                    <DialogDescription>Get started by creating a membership and experience our various services</DialogDescription>
                </DialogHeader>
                <form onSubmit={submitCreationForm} className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ${dialogContent != 'form' && 'hidden'}`}>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input required minLength={2} placeholder='Enter Your Name' type="text" id="name" value={data.name} onChange={(event) => setData('name', capitalizeWords(event.target.value))} className='capitalize' />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select onValueChange={(data: FormData['gender']) => setData('gender', data)} defaultValue='male'>
                            <SelectTrigger>
                                <SelectValue placeholder="Please select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='male'>Male</SelectItem>
                                <SelectItem value='female'>Female</SelectItem>
                                <SelectItem value='other'>Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.gender} className="mt-2" />
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone No.</Label>
                        <Input type="text" placeholder='Enter 10 digit phone no.' required id="phone" value={data.phone} onChange={(event) => setData('phone', event.target.value)} maxLength={10} minLength={10} />
                        <InputError message={errors.phone} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="maritalStatus">Marital Status</Label>
                        <Select onValueChange={(data: FormData['maritalStatus']) => setData('maritalStatus', data)} defaultValue='single'>
                            <SelectTrigger>
                                <SelectValue placeholder="Please select Marital Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='single'>Single</SelectItem>
                                <SelectItem value='married'>Married</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.maritalStatus} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="fatherName">Father's Name</Label>
                        <Input type="text" placeholder='Enter Father name' required id="fatherName" value={data.fatherName} onChange={(event) => setData('fatherName', capitalizeWords(event.target.value))} className='capitalize' />
                        <InputError message={errors.fatherName} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        {/*  <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.dateOfBirth && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.dateOfBirth ? format(data.dateOfBirth, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    captionLayout="dropdown-buttons" //Also: dropdown | buttons
                                    fromYear={1940}
                                    toYear={2020}
                                    selected={data.dateOfBirth}
                                    onSelect={(value) => {
                                        let date = new Date(value as Date);
                                        const dateFormat = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                                        setData('dateOfBirth', dateFormat as unknown as Date);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover> */}
                        <Input type="date" placeholder='Enter Date of Birth' required id="dateOfBirth" defaultValue={data.dateOfBirth as unknown as string} onChange={(event) => setData('dateOfBirth', new Date(event.target.value))}  />
                        <InputError message={errors.dateOfBirth} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="photo">Photo (with clear face)</Label>
                        <Input type="file"
                            id="photo"
                            accept="image/*"
                            capture="environment"
                            required
                            onChange={(event) => {
                                if (event.target.files && event.target.files.length > 0) {
                                    setData('photo', event.target.files[0]);
                                }
                            }} />
                        <InputError message={errors.photo} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor='preferred_time'>Preferred Time</Label>
                        <Input required id="preferred_time" aria-expanded value={data.preferredTime} onChange={(event) => setData('preferredTime', event.target.value)} />
                    </div>
                    {/* Membership types */}
                    <div>
                        <Label htmlFor="membershipPackage">Admission Package</Label>
                        <Select onValueChange={(data) => setData('membershipPackage', Number(data))} defaultValue="1">
                            <SelectTrigger>
                                <SelectValue placeholder="Please select Membership Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    packages.map((p) => {
                                        return (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.package_name}</SelectItem>
                                        )
                                    })
                                }
                            </SelectContent>
                        </Select>
                        <InputError message={errors.membershipPackage} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="months">Initial Payment</Label>
                        <Select onValueChange={(data) => setData('months', Number(data))} defaultValue='1'>
                            <SelectTrigger>
                                <SelectValue placeholder="Please select Initial Payment" />
                            </SelectTrigger>

                            {

                                (
                                    <SelectContent>
                                        <SelectItem value='1'>1 Month</SelectItem>
                                        <SelectItem value='3'>3 Months</SelectItem>
                                        <SelectItem value='6'>6 Months</SelectItem>
                                        <SelectItem value='12'>1 Year</SelectItem>
                                    </SelectContent>
                                )
                            }
                        </Select>
                        <InputError message={errors.membershipPackage} className="mt-2" />
                    </div>
                    <div className='col-span-full'>
                        <Label htmlFor="address">Address</Label>
                        <Input type="text" placeholder='Enter member`s address' required id="address" value={data.address} onChange={(event) => setData('address', capitalizeWords(event.target.value))} />
                        <InputError message={errors.address} className="mt-2" />
                    </div>
                    <div className="col-span-full ms-auto">
                        <Button variant={'default'} disabled={loading === 'form'}>
                            {
                                (
                                    loading === 'form' &&
                                    <Loader2 className='animate-spin' size="sm" />
                                )
                                ||
                                "Next"
                            }
                        </Button>
                    </div>
                </form>
                {
                    validData.imageUrl &&
                    <div className={`gap-5 flex flex-col ${dialogContent !== 'data' && 'hidden'}`}>
                        <div className='flex justify-center'>
                            <img src={validData.imageUrl} className='w-40 h-40 object-cover rounded-full' alt="Profile" />
                        </div>
                        <div className="flex flex-col items-center">
                            <p className='text-lg font-semibold mb-2 text-card-foreground'>{validData.name}</p>
                            <p className='text-sm text-muted-foreground mb-2'>{validData.phone}</p>
                            <p className='text-sm text-muted-foreground mb-4'>{validData.address}</p>
                            <div className="flex flex-wrap justify-center">
                                <div className="flex items-center mb-2 mr-6">
                                    <span className="font-semibold text-card-foreground/75 mr-2">Father's Name:</span>
                                    <span className="text-muted-foreground">{validData.fatherName}</span>
                                </div>
                                <div className="flex items-center mb-2 mr-6">
                                    <span className="font-semibold text-card-foreground/75 mr-2">Gender:</span>
                                    <span className="text-muted-foreground">{validData.gender}</span>
                                </div>
                                <div className="flex items-center mb-2 mr-6">
                                    <span className="font-semibold text-card-foreground/75 mr-2">Marital Status:</span>
                                    <span className="text-muted-foreground">{validData.maritalStatus}</span>
                                </div>
                                <div className="flex items-center mb-2 mr-6">
                                    <span className="font-semibold text-card-foreground/75 mr-2">Date of Birth:</span>
                                    <span className="text-muted-foreground">{new Date(validData.dateOfBirth).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center mb-2">
                                    <span className="font-semibold text-card-foreground mr-2">Preferred Time:</span>
                                    <span className="text-muted-foreground">{validData.preferredTime}</span>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-between'>
                            <Button variant={'outline'} onClick={() => setDialogContent("form")}>Back</Button>
                            <Button variant={'default'} onClick={() => setDialogContent('payment')}>Confirm</Button>
                        </div>
                    </div>
                }
                <PaymentContent
                    dialogContent={dialogContent}
                    packages={packages}
                    setDialogContent={setDialogContent}
                    submitCreationForm={submitCreationForm}
                    validData={validData}
                    setData={setData}
                    loading={loading}
                    data={data}
                    errors={errors}
                />
            </DialogContent>
        </Dialog>
    );
};

export default MembershipCreationForm;


const PaymentContent = ({ dialogContent, setDialogContent, packages, validData, submitCreationForm, setData, loading, data, errors }: {
    dialogContent: 'payment' | 'data' | 'form',
    setDialogContent: React.Dispatch<React.SetStateAction<'payment' | 'data' | 'form'>>,
    packages: MembershipPackage[],
    validData: any,
    submitCreationForm: (data: any) => void,
    setData: any,
    loading: "form" | 'payment' | "data" | null,
    data: FormData,
    errors: any,
}) => {
    const { membershipPackage, months } = validData;
    const selectedPackage = packages.find(p => p.id.toString() === membershipPackage);
    const admissionAmt = Number(selectedPackage?.admission_amount);
    const monthlyAmt = Number(selectedPackage?.monthly_amount);
    const totalAmt = admissionAmt + monthlyAmt * months;

    const { auth } = usePage().props as any;

    let discount = 0;
    switch (Number(months)) {
        case 3: discount = Number(selectedPackage?.discount_quarterly); break;
        case 6: discount = Number(selectedPackage?.discount_half_yearly); break;
        case 12: discount = Number(selectedPackage?.discount_yearly);
    }
    const discountAmt = discount;

    const amount = totalAmt - discountAmt;

    useEffect(() => {
        if (dialogContent === 'payment' && amount > 0) {
            setData('extra_discount', 0);
            setData('paid', amount);
        }
    }, [dialogContent])

    return (
        <div className={`gap-5 flex flex-col ${dialogContent !== 'payment' && 'hidden'}`}>
            <Card className='flex flex-col gap-1 bg-muted'>
                <CardHeader className='pt-6 pb-2'>
                    <div className='text-lg text-card-foreground'>
                        {selectedPackage?.package_name} Package
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Admission Amount</span>
                        <span>Rs {admissionAmt}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-muted-foreground'>Monthly Amount ({months} Month)</span>
                        <span>Rs {monthlyAmt * months}</span>
                    </div>
                    <div className='flex justify-between border-b-2 border-muted-foreground pb-1 mb-1'>
                        <span className='text-muted-foreground'>Discount</span>
                        <span>Rs {discountAmt}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span>Total Amount</span>
                        <span>Rs {amount}</span>
                    </div>
                </CardContent>
            </Card>
            <form className='flex flex-col gap-3' onSubmit={submitCreationForm}>
                <div className="grid sm:grid-cols-2 gap-2">
                    <div>
                        <Label htmlFor='payment_type'>Payment Mode</Label>
                        <Select defaultValue='cash' onValueChange={(data) => setData('paymentMode', data)}>
                            <SelectTrigger id='payment_type'>
                                <SelectValue placeholder="Please select Payment Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='cash'>Cash</SelectItem>
                                <SelectItem value='esewa'>eSewa</SelectItem>
                                <SelectItem value='khalti'>Khalti</SelectItem>
                                <SelectItem value='fonepay'>Fonepay</SelectItem>
                                <SelectItem value='cheque'>Cheque</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.paymentMode} className="mt-2" />
                    </div>
                    {
                        data.paymentMode === 'cash' || auth?.user?.id ?
                            <div>
                                <Label htmlFor='billNo'>Bill Number</Label>
                                <Input type='number' id='billNo' placeholder='Enter Bill Number here' required onChange={e => setData('billNumber', Number(e.target.value))} />
                                <InputError message={errors.billNumber} className="mt-2" />
                            </div>
                            :
                            <div>
                                <Label htmlFor='payment_proof'>Payment Proof</Label>
                                <Input type="file"
                                    id="payment_proof"
                                    accept="image/*"
                                    required
                                    onChange={(event) => {
                                        if (event.target.files && event.target.files.length > 0) {
                                            setData('paymentProof', event.target.files[0]);
                                        }
                                    }} />
                                <span className="text-xs text-muted-foreground">
                                    Could be any receipt, screenshot or bill related to transaction
                                </span>
                                <InputError message={errors.paymentProof} className="mt-2" />
                            </div>
                    }


                    {
                        amount >= 0 ? <div>
                            <Label htmlFor='paid_amt'>Paid Amount</Label>
                            <Input type='number' id='paid_amt' placeholder='Enter Paid Amount here' min={0} max={amount} onChange={e => setData('paid', Number(e.target.value))} /* defaultValue={amount} */ />
                            <InputError message={errors.extra_discount} className="mt-2" />
                        </div> : ''
                    }

                    {
                        amount >= 0 ?
                            <div>
                                <Label htmlFor='extra_discount'>Extra Discount (Rs)</Label>
                                <Input type='number' id='extra_discount' placeholder='Enter Extra Discount here' min={0} max={amount} onChange={e => setData('extra_discount', Number(e.target.value))} /* defaultValue={0}  */ />
                                <InputError message={errors.extra_discount} className="mt-2" />
                            </div> : ''
                    }
                </div>

                <div className='flex justify-between'>
                    <Button variant={'outline'} type='button' onClick={() => setDialogContent("data")}>Back</Button>
                    <Button variant={'default'} disabled={loading === 'payment'}>
                        {
                            (
                                loading === 'payment' &&
                                <Loader2 className='animate-spin' size="sm" />
                            )
                            ||
                            "Submit"
                        }
                    </Button>
                </div>
            </form>
        </div>
    )
}