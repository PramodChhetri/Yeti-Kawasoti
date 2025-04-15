import React, { ReactNode, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '../InputError';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { toast } from '../ui/use-toast';
import { Card, CardContent, CardHeader } from '../ui/card';
import moment from 'moment';
import { Checkbox } from '../ui/checkbox';

interface FormData {
  phone: string;
  months: number;
  amount: number;
  paymentMode: 'cash' | 'esewa' | 'khalti' | 'fonepay' | 'cheque';
  paymentProof: File | null;
  billNumber: number;
  regular: boolean;
  extra_discount: number;
  paid: number;
}

const MembershipRenewalForm = ({ trigger, onRenew = () => { return false } }: { trigger?: ReactNode, onRenew?: Function }) => {

  const { data, setData, post, errors, setError, clearErrors, processing, reset } = useForm<FormData>({
    phone: '',
    months: 1,
    amount: 0,
    paymentMode: 'cash',
    paymentProof: null,
    billNumber: 0,
    regular: false,
    extra_discount: 0,
    paid: 0,
  });

  const { auth } = usePage().props as any;

  const [dialogContent, setDialogContent] = useState<'form' | 'data' | 'payment'>('form');
  const [validData, setValidData] = useState<any>({});

  const [open, setOpen] = useState(false);
  const [disableForm, setDisableForm] = useState(false);

  useEffect(() => {
    if (validData?.imageUrl && dialogContent === 'form') {
      setDialogContent('data');
    }
  }, [validData]);

  const calculateTotalAmount = (validData: any, months: number) => {
    let totalAmt = months * validData.membership_package.monthly_amount;
    let discount = 0;
    switch (months) {
      case 3:
        discount = Number(validData.membership_package.discount_quarterly);
        break;
      case 6:
        discount = Number(validData.membership_package.discount_half_yearly);
        break;
      case 12:
        discount = Number(validData.membership_package.discount_yearly);
        break;
    }
    totalAmt -= discount;
    return totalAmt;
  };

  const submitRenewalForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disableForm) {
      toast({
        description: "Failed! Something went wrong",
        variant: "destructive"
      });
      return false;
    }
    if (dialogContent === 'form') {
      clearErrors();
      axios.post('/check-renewal-credentials', data, { headers: { Accept: 'application/json' } })
        .then(response => {
          const validData = response.data.data;
          setValidData(validData);
          const totalAmount = calculateTotalAmount(validData, data.months);
          setData('amount', totalAmount);
          setDialogContent("data");
        })
        .catch(error => {
          if (error.response.status === 422) {
            const { errors } = error.response.data;
            Object.keys(errors).forEach((key) => {
              setError(key as keyof FormData, errors[key][0]);
            });
          } else {
            console.error(error);
            alert('something went wrong');
          }
        });
    } else if (dialogContent === 'payment' && !disableForm) {
      setDisableForm(true);
      console.log(data);
      axios.post('/renew-membership', data, { headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' } })
        .then((response) => {
          console.log('response', response);
          toast({
            title: 'Success!',
            description: auth?.user?.id ? 'Membership Renewed and approved' : 'Membership renewal requested for approval. You will be notified on your phone',
            duration: 10000,
            className: 'bg-muted'
          });
          setOpen(false);
          reset();
          setValidData({});
          setDialogContent('form');
          onRenew();
        }).catch((error) => {
          console.log('error', error);
          toast({
            title: 'Error!',
            description: 'Something went wrong. Please try again later',
            duration: 10000,
            className: 'bg-muted'
          });
        })
        .finally(() => {
          setDisableForm(false);
        })
        ;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {
          trigger
          ||
          <Button variant={'default'} onClick={() => setOpen(true)}>
            Renew Membership
          </Button>
        }
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-[90%] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Renew Membership</DialogTitle>
          <DialogDescription>Renew your membership and continue to enjoy our services</DialogDescription>
        </DialogHeader>
        <form onSubmit={submitRenewalForm} className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ${dialogContent !== 'form' && 'hidden'}`}>
          <div>
            <Label htmlFor="phone">Phone No.</Label>
            <Input type="text" placeholder='9812345678' required id="phone" value={data.phone} onChange={(event) => setData('phone', event.target.value)} maxLength={10} minLength={10} />
            <InputError message={errors.phone} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="months">No. of Months</Label>
            <Select onValueChange={(value) => setData('months', Number(value))} defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Please select No. of Months" />
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
          <div className="col-span-full ms-auto">
            <Button variant={'default'}>
              Next
            </Button>
          </div>
        </form>
        {
          validData.photo &&
          <div className={`gap-5 flex flex-col ${dialogContent !== 'data' && 'hidden'}`}>
            <div className='flex justify-center'>
              <img src={validData.photo} className='w-40 h-40 object-cover rounded-full' alt="Profile" />
            </div>
            <div className="flex flex-col items-center">
              <p className='text-lg font-semibold mb-2 text-card-foreground'>{validData.name}</p>
              <p className='text-sm text-muted-foreground mb-2'>{validData.phone}</p>
              <p className='text-sm text-muted-foreground mb-4'>{validData.address}</p>
              <div className="flex flex-wrap justify-center">
                <div className="flex items-center mb-2 mr-6">
                  <span className="font-semibold text-card-foreground/75 mr-2">Father's Name:</span>
                  <span className="text-muted-foreground">{validData.father_name}</span>
                </div>
                <div className="flex items-center mb-2 mr-6">
                  <span className="font-semibold text-card-foreground/75 mr-2">Gender:</span>
                  <span className="text-muted-foreground">{validData.gender}</span>
                </div>
                <div className="flex items-center mb-2 mr-6">
                  <span className="font-semibold text-card-foreground/75 mr-2">Marital Status:</span>
                  <span className="text-muted-foreground">{validData.marital_status}</span>
                </div>
                <div className="flex items-center mb-2 mr-6">
                  <span className="font-semibold text-card-foreground/75 mr-2">Date of Birth:</span>
                  <span className="text-muted-foreground">{new Date(validData.date_of_birth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="font-semibold text-card-foreground mr-2">Preferred Time:</span>
                  <span className="text-card-foreground">{moment(validData.preferred_time, ["HH:mm"]).format('h:mm A')}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span className="font-semibold text-card-foreground mr-2">Payment Expiry Date:</span>
                  <span className="text-card-foreground">{moment(validData.payment_expiry_date).format('MMMM Do YYYY')}</span>
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
          setDialogContent={setDialogContent}
          submitRenewalForm={submitRenewalForm}
          validData={validData}
          setData={setData}
          data={data}
          errors={errors}
          months={data.months}
        />
      </DialogContent>
    </Dialog>
  );
};

const PaymentContent = ({ dialogContent, setDialogContent, submitRenewalForm, validData, setData, data, errors, months }: {
  dialogContent: 'payment' | 'data' | 'form',
  setDialogContent: React.Dispatch<React.SetStateAction<'payment' | 'data' | 'form'>>,
  submitRenewalForm: (data: any) => void,
  validData: any,
  setData: any,
  data: FormData,
  errors: any,
  months: number,
}) => {
  if (!validData.name) return null;
  let amt = months * validData.membership_package.monthly_amount;
  let discount = 0;
  switch (months) {
    case 3:
      discount = Number(validData.membership_package.discount_quarterly);
      break;
    case 6:
      discount = Number(validData.membership_package.discount_half_yearly);
      break;
    case 12:
      discount = Number(validData.membership_package.discount_yearly);
      break;
  }

  let totalAmt = amt - discount;

  const { auth } = usePage().props as any;

  useEffect(() => {
    if (totalAmt > 0)
      setData('extra_discount', totalAmt - data.paid);
  }, [data.paid]);

  useEffect(() => {
    if (dialogContent === 'payment' && totalAmt > 0) {
      setData('extra_discount', 0);
      setData('paid', totalAmt);
    }
  }, [dialogContent])

  return (
    <div className={`gap-5 flex flex-col ${dialogContent !== 'payment' && 'hidden'}`}>
      <Card className='flex flex-col gap-1 bg-muted'>
        <CardHeader className='pt-6 pb-2'>
          <div className='text-lg text-card-foreground'>
            Renewal Details
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>No. of Months</span>
            <span>{months} Month(s)</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Monthly Amount ({months} * {Number(validData.membership_package.monthly_amount)}) </span>
            <span>Rs {Number(amt)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Discount</span>
            <span>Rs {discount}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Total Amount</span>
            <span>Rs {totalAmt}</span>
          </div>
        </CardContent>
      </Card>
      <form className='grid sm:grid-cols-2 gap-3' onSubmit={submitRenewalForm}>
        <div className='flex items-center gap-2'>
          <Checkbox id='regularityCheck' onCheckedChange={val => setData('regular', val)} />
          <Label className={`flex items-center gap-2`} htmlFor='regularityCheck'>
            Member is Regular
          </Label>
        </div>
        <div>
          <Label htmlFor='payment_type'>Payment Mode</Label>
          <Select defaultValue='cash' onValueChange={(value) => setData('paymentMode', value)}>
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
              <Input type='number' id='billNo' placeholder='Enter bill no.' required onChange={e => setData('billNumber', Number(e.target.value))} />
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
          totalAmt >= 0 ?
            <div>
              <Label htmlFor='extra_discount'>Extra Discount (Rs)</Label>
              <Input type='number' id='extra_discount' placeholder='Enter Extra Discount here' min={0} max={totalAmt} onChange={e => setData('extra_discount', Number(e.target.value))} />
              <InputError message={errors.extra_discount} className="mt-2" />
            </div> : ''
        }

        {
          totalAmt >= 0 ? <div>
            <Label htmlFor='paid_amt'>Paid Amount</Label>
            <Input type='number' id='paid_amt' placeholder='Enter Paid Amount here' min={0} max={totalAmt} onChange={e => setData('paid', Number(e.target.value))} />
            <InputError message={errors.extra_discount} className="mt-2" />
          </div> : ''
        }

        <div className='flex justify-between col-span-full'>
          <Button variant={'outline'} type='button' onClick={() => setDialogContent("data")}>Back</Button>
          <Button variant={'default'} type='submit'>Submit</Button>
        </div>
      </form>
    </div>
  );
};

export default MembershipRenewalForm;
