<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicRenewalRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'selected_months' => ['required', 'integer', 'min:1'],
            'payment_proof' => ['nullable', 'file', 'mimes:jpeg,png,pdf', 'max:2048'],
        ];
    }

    protected function prepareForValidation()
    {
        // Merge additional fields if necessary
        $this->merge([
            'months' => $this->input('selected_months'),
        ]);
    }
}
