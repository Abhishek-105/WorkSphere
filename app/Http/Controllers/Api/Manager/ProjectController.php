<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\DailyUpdateResource;
use App\Http\Resources\ProjectFileResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::query()
            ->with('creator')
            ->withCount([
                'employees',
                'tasks',
                'files',
                'dailyUpdates',
            ]);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($q) use ($search): void {
                $q->where(
                    'title',
                    'like',
                    '%' . $search . '%'
                )->orWhere(
                    'description',
                    'like',
                    '%' . $search . '%'
                );
            });
        }

        if ($request->filled('status')) {
            $status = (string) $request->input('status');

            if (
                in_array(
                    $status,
                    [
                        'pending',
                        'in_progress',
                        'completed',
                    ],
                    true
                )
            ) {
                $query->where('status', $status);
            }
        }

        $projects = $query
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString();

        $statisticsQuery = Project::query();

        $statistics = [
            'total' => (clone $statisticsQuery)->count(),

            'pending' => (clone $statisticsQuery)
                ->where('status', 'pending')
                ->count(),

            'in_progress' => (clone $statisticsQuery)
                ->where('status', 'in_progress')
                ->count(),

            'completed' => (clone $statisticsQuery)
                ->where('status', 'completed')
                ->count(),
        ];

        return response()->json([
            'message' =>
                'Projects retrieved successfully.',

            'statistics' => $statistics,

            'projects' =>
                ProjectResource::collection($projects),
        ]);
    }

    public function show(Project $project): JsonResponse
    {
        $project->load([
            'creator',
            'employees',
            'files.uploader',
            'tasks.project',
            'tasks.assignedEmployee',
            'tasks.assignees',
            'tasks.creator',
            'dailyUpdates.employee',
            'dailyUpdates.project',
        ]);

        $tasks = $project->tasks;

        $totalTasks = $tasks->count();

        $completedTasks = $tasks
            ->filter(function ($task): bool {
                return $this->normalizeTaskStatus(
                    $task->status
                ) === 'completed';
            })
            ->count();

        $inProgressTasks = $tasks
            ->filter(function ($task): bool {
                return $this->normalizeTaskStatus(
                    $task->status
                ) === 'in_progress';
            })
            ->count();

        $pendingTasks = $tasks
            ->filter(function ($task): bool {
                return $this->normalizeTaskStatus(
                    $task->status
                ) === 'pending';
            })
            ->count();

        $overdueTasks = $tasks
            ->filter(function ($task): bool {
                if (!$task->deadline) {
                    return false;
                }

                return $task->deadline->isPast()
                    && $this->normalizeTaskStatus(
                        $task->status
                    ) !== 'completed';
            })
            ->count();

        $taskCompletionPercentage = $totalTasks > 0
            ? (int) round(
                ($completedTasks / $totalTasks) * 100
            )
            : 0;

        $recentTasks = $tasks
            ->sortByDesc(function ($task): int {
                return $task->created_at?->timestamp ?? 0;
            })
            ->take(8)
            ->values();

        $recentUpdates = $project->dailyUpdates
            ->sortByDesc(function ($update): int {
                return $update->created_at?->timestamp ?? 0;
            })
            ->take(8)
            ->values();

        return response()->json([
            'message' =>
                'Project retrieved successfully.',

            'project' =>
                new ProjectResource($project),

            'statistics' => [
                'total_tasks' => $totalTasks,

                'completed_tasks' =>
                    $completedTasks,

                'in_progress_tasks' =>
                    $inProgressTasks,

                'pending_tasks' =>
                    $pendingTasks,

                'overdue_tasks' =>
                    $overdueTasks,

                'task_completion_percentage' =>
                    $taskCompletionPercentage,

                'team_count' =>
                    $project->employees->count(),

                'file_count' =>
                    $project->files->count(),

                'update_count' =>
                    $project->dailyUpdates->count(),
            ],

            'recent_tasks' =>
                TaskResource::collection($recentTasks),

            'recent_updates' =>
                DailyUpdateResource::collection(
                    $recentUpdates
                ),

            'active_team_members' =>
                UserResource::collection(
                    $project->employees
                ),
        ]);
    }

    public function employees(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'employee')
            ->orderBy('name');

        if ($request->filled('project_id')) {
            $projectId = (int) $request->input(
                'project_id'
            );

            $query->whereHas(
                'projects',
                function ($projectQuery) use (
                    $projectId
                ): void {
                    $projectQuery->where(
                        'projects.id',
                        $projectId
                    );
                }
            );
        }

        $employees = $query->get([
            'id',
            'name',
            'email',
        ]);

        return response()->json([
            'message' =>
                'Employees retrieved successfully.',

            'employees' =>
                UserResource::collection($employees),
        ]);
    }

    public function store(
        StoreProjectRequest $request
    ): JsonResponse {
        $validated = $request->validated();

        $project = DB::transaction(
            function () use ($validated): Project {
                $project = Project::create([
                    'title' =>
                        $validated['title'],

                    'description' =>
                        $validated['description'] ?? null,

                    'start_date' =>
                        $validated['start_date'],

                    'end_date' =>
                        $validated['end_date'] ?? null,

                    'status' =>
                        $validated['status'],

                    'created_by' =>
                        Auth::id(),
                ]);

                $employeeIds =
                    $this->getValidEmployeeIds(
                        $validated['employees'] ?? []
                    );

                $project->employees()->sync(
                    $employeeIds
                );

                return $project;
            }
        );

        $project->load([
            'creator',
            'employees',
        ]);

        return response()->json([
            'message' =>
                'Project created successfully.',

            'project' =>
                new ProjectResource($project),
        ], 201);
    }

    public function update(
        UpdateProjectRequest $request,
        Project $project
    ): JsonResponse {
        $validated = $request->validated();

        DB::transaction(
            function () use (
                $validated,
                $project
            ): void {
                $project->update([
                    'title' =>
                        $validated['title'],

                    'description' =>
                        $validated['description'] ?? null,

                    'start_date' =>
                        $validated['start_date'],

                    'end_date' =>
                        $validated['end_date'] ?? null,

                    'status' =>
                        $validated['status'],
                ]);

                $employeeIds =
                    $this->getValidEmployeeIds(
                        $validated['employees'] ?? []
                    );

                $project->employees()->sync(
                    $employeeIds
                );
            }
        );

        $project->load([
            'creator',
            'employees',
        ]);

        return response()->json([
            'message' =>
                'Project updated successfully.',

            'project' =>
                new ProjectResource($project),
        ]);
    }

    public function destroy(
        Project $project
    ): JsonResponse {
        DB::transaction(
            function () use ($project): void {
                $project->load('files');

                foreach (
                    $project->files as $file
                ) {
                    if (
                        $file->file_path
                        && Storage::disk('public')->exists(
                            $file->file_path
                        )
                    ) {
                        Storage::disk('public')->delete(
                            $file->file_path
                        );
                    }
                }

                $project->employees()->detach();

                $project->delete();
            }
        );

        return response()->json([
            'message' =>
                'Project deleted successfully.',
        ]);
    }

    public function assignEmployees(
        Request $request,
        Project $project
    ): JsonResponse {
        $validated = $request->validate([
            'employees' => [
                'nullable',
                'array',
            ],

            'employees.*' => [
                'integer',
                'exists:users,id',
            ],
        ]);

        $employeeIds =
            $this->getValidEmployeeIds(
                $validated['employees'] ?? []
            );

        $project->employees()->sync(
            $employeeIds
        );

        $project->load('employees');

        return response()->json([
            'message' =>
                'Project team updated successfully.',

            'employees' =>
                UserResource::collection(
                    $project->employees
                ),
        ]);
    }

    public function uploadFile(
        Request $request,
        Project $project
    ): JsonResponse {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,xls,xlsx,csv,png,jpg,jpeg,zip,txt',
            ],
        ]);

        $uploadedFile = $validated['file'];

        $path = $uploadedFile->store(
            'projects/' . $project->id,
            'public'
        );

        $file = ProjectFile::create([
            'project_id' =>
                $project->id,

            'uploaded_by' =>
                Auth::id(),

            'file_name' =>
                $uploadedFile->getClientOriginalName(),

            'file_path' =>
                $path,

            'file_type' =>
                $uploadedFile->getClientMimeType(),

            'uploaded_at' =>
                now(),
        ]);

        $file->load('uploader');

        return response()->json([
            'message' =>
                'Project file uploaded successfully.',

            'file' =>
                new ProjectFileResource($file),
        ], 201);
    }

    public function downloadFile(
        Project $project,
        ProjectFile $file
    ) {
        abort_unless(
            (int) $file->project_id ===
                (int) $project->id,
            404
        );

        abort_unless(
            Storage::disk('public')->exists(
                $file->file_path
            ),
            404
        );

        return response()->download(
            storage_path(
                'app/public/' . $file->file_path
            ),
            $file->file_name
        );
    }

    public function deleteFile(
        Project $project,
        ProjectFile $file
    ): JsonResponse {
        abort_unless(
            (int) $file->project_id ===
                (int) $project->id,
            404
        );

        if (
            $file->file_path
            && Storage::disk('public')->exists(
                $file->file_path
            )
        ) {
            Storage::disk('public')->delete(
                $file->file_path
            );
        }

        $file->delete();

        return response()->json([
            'message' =>
                'Project file deleted successfully.',
        ]);
    }

    private function getValidEmployeeIds(
        array $employeeIds
    ): array {
        if (empty($employeeIds)) {
            return [];
        }

        return User::query()
            ->where('role', 'employee')
            ->whereIn('id', $employeeIds)
            ->pluck('id')
            ->map(
                fn ($id): int => (int) $id
            )
            ->unique()
            ->values()
            ->toArray();
    }

    private function normalizeTaskStatus(
        ?string $status
    ): string {
        $status = strtolower(
            trim((string) $status)
        );

        return match ($status) {
            'in progress',
            'in_progress' =>
                'in_progress',

            'done',
            'completed' =>
                'completed',

            default =>
                'pending',
        };
    }
}