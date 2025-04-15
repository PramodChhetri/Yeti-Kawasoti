<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfficialTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'official_id' => ['nullable', 'integer', 'required_without:name', 'exists:officials,id'],
            'name' => ['nullable', 'string', 'max:255', 'required_without:official_id'],
            'transaction_type' => ['required', 'string'],
            'description' => ['nullable', 'string', 'max:500'],
            'amount' => ['required', 'numeric', 'min:0'],
            'transaction_date' => ['required', 'date'],
            'voucher_number' => ['nullable', 'string', 'max:255'],
        ];
    }


    public function messages()
    {
        return [
            'name.max' => 'Person name can only be a maximum of 255 characters.',
            'name.required_without' => 'Name must be provided.',
            'transaction_type.required' => 'Please select the type of transaction.',
            'amount.required' => 'Amount is required.',
            'amount.numeric' => 'Amount must be a valid number.',
            'transaction_date.required' => 'Transaction date is required.',
            'voucher_number.max' => 'Voucher number can only be a maximum of 255 characters.',
            'official_id.required_without' => 'Either official ID or name must be provided.',
        ];
    }
}
