<?php

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Http\Resources\DailyUpdateResource;
use App\Http\Resources\ProjectResource;
use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyUpdateController extends Controller
{
    /**
     * Employee daily update history.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        $employeeId = $user->id;
        $today = now()->toDateString();

        $updates = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->with([
                'project',
                'task',
                'reviewer',
                'blockerAcknowledgedBy',
            ])
            ->latest('update_date')
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        $todayUpdate = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->whereDate('update_date', $today)
            ->with([
                'project',
                'task',
                'reviewer',
                'blockerAcknowledgedBy',
            ])
            ->latest('created_at')
            ->first();

        $totalUpdates = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->count();

        $pendingReviews = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->where('status', 'pending')
            ->count();

        $reviewedUpdates = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->where('status', 'reviewed')
            ->count();

        $activeBlockers = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->whereNotNull('blocker_details')
            ->whereNull('blocker_acknowledged_at')
            ->count();

        return response()->json([
            'message' => 'Employee daily updates retrieved successfully.',

            'statistics' => [
                'total_updates' => $totalUpdates,
                'pending_reviews' => $pendingReviews,
                'reviewed_updates' => $reviewedUpdates,
                'active_blockers' => $activeBlockers,
            ],

            'today_update' => $todayUpdate
                ? new DailyUpdateResource($todayUpdate)
                : null,

            'updates' => DailyUpdateResource::collection($updates),
        ]);
    }

    /**
     * Get projects and assigned active tasks available for daily update submission.
     */
    public function create(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        $employeeId = $user->id;

        $projects = Project::query()
            ->where('status', '!=', 'completed')
            ->whereHas('employees', function ($query) use ($employeeId) {
                $query->where('users.id', $employeeId);
            })
            ->with([
                'tasks' => function ($query) use ($employeeId) {
                    $query
                        ->where('status', '!=', 'completed')
                        ->whereHas('assignees', function ($assigneeQuery) use ($employeeId) {
                            $assigneeQuery->where('users.id', $employeeId);
                        })
                        ->orderBy('title');
                },
            ])
            ->orderBy('title')
            ->get();

        return response()->json([
            'message' => 'Daily update submission data retrieved successfully.',
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    /**
     * Store today's daily update.
     */
    public function store(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        $validated = $request->validate([
            'project_id' => [
                'required',
                'integer',
                'exists:projects,id',
            ],
            'task_id' => [
                'nullable',
                'integer',
                'exists:tasks,id',
            ],
            'update_date' => [
                'required',
                'date',
            ],
            'work_description' => [
                'required',
                'string',
                'max:5000',
            ],
            'hours_spent' => [
                'required',
                'numeric',
                'min:0',
                'max:24',
            ],
            'blocker_details' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'plans_for_tomorrow' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'attached_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,xlsx,png,jpg,jpeg,zip,txt',
            ],
        ]);

        $employeeId = $user->id;

        $project = Project::query()
            ->whereKey((int) $validated['project_id'])
            ->where('status', '!=', 'completed')
            ->whereHas('employees', function ($query) use ($employeeId) {
                $query->where('users.id', $employeeId);
            })
            ->first();

        if (!$project) {
            return response()->json([
                'message' => 'You are not assigned to this project.',
            ], 403);
        }

        $task = null;

        if (!empty($validated['task_id'])) {
            $task = Task::query()
                ->whereKey((int) $validated['task_id'])
                ->where('project_id', $project->id)
                ->whereHas('assignees', function ($query) use ($employeeId) {
                    $query->where('users.id', $employeeId);
                })
                ->first();

            if (!$task) {
                return response()->json([
                    'message' => 'The selected task is not assigned to you or does not belong to this project.',
                ], 422);
            }
        }

        $duplicateExists = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->where('project_id', $project->id)
            ->whereDate(
                'update_date',
                $validated['update_date']
            )
            ->exists();

        if ($duplicateExists) {
            return response()->json([
                'message' => 'You have already submitted a daily update for this project on this date.',
            ], 422);
        }

        $filePath = null;

        if ($request->hasFile('attached_file')) {
            $filePath = $request
                ->file('attached_file')
                ->store(
                    'daily-updates/' . $employeeId,
                    'public'
                );
        }

        $dailyUpdate = DailyUpdate::create([
            'employee_id' => $employeeId,
            'project_id' => $project->id,
            'task_id' => $task?->id,
            'update_date' => $validated['update_date'],
            'work_description' => $validated['work_description'],
            'hours_spent' => $validated['hours_spent'],
            'status' => 'pending',
            'attached_file' => $filePath,
            'blocker_details' => $validated['blocker_details'] ?? null,
            'plans_for_tomorrow' => $validated['plans_for_tomorrow'] ?? null,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'blocker_acknowledged_by' => null,
            'blocker_acknowledged_at' => null,
            'manager_comment' => null,
        ]);

        $dailyUpdate->load([
            'project',
            'task',
            'reviewer',
            'blockerAcknowledgedBy',
        ]);

        return response()->json([
            'message' => 'Daily update submitted successfully and is pending manager review.',
            'daily_update' => new DailyUpdateResource($dailyUpdate),
        ], 201);
    }

    /**
     * Display a single employee daily update.
     */
    public function show(
        Request $request,
        DailyUpdate $dailyUpdate
    ): JsonResponse {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        if ((int) $dailyUpdate->employee_id !== (int) $user->id) {
            abort(403);
        }

        $dailyUpdate->load([
            'project',
            'task',
            'reviewer',
            'blockerAcknowledgedBy',
        ]);

        return response()->json([
            'message' => 'Daily update retrieved successfully.',
            'daily_update' => new DailyUpdateResource($dailyUpdate),
        ]);
    }
}