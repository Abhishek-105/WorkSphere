<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Resources\DailyUpdateResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DailyUpdateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User|null $manager */
        $manager = $request->user();

        abort_unless(
            $manager instanceof User && $manager->isManager(),
            403
        );

        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();

        $view = $request->input('view', 'today');

        if (!in_array(
            $view,
            ['today', 'pending', 'blockers', 'week', 'all'],
            true
        )) {
            $view = 'today';
        }

        $query = DailyUpdate::query()
            ->with([
                'employee',
                'project',
                'task',
                'reviewer',
                'blockerAcknowledgedBy',
            ]);

        if ($view === 'today') {
            $query->whereDate(
                'update_date',
                $today->toDateString()
            );
        }

        if ($view === 'pending') {
            $query
                ->where(function ($query): void {
                    $query
                        ->whereNull('status')
                        ->orWhere('status', 'pending');
                })
                ->whereDate(
                    'update_date',
                    '<=',
                    $today->toDateString()
                );
        }

        if ($view === 'blockers') {
            $query
                ->whereNotNull('blocker_details')
                ->where('blocker_details', '!=', '');
        }

        if ($view === 'week') {
            $query->whereBetween('update_date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ]);
        }

        if ($request->filled('employee_id')) {
            $query->where(
                'employee_id',
                (int) $request->input('employee_id')
            );
        }

        if ($request->filled('project_id')) {
            $query->where(
                'project_id',
                (int) $request->input('project_id')
            );
        }

        if ($request->filled('status')) {
            $status = $request->input('status');

            if ($status === 'pending') {
                $query->where(function ($query): void {
                    $query
                        ->whereNull('status')
                        ->orWhere('status', 'pending');
                });
            }

            if ($status === 'reviewed') {
                $query->where('status', 'reviewed');
            }
        }

        if ($request->boolean('active_blockers')) {
            $query
                ->whereNotNull('blocker_details')
                ->where('blocker_details', '!=', '')
                ->whereNull('blocker_acknowledged_at');
        }

        $updates = $query
            ->latest('update_date')
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Today Metrics
        |--------------------------------------------------------------------------
        */

        $todayQuery = DailyUpdate::query()
            ->whereDate(
                'update_date',
                $today->toDateString()
            );

        $totalSubmittedToday = (clone $todayQuery)->count();

        $pendingReview = (clone $todayQuery)
            ->where(function ($query): void {
                $query
                    ->whereNull('status')
                    ->orWhere('status', 'pending');
            })
            ->count();

        $reviewedToday = (clone $todayQuery)
            ->where('status', 'reviewed')
            ->count();

        $totalBlockersToday = (clone $todayQuery)
            ->whereNotNull('blocker_details')
            ->where('blocker_details', '!=', '')
            ->count();

        $activeBlockersCount = (clone $todayQuery)
            ->whereNotNull('blocker_details')
            ->where('blocker_details', '!=', '')
            ->whereNull('blocker_acknowledged_at')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Week Metrics
        |--------------------------------------------------------------------------
        */

        $totalSubmittedThisWeek = DailyUpdate::query()
            ->whereBetween('update_date', [
                $weekStart->toDateString(),
                $weekEnd->toDateString(),
            ])
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Employees
        |--------------------------------------------------------------------------
        */

        $employees = User::query()
            ->where('role', 'employee')
            ->where('status', 'active')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
            ]);

        $submittedEmployeeIdsToday = DailyUpdate::query()
            ->whereDate(
                'update_date',
                $today->toDateString()
            )
            ->pluck('employee_id')
            ->unique()
            ->values();

        $missingUpdates = $employees
            ->whereNotIn(
                'id',
                $submittedEmployeeIdsToday
            )
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Projects
        |--------------------------------------------------------------------------
        */

        $projects = Project::query()
            ->orderBy('title')
            ->get([
                'id',
                'title',
            ]);

        return response()->json([
            'message' => 'Manager daily updates retrieved successfully.',

            'filters' => [
                'view' => $view,
                'employee_id' => $request->input('employee_id'),
                'project_id' => $request->input('project_id'),
                'status' => $request->input('status'),
                'active_blockers' => $request->boolean('active_blockers'),
            ],

            'statistics' => [
                'total_submitted_today' => $totalSubmittedToday,
                'pending_review' => $pendingReview,
                'reviewed_today' => $reviewedToday,
                'total_blockers_today' => $totalBlockersToday,
                'active_blockers_count' => $activeBlockersCount,
                'total_submitted_this_week' => $totalSubmittedThisWeek,
            ],

            'employees' => UserResource::collection($employees),

            'missing_updates' => UserResource::collection(
                $missingUpdates
            ),

            'projects' => ProjectResource::collection($projects),

            'updates' => DailyUpdateResource::collection($updates),
        ]);
    }

    public function show(
        Request $request,
        DailyUpdate $dailyUpdate
    ): JsonResponse {
        /** @var User|null $manager */
        $manager = $request->user();

        abort_unless(
            $manager instanceof User && $manager->isManager(),
            403
        );

        $dailyUpdate->load([
            'employee',
            'project',
            'task',
            'reviewer',
            'blockerAcknowledgedBy',
        ]);

        return response()->json([
            'message' => 'Manager daily update retrieved successfully.',
            'daily_update' => new DailyUpdateResource($dailyUpdate),
        ]);
    }

    public function review(
        Request $request,
        DailyUpdate $dailyUpdate
    ): JsonResponse {
        /** @var User|null $manager */
        $manager = $request->user();

        abort_unless(
            $manager instanceof User && $manager->isManager(),
            403
        );

        $dailyUpdate->status = 'reviewed';
        $dailyUpdate->reviewed_by = (int) $manager->getAuthIdentifier();
        $dailyUpdate->reviewed_at = Carbon::now();

        $dailyUpdate->save();

        $dailyUpdate->load([
            'employee',
            'project',
            'task',
            'reviewer',
            'blockerAcknowledgedBy',
        ]);

        return response()->json([
            'message' => 'Daily update marked as reviewed.',
            'daily_update' => new DailyUpdateResource($dailyUpdate),
        ]);
    }

    public function acknowledgeBlocker(
        Request $request,
        DailyUpdate $dailyUpdate
    ): JsonResponse {
        /** @var User|null $manager */
        $manager = $request->user();

        abort_unless(
            $manager instanceof User && $manager->isManager(),
            403
        );

        if (!$dailyUpdate->hasBlocker()) {
            return response()->json([
                'message' => 'This daily update does not contain a blocker.',
            ], 422);
        }

        $dailyUpdate->blocker_acknowledged_by =
            (int) $manager->getAuthIdentifier();

        $dailyUpdate->blocker_acknowledged_at = Carbon::now();

        $dailyUpdate->save();

        $dailyUpdate->load([
            'employee',
            'project',
            'task',
            'reviewer',
            'blockerAcknowledgedBy',
        ]);

        return response()->json([
            'message' => 'Blocker acknowledged successfully.',
            'daily_update' => new DailyUpdateResource($dailyUpdate),
        ]);
    }

    public function comment(
        Request $request,
        DailyUpdate $dailyUpdate
    ): JsonResponse {
        /** @var User|null $manager */
        $manager = $request->user();

        abort_unless(
            $manager instanceof User && $manager->isManager(),
            403
        );

        $validated = $request->validate([
            'manager_comment' => [
                'nullable',
                'string',
                'max:3000',
            ],
        ]);

        $dailyUpdate->manager_comment =
            $validated['manager_comment'] ?? null;

        $dailyUpdate->save();

        $dailyUpdate->load([
            'employee',
            'project',
            'task',
            'reviewer',
            'blockerAcknowledgedBy',
        ]);

        return response()->json([
            'message' => 'Manager comment saved.',
            'daily_update' => new DailyUpdateResource($dailyUpdate),
        ]);
    }
}