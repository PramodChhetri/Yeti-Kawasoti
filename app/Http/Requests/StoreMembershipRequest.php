<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\MembershipPackage;
use App\Models\Locker;

class StoreMembershipRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }


    public function rules()
    {
        return [
            'name' => ['required', 'string'],
            'phone' => ['required', 'string', 'size:10', 'unique:members,phone', 'unique:registration_applications,phone', 'regex:/^(98|97)[0-9]{8}$/'],
            'occupation' => ['required', 'string'],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'marital_status' => ['required', 'string', 'in:single,married'],
            'date_of_birth' => ['required', 'date'],
            'start_date' => ['required', 'date'],
            'address' => ['required', 'string'],
            'preferred_time' => ['required', 'string'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg'],
            'emergency_person_name' => ['nullable', 'string'],
            'emergency_person_phone' => ['nullable', 'string', 'regex:/^(98|97)[0-9]{8}$/'],
            'membership_package' => ['required', 'exists:membership_packages,id'],
            'months' => ['required', 'numeric', 'min:0'],
            'payment_mode' => ['required', 'string'],
            'bill_number' => $this->handleBillNumberValidation(),
            'extra_discount' => ['nullable', 'numeric', 'min:0'],
            'paid' => ['required', 'numeric', 'min:0'],
            'locker_access' => ['required', 'boolean'],
            'locker_id' => ['nullable', 'exists:lockers,id'],
            'locker_discount' => ['nullable', 'numeric', 'min:0'],
            'locker_number' => ['nullable', 'string'],

            'admission_fees' => ['numeric'],
            'monthly_fees' => ['numeric'],
            'total_monthly_fees' => ['numeric'],
            'gross_package_amount' => ['numeric'],
            'package_discount' => ['numeric'],
            'locker_charge' => ['numeric'],
            'locker_months' => ['numeric'],
            'amount' => ['numeric'],

            //temporary member data
            'days_count' => ['numeric', 'nullable', 'min:1', 'required_if:months,0']
        ];
    }

    public function messages()
    {
        return [
            'photo.max' => 'Maximum photo size allowed is 2 MB',
            'phone.regex' => 'Unsupported phone number format',
            'bill_number.required' => 'Bill number is required when payment mode is cash.',
            'payment_proof.required' => 'Payment proof is required when payment mode is not cash.',
            'days_count.required_if' => 'Required for temporary member'
        ];
    }

    private function handlePaymentProofValidation()
    {
        return $this->input('payment_mode') === 'cash' ? ['nullable'] : ['required', 'file', 'max:2048'];
    }

    private function handleBillNumberValidation()
    {
        return $this->input('payment_mode') === 'cash' ? ['required', 'numeric'] : ['nullable'];
    }

    protected function prepareForValidation()
    {
        $package = MembershipPackage::findOrFail($this->input('membership_package'));
        $admissionFees = $package->admission_amount;
        $monthlyFees = $package->monthly_amount;
        $totalMonthlyFees = $monthlyFees * $this->input('months');

        $packageDiscount = 0;
        if ((int) $this->input('months') === 3) {
            $packageDiscount = (int) $package->discount_quarterly;
        } elseif ((int) $this->input('months') === 6) {
            $packageDiscount = (int) $package->discount_half_yearly;
        } elseif ((int) $this->input('months') === 12) {
            $packageDiscount = (int) $package->discount_yearly;
        }

        $grossPackageAmount = $admissionFees + $totalMonthlyFees - $packageDiscount;
        $extraDiscount = min($this->input('extra_discount', 0), $grossPackageAmount);
        $netPackageAmount = $grossPackageAmount - $extraDiscount;

        if ((int) $this->input('months') === 0) {
            $netPackageAmount = $this->input('net_amount');
        }

        $lockerCharge = 0;
        $lockerMonths = 0;
        if ($this->input('locker_access') && $this->input('locker_id')) {
            $locker = Locker::findOrFail($this->input('locker_id'));
            $lockerCharge = $locker->price - min($this->input('locker_discount', 0), $locker->price);
            $lockerMonths = $locker->months;
        }

        $totalAmount = $netPackageAmount + $lockerCharge;

        $this->merge([
            'admission_fees' => $admissionFees,
            'monthly_fees' => $monthlyFees,
            'total_monthly_fees' => $totalMonthlyFees,
            'gross_package_amount' => $grossPackageAmount,
            'package_discount' => $packageDiscount,
            'extra_discount' => $extraDiscount,
            'locker_charge' => $lockerCharge,
            'locker_months' => $lockerMonths,
            'amount' => $totalAmount,
        ]);
    }
}
