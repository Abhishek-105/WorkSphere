<?php

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Http\Resources\DailyUpdateResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\UserResource;
use App\Models\DailyUpdate;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        $today = now()->toDateString();

        /*
        |--------------------------------------------------------------------------
        | Assigned Projects
        |--------------------------------------------------------------------------
        */

        $projects = $user->projects()
            ->withCount([
                'tasks as total_tasks' => function ($query) use ($user) {
                    $query->where('assigned_to', $user->id);
                },
                'tasks as completed_tasks' => function ($query) use ($user) {
                    $query
                        ->where('assigned_to', $user->id)
                        ->where('status', 'Done');
                },
            ])
            ->latest('projects.created_at')
            ->get();

        $projectCount = $projects->count();

        /*
        |--------------------------------------------------------------------------
        | Assigned Tasks
        |--------------------------------------------------------------------------
        */

        $taskQuery = Task::query()
            ->where('assigned_to', $user->id);

        $totalTasks = (clone $taskQuery)->count();

        $completedTasks = (clone $taskQuery)
            ->where('status', 'Done')
            ->count();

        $pendingTasks = (clone $taskQuery)
            ->where('status', '!=', 'Done')
            ->count();

        $inProgressTasks = (clone $taskQuery)
            ->where('status', 'In Progress')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Daily Updates
        |--------------------------------------------------------------------------
        */

        $dailyUpdateQuery = DailyUpdate::query()
            ->where('employee_id', $user->id);

        $dailyUpdateCount = (clone $dailyUpdateQuery)->count();

        $todayUpdates = (clone $dailyUpdateQuery)
            ->whereDate('update_date', $today)
            ->count();

        $hasSubmittedToday = $todayUpdates > 0;

        $todayHours = (float) (
            (clone $dailyUpdateQuery)
                ->whereDate('update_date', $today)
                ->sum('hours_spent')
        );

        $loggedHours = (float) $dailyUpdateQuery
            ->sum('hours_spent');

        /*
        |--------------------------------------------------------------------------
        | Recent Tasks
        |--------------------------------------------------------------------------
        */

        $recentTasks = Task::query()
            ->with('project')
            ->where('assigned_to', $user->id)
            ->latest('tasks.updated_at')
            ->take(6)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Upcoming Tasks
        |--------------------------------------------------------------------------
        */

        $upcomingTasks = Task::query()
            ->with('project')
            ->where('assigned_to', $user->id)
            ->where('status', '!=', 'Done')
            ->whereNotNull('deadline')
            ->whereDate('deadline', '>=', $today)
            ->orderBy('deadline')
            ->take(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Recent Daily Updates
        |--------------------------------------------------------------------------
        */

        $recentUpdates = DailyUpdate::query()
            ->with([
                'project',
                'task',
            ])
            ->where('employee_id', $user->id)
            ->latest('update_date')
            ->latest('id')
            ->take(5)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Completion Percentage
        |--------------------------------------------------------------------------
        */

        $completionPercentage = $totalTasks > 0
            ? round(($completedTasks / $totalTasks) * 100)
            : 0;

        return response()->json([
            'message' => 'Employee dashboard retrieved successfully.',

            'user' => new UserResource($user),

            'statistics' => [
                'project_count' => $projectCount,

                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'pending_tasks' => $pendingTasks,
                'in_progress_tasks' => $inProgressTasks,

                'daily_update_count' => $dailyUpdateCount,
                'today_updates' => $todayUpdates,
                'has_submitted_today' => $hasSubmittedToday,

                'logged_hours' => $loggedHours,
                'today_hours' => $todayHours,

                'completion_percentage' => $completionPercentage,
            ],

            'projects' => ProjectResource::collection(
                $projects
            ),

            'recent_tasks' => TaskResource::collection(
                $recentTasks
            ),

            'upcoming_tasks' => TaskResource::collection(
                $upcomingTasks
            ),

            'recent_updates' => DailyUpdateResource::collection(
                $recentUpdates
            ),
        ]);
    }
}