<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ActivityController extends Controller
{
    public function index(Request $request): View
    {
        $search = trim((string) $request->query('search'));
        $actorId = $request->query('actor_id');
        $projectId = $request->query('project_id');
        $action = trim((string) $request->query('action'));
        $period = trim((string) $request->query('period', 'all'));

        $query = ActivityLog::query()
            ->with([
                'actor',
                'project',
                'task',
                'dailyUpdate',
            ])
            ->latest('created_at');

        if ($search !== '') {
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->where('description', 'like', '%' . $search . '%')
                    ->orWhere('action', 'like', '%' . $search . '%');
            });
        }

        if ($actorId !== null && $actorId !== '') {
            $query->where('actor_id', (int) $actorId);
        }

        if ($projectId !== null && $projectId !== '') {
            $query->where('project_id', (int) $projectId);
        }

        if ($action !== '') {
            $query->where('action', $action);
        }

        if ($period === 'today') {
            $query->whereDate('created_at', now()->toDateString());
        } elseif ($period === 'week') {
            $query->whereBetween(
                'created_at',
                [
                    now()->startOfWeek(),
                    now()->endOfWeek(),
                ]
            );
        }

        $activities = $query
            ->paginate(25)
            ->withQueryString();

        $today = now()->toDateString();

        $todayCount = ActivityLog::query()
            ->whereDate('created_at', $today)
            ->count();

        $weekCount = ActivityLog::query()
            ->whereBetween(
                'created_at',
                [
                    now()->startOfWeek(),
                    now()->endOfWeek(),
                ]
            )
            ->count();

        $projectCount = ActivityLog::query()
            ->whereNotNull('project_id')
            ->count();

        $taskCount = ActivityLog::query()
            ->whereNotNull('task_id')
            ->count();

        $employees = User::query()
            ->where('role', 'employee')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
            ]);

        $projects = Project::query()
            ->orderBy('title')
            ->get([
                'id',
                'title',
            ]);

        $actions = ActivityLog::query()
            ->whereNotNull('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return view('manager.activity.index', [
            'activities' => $activities,
            'todayCount' => $todayCount,
            'weekCount' => $weekCount,
            'projectCount' => $projectCount,
            'taskCount' => $taskCount,
            'employees' => $employees,
            'projects' => $projects,
            'actions' => $actions,
            'search' => $search,
            'actorId' => $actorId,
            'projectId' => $projectId,
            'action' => $action,
            'period' => $period,
        ]);
    }
}