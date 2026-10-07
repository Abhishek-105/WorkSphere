<?php

namespace App\Http\Requests\Manager;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check()
            && Auth::user()?->role === 'manager';
    }

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

            'project_id' => [
                'required',
                'integer',
                'exists:projects,id',
            ],

            'assignees' => [
                'nullable',
                'array',
            ],

            'assignees.*' => [
                'integer',
                Rule::exists('users', 'id')
                    ->where(
                        fn ($query) => $query->where(
                            'role',
                            'employee'
                        )
                    ),
            ],

            'priority' => [
                'required',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                ]),
            ],

            'deadline' => [
                'nullable',
                'date',
            ],
        ];
    }
}