<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    /**
     * Display all employees.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'employee');

        if ($request->filled('search')) {
            $search = trim(
                (string) $request->input('search')
            );

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere(
                        'designation',
                        'like',
                        '%' . $search . '%'
                    );
            });
        }

        if ($request->filled('status')) {
            $status = strtolower(
                trim((string) $request->input('status'))
            );

            if (in_array(
                $status,
                ['active', 'inactive'],
                true
            )) {
                $query->where('status', $status);
            }
        }

        $employees = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $totalEmployees = User::query()
            ->where('role', 'employee')
            ->count();

        $activeEmployees = User::query()
            ->where('role', 'employee')
            ->where('status', 'active')
            ->count();

        $inactiveEmployees = User::query()
            ->where('role', 'employee')
            ->where('status', 'inactive')
            ->count();

        return response()->json([
            'message' => 'Team members retrieved successfully.',
            'statistics' => [
                'total' => $totalEmployees,
                'active' => $activeEmployees,
                'inactive' => $inactiveEmployees,
            ],
            'employees' => UserResource::collection($employees),
        ]);
    }

    /**
     * Display a single employee.
     */
    public function show(User $team): JsonResponse
    {
        abort_unless(
            $team->role === 'employee',
            404
        );

        $team->loadCount([
            'projects',
            'tasks',
            'dailyUpdates',
        ]);

        return response()->json([
            'message' => 'Team member retrieved successfully.',
            'employee' => new UserResource($team),
        ]);
    }

    /**
     * Create a new employee.
     */
    public function store(Request $request): JsonResponse
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

            'designation' => [
                'nullable',
                'string',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
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

        $employee = DB::transaction(
            function () use ($validated): User {
                $employee = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make(
                        $validated['password']
                    ),
                    'role' => 'employee',
                    'designation' =>
                        $validated['designation'] ?? null,
                    'phone' =>
                        $validated['phone'] ?? null,
                    'status' => 'active',
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
                    'description' =>
                        'Created employee "' .
                        $employee->name .
                        '".',
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

                return $employee;
            }
        );

        return response()->json([
            'message' =>
                'Employee account created successfully.',
            'employee' => new UserResource($employee),
        ], 201);
    }

    /**
     * Update an employee.
     */
    public function update(
        Request $request,
        User $team
    ): JsonResponse {
        abort_unless(
            $team->role === 'employee',
            404
        );

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
                Rule::unique('users', 'email')
                    ->ignore($team->id),
            ],

            'designation' => [
                'nullable',
                'string',
                'max:255',
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        DB::transaction(
            function () use (
                $validated,
                $team
            ): void {
                $team->name = $validated['name'];
                $team->email = $validated['email'];
                $team->designation =
                    $validated['designation'] ?? null;
                $team->phone =
                    $validated['phone'] ?? null;

                if (isset($validated['status'])) {
                    $team->status =
                        $validated['status'];
                }

                if (
                    !empty($validated['password'])
                ) {
                    $team->password = Hash::make(
                        $validated['password']
                    );
                }

                $team->save();

                $actorId = Auth::id();

                if (!$actorId) {
                    throw new \RuntimeException(
                        'Unable to record employee activity because the logged-in manager could not be identified.'
                    );
                }

                ActivityLog::query()->insert([
                    'actor_id' => (int) $actorId,
                    'action' => 'employee.updated',
                    'description' =>
                        'Updated employee "' .
                        $team->name .
                        '".',
                    'project_id' => null,
                    'task_id' => null,
                    'daily_update_id' => null,
                    'metadata' => json_encode([
                        'employee_id' => $team->id,
                        'employee_name' => $team->name,
                        'employee_email' => $team->email,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        );

        $team->refresh();

        return response()->json([
            'message' =>
                'Employee updated successfully.',
            'employee' => new UserResource($team),
        ]);
    }

    /**
     * Update employee status only.
     */
    public function updateStatus(
        Request $request,
        User $team
    ): JsonResponse {
        abort_unless(
            $team->role === 'employee',
            404
        );

        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'active',
                    'inactive',
                ]),
            ],
        ]);

        $team->status = $validated['status'];
        $team->save();

        return response()->json([
            'message' =>
                'Employee status updated successfully.',
            'employee' => new UserResource($team),
        ]);
    }

    /**
     * Delete an employee.
     */
    public function destroy(
        User $team
    ): JsonResponse {
        abort_unless(
            $team->role === 'employee',
            404
        );

        DB::transaction(
            function () use ($team): void {
                $actorId = Auth::id();

                if (!$actorId) {
                    throw new \RuntimeException(
                        'Unable to record employee activity because the logged-in manager could not be identified.'
                    );
                }

                ActivityLog::query()->insert([
                    'actor_id' => (int) $actorId,
                    'action' => 'employee.deleted',
                    'description' =>
                        'Deleted employee "' .
                        $team->name .
                        '".',
                    'project_id' => null,
                    'task_id' => null,
                    'daily_update_id' => null,
                    'metadata' => json_encode([
                        'employee_id' => $team->id,
                        'employee_name' => $team->name,
                        'employee_email' => $team->email,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $team->delete();
            }
        );

        return response()->json([
            'message' =>
                'Employee deleted successfully.',
        ]);
    }
}