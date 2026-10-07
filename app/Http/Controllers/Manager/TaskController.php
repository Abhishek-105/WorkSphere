<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manager\StoreTaskRequest;
use App\Http\Requests\Manager\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class TaskController extends Controller
{
    /**
     * Display all tasks.
     */
    public function index(Request $request): View
    {
        $query = Task::query()
            ->with([
                'project',
                'assignedEmployee',
                'assignees',
                'creator',
            ]);

        if ($request->filled('search')) {
            $search = trim(
                (string) $request->input('search')
            );

            $query->where(function (Builder $query) use ($search): void {
                $query
                    ->where(
                        'title',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'description',
                        'like',
                        '%' . $search . '%'
                    );
            });
        }

        if ($request->filled('project_id')) {
            $query->where(
                'project_id',
                (int) $request->input('project_id')
            );
        }

        if ($request->filled('status')) {
            $status = $this->normalizeStatus(
                (string) $request->input('status')
            );

            $query->where('status', $status);
        }

        if ($request->filled('priority')) {
            $priority = strtolower(
                trim((string) $request->input('priority'))
            );

            if (in_array(
                $priority,
                ['low', 'medium', 'high'],
                true
            )) {
                $query->where('priority', $priority);
            }
        }

        $tasks = $query
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $allTasks = Task::query()
            ->get([
                'id',
                'status',
                'deadline',
            ]);

        $today = Carbon::today()->toDateString();

        $totalTasks = $allTasks->count();

        $pendingTasks = $allTasks
            ->filter(function (Task $task): bool {
                return $this->normalizeStatus(
                    $task->status
                ) === 'pending';
            })
            ->count();

        $inProgressTasks = $allTasks
            ->filter(function (Task $task): bool {
                return $this->normalizeStatus(
                    $task->status
                ) === 'in_progress';
            })
            ->count();

        $completedTasks = $allTasks
            ->filter(function (Task $task): bool {
                return $this->normalizeStatus(
                    $task->status
                ) === 'completed';
            })
            ->count();

        $overdueTasks = $allTasks
            ->filter(function (Task $task) use ($today): bool {
                $deadline = $task->getRawOriginal('deadline');

                if (!$deadline) {
                    return false;
                }

                if (
                    $this->normalizeStatus(
                        $task->status
                    ) === 'completed'
                ) {
                    return false;
                }

                return (string) $deadline < $today;
            })
            ->count();

        $projects = Project::query()
            ->orderBy('title')
            ->get([
                'id',
                'title',
                'status',
            ]);

        return view('manager.tasks.index', [
            'tasks' => $tasks,
            'projects' => $projects,

            'totalTasks' => $totalTasks,
            'pendingTasks' => $pendingTasks,
            'inProgressTasks' => $inProgressTasks,
            'completedTasks' => $completedTasks,
            'overdueTasks' => $overdueTasks,
        ]);
    }

    /**
     * Show create form.
     */
    public function create(Request $request): View
    {
        $projects = Project::query()
            ->where('status', '!=', 'completed')
            ->with([
                'employees' => function ($query): void {
                    $query
                        ->where('role', 'employee')
                        ->orderBy('name');
                },
            ])
            ->orderBy('title')
            ->get();

        $selectedProjectId = $request->integer(
            'project_id'
        );

        return view('manager.tasks.create', [
            'projects' => $projects,
            'selectedProjectId' => $selectedProjectId,
        ]);
    }

    /**
     * Store task.
     */
    public function store(
        StoreTaskRequest $request
    ): RedirectResponse {
        $validated = $request->validated();

        $project = Project::query()
            ->with('employees')
            ->findOrFail(
                (int) $validated['project_id']
            );

        if ($project->status === 'completed') {
            return back()
                ->withInput()
                ->withErrors([
                    'project_id' =>
                        'A completed project cannot receive new tasks.',
                ]);
        }

        $assigneeIds = $this->validAssigneeIds(
            $project,
            $validated['assignees'] ?? []
        );

        if (empty($assigneeIds)) {
            return back()
                ->withInput()
                ->withErrors([
                    'assignees' =>
                        'Select at least one employee assigned to this project.',
                ]);
        }

        $task = DB::transaction(
            function () use (
                $validated,
                $project,
                $assigneeIds
            ): Task {
                $task = Task::create([
                    'project_id' => $project->id,
                    'assigned_to' => $assigneeIds[0],
                    'title' => $validated['title'],
                    'description' =>
                        $validated['description'] ?? null,
                    'deadline' =>
                        $validated['deadline'] ?? null,
                    'priority' =>
                        $validated['priority'] ?? 'medium',
                    'status' => 'pending',
                    'created_by' => Auth::id(),
                    'started_at' => null,
                    'completed_at' => null,
                ]);

                $task->assignees()->sync(
                    $assigneeIds
                );

                return $task;
            }
        );

        return redirect()
            ->route('manager.tasks.show', [
                'task' => $task->getKey(),
            ])
            ->with(
                'success',
                'Task created successfully.'
            );
    }

    /**
     * Show task.
     */
    public function show(Task $task): View
    {
        $task->load([
            'project.employees',
            'assignedEmployee',
            'assignees',
            'creator',
        ]);

        return view(
            'manager.tasks.show',
            compact('task')
        );
    }

    /**
     * Show edit form.
     */
    public function edit(Task $task): View
    {
        $projects = Project::query()
            ->where(function (Builder $query) use ($task): void {
                $query
                    ->where('status', '!=', 'completed')
                    ->orWhere('id', $task->project_id);
            })
            ->with([
                'employees' => function ($query): void {
                    $query
                        ->where('role', 'employee')
                        ->orderBy('name');
                },
            ])
            ->orderBy('title')
            ->get();

        $task->load('assignees');

        $assignedEmployeeIds = $task
            ->assignees
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values()
            ->all();

        return view(
            'manager.tasks.edit',
            [
                'task' => $task,
                'projects' => $projects,
                'assignedEmployeeIds' =>
                    $assignedEmployeeIds,
            ]
        );
    }

    /**
     * Update task.
     */
    public function update(
        UpdateTaskRequest $request,
        Task $task
    ): RedirectResponse {
        $validated = $request->validated();

        $project = Project::query()
            ->with('employees')
            ->findOrFail(
                (int) $validated['project_id']
            );

        if ($project->status === 'completed') {
            return back()
                ->withInput()
                ->withErrors([
                    'project_id' =>
                        'A completed project cannot receive task changes.',
                ]);
        }

        $assigneeIds = $this->validAssigneeIds(
            $project,
            $validated['assignees'] ?? []
        );

        if (empty($assigneeIds)) {
            return back()
                ->withInput()
                ->withErrors([
                    'assignees' =>
                        'Select at least one employee assigned to this project.',
                ]);
        }

        DB::transaction(
            function () use (
                $task,
                $validated,
                $project,
                $assigneeIds
            ): void {
                $oldStatus = $this->normalizeStatus(
                    $task->status
                );

                $newStatus = $this->normalizeStatus(
                    $validated['status'] ?? $oldStatus
                );

                $task->project_id = $project->id;
                $task->assigned_to = $assigneeIds[0];
                $task->title = $validated['title'];
                $task->description =
                    $validated['description'] ?? null;
                $task->deadline =
                    $validated['deadline'] ?? null;
                $task->priority =
                    $validated['priority'] ?? 'medium';
                $task->status = $newStatus;

                $this->applyStatusTimestamps(
                    $task,
                    $oldStatus,
                    $newStatus
                );

                $task->save();

                $task->assignees()->sync(
                    $assigneeIds
                );
            }
        );

        return redirect()
            ->route('manager.tasks.show', [
                'task' => $task->getKey(),
            ])
            ->with(
                'success',
                'Task updated successfully.'
            );
    }

    /**
     * Update status.
     */
    public function updateStatus(
        Request $request,
        Task $task
    ): RedirectResponse {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
            ],
        ]);

        $newStatus = $this->normalizeStatus(
            $validated['status']
        );

        if (!in_array(
            $newStatus,
            [
                'pending',
                'in_progress',
                'completed',
            ],
            true
        )) {
            return back()->withErrors([
                'status' =>
                    'Invalid task status.',
            ]);
        }

        $oldStatus = $this->normalizeStatus(
            $task->status
        );

        $this->applyStatusTimestamps(
            $task,
            $oldStatus,
            $newStatus
        );

        $task->status = $newStatus;
        $task->save();

        return back()->with(
            'success',
            'Task status updated successfully.'
        );
    }

    /**
     * Delete task.
     */
    public function destroy(
        Task $task
    ): RedirectResponse {
        DB::transaction(
            function () use ($task): void {
                $task->assignees()->detach();
                $task->delete();
            }
        );

        return redirect()
            ->route('manager.tasks.index')
            ->with(
                'success',
                'Task deleted successfully.'
            );
    }

    /**
     * Normalize status.
     */
    private function normalizeStatus(
        ?string $status
    ): string {
        $status = strtolower(
            trim((string) $status)
        );

        return match ($status) {
            'in progress',
            'in-progress',
            'in_progress' => 'in_progress',

            'done',
            'complete',
            'completed' => 'completed',

            'pending' => 'pending',

            default => 'pending',
        };
    }

    /**
     * Apply task workflow timestamps.
     */
    private function applyStatusTimestamps(
        Task $task,
        string $oldStatus,
        string $newStatus
    ): void {
        if ($newStatus === 'pending') {
            $task->started_at = null;
            $task->completed_at = null;

            return;
        }

        if ($newStatus === 'in_progress') {
            if ($task->started_at === null) {
                $task->started_at = Carbon::now();
            }

            $task->completed_at = null;

            return;
        }

        if ($newStatus === 'completed') {
            if ($task->started_at === null) {
                $task->started_at = Carbon::now();
            }

            $task->completed_at = Carbon::now();
        }
    }

    /**
     * Get valid project employee IDs.
     */
    private function validAssigneeIds(
        Project $project,
        array $requestedIds
    ): array {
        $requestedIds = collect($requestedIds)
            ->map(
                fn ($id): int => (int) $id
            )
            ->filter(
                fn (int $id): bool => $id > 0
            )
            ->unique()
            ->values();

        if ($requestedIds->isEmpty()) {
            return [];
        }

        return $project
            ->employees
            ->whereIn(
                'id',
                $requestedIds
            )
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->values()
            ->all();
    }
}
