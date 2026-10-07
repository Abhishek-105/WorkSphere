<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\View\View;

class DailyUpdateController extends Controller
{
    public function index(Request $request): View
    {
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
                ->where(function ($q): void {
                    $q->whereNull('status')
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
                $query->where(function ($q): void {
                    $q->whereNull('status')
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
        | Today metrics
        |--------------------------------------------------------------------------
        */

        $todayQuery = DailyUpdate::query()
            ->whereDate(
                'update_date',
                $today->toDateString()
            );

        $totalSubmittedToday = (clone $todayQuery)
            ->count();

        $pendingReview = (clone $todayQuery)
            ->where(function ($q): void {
                $q->whereNull('status')
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
        | Week metrics
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

        return view(
            'manager.daily-updates.index',
            compact(
                'updates',
                'employees',
                'projects',
                'view',
                'today',
                'weekStart',
                'weekEnd',
                'totalSubmittedToday',
                'pendingReview',
                'reviewedToday',
                'totalBlockersToday',
                'activeBlockersCount',
                'totalSubmittedThisWeek',
                'missingUpdates'
            )
        );
    }

    public function show(
        DailyUpdate $dailyUpdate
    ): View {
        $dailyUpdate->load([
            'employee',
            'project',
            'task',
            'reviewer',
            'blockerAcknowledgedBy',
        ]);

        return view(
            'manager.daily-updates.show',
            compact('dailyUpdate')
        );
    }

   public function review(
    Request $request,
    DailyUpdate $dailyUpdate
): RedirectResponse {
    $manager = $request->user();

    if (!$manager instanceof User) {
        abort(403);
    }

    $dailyUpdate->status = 'reviewed';
    $dailyUpdate->reviewed_by = (int) $manager->getAuthIdentifier();
    $dailyUpdate->reviewed_at = Carbon::now();

    $dailyUpdate->save();

    return back()->with(
        'success',
        'Daily update marked as reviewed.'
    );
}

    public function acknowledgeBlocker(
    Request $request,
    DailyUpdate $dailyUpdate
): RedirectResponse {
    $manager = $request->user();

    if (!$manager instanceof User) {
        abort(403);
    }

    if (!$dailyUpdate->hasBlocker()) {
        return back()->with(
            'error',
            'This daily update does not contain a blocker.'
        );
    }

    $dailyUpdate->blocker_acknowledged_by = (int) $manager->getAuthIdentifier();
    $dailyUpdate->blocker_acknowledged_at = Carbon::now();

    $dailyUpdate->save();

    return back()->with(
        'success',
        'Blocker acknowledged successfully.'
    );
}

    public function comment(
        Request $request,
        DailyUpdate $dailyUpdate
    ): RedirectResponse {
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

        return back()->with(
            'success',
            'Manager comment saved.'
        );
    }
}