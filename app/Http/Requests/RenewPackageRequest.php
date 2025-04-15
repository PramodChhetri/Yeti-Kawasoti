<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Member;
use App\Models\MembershipPackage;

class RenewPackageRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'selected_months' => ['required', 'numeric', 'min:1'],
            'extra_discount' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'bill_number' => $this->handleBillNumberValidation(),
            'payment_mode' => ['required', 'string'],
            'new_payment_expiry' => ['required'],
            // Optional fields that are merged in the prepareForValidation method
            'monthly_fees' => ['nullable', 'numeric'],
            'total_monthly_fees' => ['nullable', 'numeric'],
            'gross_amount' => ['nullable', 'numeric'],
            'package_discount' => ['nullable', 'numeric'],
            'net_amount' => ['nullable', 'numeric'],
        ];
    }

    public function messages()
    {
        return [
            'bill_number.required' => 'Bill number is required when the payment method is Cash.',
            'payment_mode.in' => 'The payment method must be either QR or Cash.',
        ];
    }

    private function handleBillNumberValidation()
    {
        return $this->input('payment_mode') === 'Cash' ? ['required', 'string'] : ['nullable'];
    }

    protected function prepareForValidation()
    {
        // Fetch the member based on the route parameter
        $member = $this->route('member');

        if ($member) {
            $package = MembershipPackage::find($member->membership_package_id);

            if ($package) {
                $monthly_fees = $package->monthly_amount;
                $total_monthly_fees = $monthly_fees * $this->input('selected_months', 1);

                $package_discount = $this->calculatePackageDiscount($package, (int)$this->input('selected_months', 1));

                $gross_amount = $total_monthly_fees - $package_discount;
                $extra_discount = min($this->input('extra_discount', 0), $gross_amount);
                $net_amount = $gross_amount - $extra_discount;

                $this->merge([
                    'monthly_fees' => $monthly_fees,
                    'total_monthly_fees' => $total_monthly_fees,
                    'gross_amount' => $gross_amount,
                    'package_discount' => $package_discount,
                    'extra_discount' => $extra_discount,
                    'net_amount' => $net_amount,
                ]);
            } else {
                $this->addCustomError('The membership package associated with this member does not exist.');
            }
        } else {
            $this->addCustomError('The member associated with this request does not exist.');
        }
    }

    private function calculatePackageDiscount(MembershipPackage $package, int $months)
    {
        switch ($months) {
            case 3:
                return (int) $package->discount_quarterly;
            case 6:
                return (int) $package->discount_half_yearly;
            case 12:
                return (int) $package->discount_yearly;
            default:
                return 0;
        }
    }

    private function addCustomError($message)
    {
        $validator = $this->getValidatorInstance();
        $validator->errors()->add('member_validation', $message);
    }
}
