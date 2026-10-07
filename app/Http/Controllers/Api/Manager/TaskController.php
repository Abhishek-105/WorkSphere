<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Manager\StoreTaskRequest;
use App\Http\Requests\Manager\UpdateTaskRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    /**
     * Display all tasks.
     */
    public function index(Request $request): JsonResponse
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

        return response()->json([
            'message' => 'Tasks retrieved successfully.',

            'statistics' => [
                'total' => $totalTasks,
                'pending' => $pendingTasks,
                'in_progress' => $inProgressTasks,
                'completed' => $completedTasks,
                'overdue' => $overdueTasks,
            ],

            'projects' => ProjectResource::collection(
                $projects
            ),

            'tasks' => TaskResource::collection(
                $tasks
            ),
        ]);
    }

    /**
     * Display a single task.
     */
    public function show(Task $task): JsonResponse
    {
        $task->load([
            'project',
            'assignedEmployee',
            'assignees',
            'creator',
        ]);

        return response()->json([
            'message' => 'Task retrieved successfully.',

            'task' => new TaskResource($task),
        ]);
    }

    /**
     * Store a new task.
     */
    public function store(
        StoreTaskRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $project = Project::query()
            ->with('employees')
            ->findOrFail(
                (int) $validated['project_id']
            );

        if ($project->status === 'completed') {
            return response()->json([
                'message' =>
                    'A completed project cannot receive new tasks.',

                'errors' => [
                    'project_id' => [
                        'A completed project cannot receive new tasks.',
                    ],
                ],
            ], 422);
        }

        $assigneeIds = $this->validAssigneeIds(
            $project,
            $validated['assignees'] ?? []
        );

        if (empty($assigneeIds)) {
            return response()->json([
                'message' =>
                    'Select at least one employee assigned to this project.',

                'errors' => [
                    'assignees' => [
                        'Select at least one employee assigned to this project.',
                    ],
                ],
            ], 422);
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

        $task->load([
            'project',
            'assignedEmployee',
            'assignees',
            'creator',
        ]);

        return response()->json([
            'message' => 'Task created successfully.',

            'task' => new TaskResource($task),
        ], 201);
    }

    /**
     * Update a task.
     */
    public function update(
        UpdateTaskRequest $request,
        Task $task
    ): JsonResponse {
        $validated = $request->validated();

        $project = Project::query()
            ->with('employees')
            ->findOrFail(
                (int) $validated['project_id']
            );

        if ($project->status === 'completed') {
            return response()->json([
                'message' =>
                    'A completed project cannot receive task changes.',

                'errors' => [
                    'project_id' => [
                        'A completed project cannot receive task changes.',
                    ],
                ],
            ], 422);
        }

        $assigneeIds = $this->validAssigneeIds(
            $project,
            $validated['assignees'] ?? []
        );

        if (empty($assigneeIds)) {
            return response()->json([
                'message' =>
                    'Select at least one employee assigned to this project.',

                'errors' => [
                    'assignees' => [
                        'Select at least one employee assigned to this project.',
                    ],
                ],
            ], 422);
        }

        $oldStatus = $this->normalizeStatus(
            $task->status
        );

        $newStatus = $this->normalizeStatus(
            $validated['status']
        );

        DB::transaction(
            function () use (
                $task,
                $validated,
                $project,
                $assigneeIds,
                $oldStatus,
                $newStatus
            ): void {
                $task->project_id = $project->id;
                $task->assigned_to = $assigneeIds[0];
                $task->title = $validated['title'];
                $task->description =
                    $validated['description'] ?? null;
                $task->deadline =
                    $validated['deadline'] ?? null;
                $task->priority = $validated['priority'];
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

        $task->refresh();

        $task->load([
            'project',
            'assignedEmployee',
            'assignees',
            'creator',
        ]);

        return response()->json([
            'message' => 'Task updated successfully.',

            'task' => new TaskResource($task),
        ]);
    }

    /**
     * Update task status only.
     */
    public function updateStatus(
        Request $request,
        Task $task
    ): JsonResponse {
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
            return response()->json([
                'message' => 'Invalid task status.',

                'errors' => [
                    'status' => [
                        'Invalid task status.',
                    ],
                ],
            ], 422);
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

        $task->refresh();

        $task->load([
            'project',
            'assignedEmployee',
            'assignees',
            'creator',
        ]);

        return response()->json([
            'message' => 'Task status updated successfully.',

            'task' => new TaskResource($task),
        ]);
    }

    /**
     * Delete a task.
     */
    public function destroy(
        Task $task
    ): JsonResponse {
        DB::transaction(
            function () use ($task): void {
                $task->assignees()->detach();
                $task->delete();
            }
        );

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
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
     * Get valid employee IDs belonging to the project.
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