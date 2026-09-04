<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBirthdayWishRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'message' => 'required|string|min:3|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'message.min' => 'Wish must be at least 3 characters.',
            'message.max' => 'Wish cannot exceed 500 characters.',
        ];
    }
}
