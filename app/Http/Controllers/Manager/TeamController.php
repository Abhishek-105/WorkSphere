<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class TeamController extends Controller
{
    public function index(): View
    {
        $employees = User::query()
            ->where('role', 'employee')
            ->latest()
            ->paginate(10);

        return view(
            'manager.team.index',
            compact('employees')
        );
    }

    public function create(): View
    {
        return view('manager.team.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ], [
            'name.required' =>
                'Employee name is required.',

            'email.required' =>
                'Employee email is required.',

            'email.email' =>
                'Please enter a valid email address.',

            'email.unique' =>
                'An account with this email already exists.',

            'password.required' =>
                'A password is required.',

            'password.min' =>
                'The password must contain at least 8 characters.',

            'password.confirmed' =>
                'The password confirmation does not match.',
        ]);

        DB::transaction(function () use ($validated): void {
            $employee = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'employee',
            ]);

            $actorId = Auth::id();

            if (!$actorId) {
                throw new \RuntimeException(
                    'Unable to record employee activity because the logged-in manager could not be identified.'
                );
            }

            ActivityLog::query()->insert([
                'actor_id' => (int) $actorId,
                'action' => 'employee.created',
                'description' => 'Created employee "' . $employee->name . '".',
                'project_id' => null,
                'task_id' => null,
                'daily_update_id' => null,
                'metadata' => json_encode([
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->name,
                    'employee_email' => $employee->email,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return redirect()
            ->route('manager.team.index')
            ->with(
                'success',
                'Employee account created successfully.'
            );
    }

    public function edit(User $team): View
    {
        abort_unless(
            $team->role === 'employee',
            404
        );

        return view(
            'manager.team.edit',
            [
                'employee' => $team,
            ]
        );
    }
}
