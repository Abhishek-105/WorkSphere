<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();

        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();

        /*
        |--------------------------------------------------------------------------
        | Tasks
        |--------------------------------------------------------------------------
        */

        $tasks = Task::with([
            'project',
            'assignedEmployee',
            'assignees',
            'creator',
        ])
            ->latest()
            ->get();

        $totalTasks = $tasks->count();

        $pendingTasks = $tasks
            ->filter(function (Task $task): bool {
                return $this->normalizeStatus($task->status) === 'pending';
            })
            ->count();

        $inProgressTasks = $tasks
            ->filter(function (Task $task): bool {
                return $this->normalizeStatus($task->status) === 'in_progress';
            })
            ->count();

        $completedTasks = $tasks
            ->filter(function (Task $task): bool {
                return $this->normalizeStatus($task->status) === 'completed';
            })
            ->count();

        $overdueTasks = $tasks
            ->filter(function (Task $task) use ($today): bool {
                if (!$task->deadline) {
                    return false;
                }

                $deadline = Carbon::parse(
                    (string) $task->deadline
                );

                return $deadline->lt($today)
                    && $this->normalizeStatus($task->status) !== 'completed';
            })
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Task Due Dates
        |--------------------------------------------------------------------------
        */

        $tasksDueToday = $tasks
            ->filter(function (Task $task) use ($today): bool {
                if (!$task->deadline) {
                    return false;
                }

                $deadline = Carbon::parse(
                    (string) $task->deadline
                );

                return $deadline->isSameDay($today)
                    && $this->normalizeStatus($task->status) !== 'completed';
            })
            ->count();

        $tasksDueThisWeek = $tasks
            ->filter(function (Task $task) use (
                $weekStart,
                $weekEnd
            ): bool {
                if (!$task->deadline) {
                    return false;
                }

                if (
                    $this->normalizeStatus($task->status)
                    === 'completed'
                ) {
                    return false;
                }

                $deadline = Carbon::parse(
                    (string) $task->deadline
                );

                return $deadline->betweenIncluded(
                    $weekStart,
                    $weekEnd
                );
            })
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Task Completion
        |--------------------------------------------------------------------------
        */

        $taskCompletionPercentage = $totalTasks > 0
            ? (int) round(
                ($completedTasks / $totalTasks) * 100
            )
            : 0;

        /*
        |--------------------------------------------------------------------------
        | Projects
        |--------------------------------------------------------------------------
        */

        $projects = Project::with([
            'creator',
            'employees',
        ])
            ->latest()
            ->get();

        $totalProjects = $projects->count();

        $activeProjects = $projects
            ->where('status', 'active')
            ->count();

        $completedProjects = $projects
            ->where('status', 'completed')
            ->count();

        /*
        |--------------------------------------------------------------------------
        | Pending / On-Hold Projects
        |--------------------------------------------------------------------------
        */

        $pendingProjects = $projects
            ->where('status', 'on-hold')
            ->count();

        $onHoldProjects = $pendingProjects;

        /*
        |--------------------------------------------------------------------------
        | Employees
        |--------------------------------------------------------------------------
        */

        $totalEmployees = User::query()
            ->where('role', 'employee')
            ->where('status', 'active')
            ->count();

        $recentEmployees = User::query()
            ->where('role', 'employee')
            ->where('status', 'active')
            ->latest('created_at')
            ->take(6)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Daily Updates
        |--------------------------------------------------------------------------
        */

        $todayUpdates = DailyUpdate::query()
            ->whereDate('created_at', $today)
            ->count();

        $totalDailyUpdates = DailyUpdate::query()->count();

        /*
        |--------------------------------------------------------------------------
        | Recent Team Updates
        |--------------------------------------------------------------------------
        */

        $recentUpdates = DailyUpdate::query()
            ->with([
                'employee',
                'project',
            ])
            ->latest('created_at')
            ->take(4)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Recent Tasks
        |--------------------------------------------------------------------------
        */

        $recentTasks = $tasks
            ->sortByDesc(function (Task $task): int {
                return $task->created_at?->timestamp ?? 0;
            })
            ->take(8)
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Recent Projects
        |--------------------------------------------------------------------------
        */

        $recentProjects = $projects
            ->sortByDesc(function (Project $project): int {
                return $project->created_at?->timestamp ?? 0;
            })
            ->take(6)
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Completed Projects
        |--------------------------------------------------------------------------
        */

        $completedProjectList = $projects
            ->where('status', 'completed')
            ->sortByDesc(function (Project $project): int {
                return $project->updated_at?->timestamp ?? 0;
            })
            ->take(5)
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Overdue Tasks
        |--------------------------------------------------------------------------
        */

        $overdueTaskList = $tasks
            ->filter(function (Task $task) use ($today): bool {
                if (!$task->deadline) {
                    return false;
                }

                if (
                    $this->normalizeStatus($task->status)
                    === 'completed'
                ) {
                    return false;
                }

                $deadline = Carbon::parse(
                    (string) $task->deadline
                );

                return $deadline->lt($today);
            })
            ->sortBy(function (Task $task): int {
                if (!$task->deadline) {
                    return PHP_INT_MAX;
                }

                return Carbon::parse(
                    (string) $task->deadline
                )->timestamp;
            })
            ->take(8)
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Project Progress
        |--------------------------------------------------------------------------
        */

        $projectProgress = $projects
            ->take(8)
            ->map(function (Project $project): array {
                $projectTasks = $project->tasks()
                    ->select([
                        'id',
                        'project_id',
                        'status',
                        'deadline',
                    ])
                    ->get();

                $total = $projectTasks->count();

                $completed = $projectTasks
                    ->filter(function (Task $task): bool {
                        return $this->normalizeStatus(
                            $task->status
                        ) === 'completed';
                    })
                    ->count();

                $percentage = $total > 0
                    ? (int) round(
                        ($completed / $total) * 100
                    )
                    : 0;

                return [
                    'project' => $project,
                    'total' => $total,
                    'completed' => $completed,
                    'percentage' => $percentage,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | Task Status Distribution
        |--------------------------------------------------------------------------
        */

        $taskStatusDistribution = [
            'pending' => $pendingTasks,
            'in_progress' => $inProgressTasks,
            'completed' => $completedTasks,
        ];

        /*
        |--------------------------------------------------------------------------
        | Dashboard View
        |--------------------------------------------------------------------------
        */

        return view(
            'manager.dashboard',
            compact(
                'tasks',
                'projects',

                'totalTasks',
                'pendingTasks',
                'inProgressTasks',
                'completedTasks',
                'overdueTasks',

                'tasksDueToday',
                'tasksDueThisWeek',

                'taskCompletionPercentage',

                'totalProjects',
                'activeProjects',
                'completedProjects',
                'pendingProjects',
                'onHoldProjects',

                'totalEmployees',
                'recentEmployees',

                'todayUpdates',
                'totalDailyUpdates',
                'recentUpdates',

                'recentTasks',
                'recentProjects',
                'completedProjectList',
                'overdueTaskList',

                'projectProgress',
                'taskStatusDistribution'
            )
        );
    }

    private function normalizeStatus(?string $status): string
    {
        $status = strtolower(
            trim((string) $status)
        );

        return match ($status) {
            'in progress',
            'in_progress' => 'in_progress',

            'done',
            'completed' => 'completed',

            default => 'pending',
        };
    }
}
