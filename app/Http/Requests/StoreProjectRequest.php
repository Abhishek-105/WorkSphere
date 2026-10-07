<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine whether the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check()
            && Auth::user()?->role === 'manager';
    }

    /**
     * Prepare request data before validation.
     *
     * The Next.js frontend sends employee_ids.
     * The backend internally uses employees.
     */
    protected function prepareForValidation(): void
    {
        if (
            $this->has('employee_ids')
            && !$this->has('employees')
        ) {
            $this->merge([
                'employees' => $this->input('employee_ids'),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'start_date' => [
                'required',
                'date',
            ],

            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],

            'status' => [
                'required',
                'string',
                Rule::in([
                    'pending',
                    'in_progress',
                    'completed',
                ]),
            ],

            'employees' => [
                'nullable',
                'array',
            ],

            'employees.*' => [
                'integer',
                'exists:users,id',
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' =>
                'Project title is required.',

            'start_date.required' =>
                'Please select a project start date.',

            'end_date.after_or_equal' =>
                'End date must be after or equal to the start date.',

            'status.required' =>
                'Please select a project status.',

            'status.in' =>
                'Please select a valid project status.',

            'employees.*.exists' =>
                'One or more selected employees are invalid.',
        ];
    }
}