<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRegistrationApplicationRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string',
            'phone' => ['required', 'string', 'size:10', 'unique:registration_applications,phone', 'unique:members,phone'],
            'occupation' => 'required|string',
            'gender' => 'required|string|in:male,female,other',
            'marital_status' => 'required|string|in:single,married',
            'date_of_birth' => 'required|date',
            'address' => 'required|string',
            'preferred_time' => 'required|string',
            'membership_package_id' => 'required|exists:membership_packages,id',
            'months' => 'required|numeric|min:1',
            'emergency_person_name' => 'nullable|string',
            'emergency_person_phone' => 'nullable|string',
            'photo' => 'nullable|Image',
            'payment_proof' => 'nullable|Image|File|mimes:jpeg,png,jpg,pdf',
        ];
    }
}
