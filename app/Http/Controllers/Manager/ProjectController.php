<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Models\ProjectFile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class ProjectController extends Controller
{
    public function index(Request $request): View
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
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('status')) {
            $status = (string) $request->input('status');

            if (in_array($status, ['active', 'completed', 'on-hold'], true)) {
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

            'active' => (clone $statisticsQuery)
                ->where('status', 'active')
                ->count(),

            'completed' => (clone $statisticsQuery)
                ->where('status', 'completed')
                ->count(),

            'on_hold' => (clone $statisticsQuery)
                ->where('status', 'on-hold')
                ->count(),
        ];

        return view(
            'manager.projects.index',
            compact('projects', 'statistics')
        );
    }

    public function create(): View
    {
        $employees = User::query()
            ->where('role', 'employee')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
            ]);

        return view(
            'manager.projects.create',
            compact('employees')
        );
    }

    public function store(
        StoreProjectRequest $request
    ): RedirectResponse {
        $validated = $request->validated();

        $project = DB::transaction(function () use ($validated): Project {
            $project = Project::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? null,

                /*
                 * Every newly created project starts as Active.
                 * A project can be marked Completed later from Edit.
                 */
                'status' => 'active',

                'created_by' => Auth::id(),
            ]);

            $employeeIds = $this->getValidEmployeeIds(
                $validated['employees'] ?? []
            );

            $project->employees()->sync($employeeIds);

            return $project;
        });

        return redirect()
            ->route('manager.projects.show', $project)
            ->with(
                'success',
                'Project created successfully.'
            );
    }

    public function show(Project $project): View
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
                return $this->normalizeTaskStatus($task->status) === 'completed';
            })
            ->count();

        $inProgressTasks = $tasks
            ->filter(function ($task): bool {
                return $this->normalizeTaskStatus($task->status) === 'in_progress';
            })
            ->count();

        $pendingTasks = $tasks
            ->filter(function ($task): bool {
                return $this->normalizeTaskStatus($task->status) === 'pending';
            })
            ->count();

        $overdueTasks = $tasks
            ->filter(function ($task): bool {
                if (!$task->deadline) {
                    return false;
                }

                return $task->deadline->isPast()
                    && $this->normalizeTaskStatus($task->status) !== 'completed';
            })
            ->count();

        $taskCompletionPercentage = $totalTasks > 0
            ? (int) round(($completedTasks / $totalTasks) * 100)
            : 0;

        $teamCount = $project->employees->count();
        $fileCount = $project->files->count();
        $updateCount = $project->dailyUpdates->count();

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

        $activeTeamMembers = $project->employees->values();

        return view(
            'manager.projects.show',
            compact(
                'project',
                'totalTasks',
                'completedTasks',
                'inProgressTasks',
                'pendingTasks',
                'overdueTasks',
                'taskCompletionPercentage',
                'teamCount',
                'fileCount',
                'updateCount',
                'recentTasks',
                'recentUpdates',
                'activeTeamMembers'
            )
        );
    }

    public function edit(Project $project): View
    {
        $employees = User::query()
            ->where('role', 'employee')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
            ]);

        $project->load('employees');

        $assignedEmployeeIds = $project->employees
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->values()
            ->toArray();

        return view(
            'manager.projects.edit',
            compact(
                'project',
                'employees',
                'assignedEmployeeIds'
            )
        );
    }

    public function update(
        UpdateProjectRequest $request,
        Project $project
    ): RedirectResponse {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $project): void {
            $project->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? null,
                'status' => $validated['status'],
            ]);

            $employeeIds = $this->getValidEmployeeIds(
                $validated['employees'] ?? []
            );

            $project->employees()->sync($employeeIds);
        });

        return redirect()
            ->route('manager.projects.show', $project)
            ->with(
                'success',
                'Project updated successfully.'
            );
    }

    public function destroy(Project $project): RedirectResponse
    {
        DB::transaction(function () use ($project): void {
            foreach ($project->files as $file) {
                if (
                    $file->file_path
                    && Storage::disk('public')->exists($file->file_path)
                ) {
                    Storage::disk('public')->delete($file->file_path);
                }
            }

            $project->employees()->detach();

            $project->delete();
        });

        return redirect()
            ->route('manager.projects.index')
            ->with(
                'success',
                'Project deleted successfully.'
            );
    }

    public function assignEmployees(
        Request $request,
        Project $project
    ): RedirectResponse {
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

        $employeeIds = $this->getValidEmployeeIds(
            $validated['employees'] ?? []
        );

        $project->employees()->sync($employeeIds);

        return back()->with(
            'success',
            'Project team updated successfully.'
        );
    }

    public function uploadFile(
        Request $request,
        Project $project
    ): RedirectResponse {
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

        ProjectFile::create([
            'project_id' => $project->id,
            'uploaded_by' => Auth::id(),
            'file_name' => $uploadedFile->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $uploadedFile->getClientMimeType(),
            'uploaded_at' => now(),
        ]);

        return back()->with(
            'success',
            'Project file uploaded successfully.'
        );
    }

    public function downloadFile(
        Project $project,
        ProjectFile $file
    ) {
        abort_unless(
            (int) $file->project_id === (int) $project->id,
            404
        );

        abort_unless(
            Storage::disk('public')->exists($file->file_path),
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
    ): RedirectResponse {
        abort_unless(
            (int) $file->project_id === (int) $project->id,
            404
        );

        if (
            $file->file_path
            && Storage::disk('public')->exists($file->file_path)
        ) {
            Storage::disk('public')->delete($file->file_path);
        }

        $file->delete();

        return back()->with(
            'success',
            'Project file deleted successfully.'
        );
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
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->toArray();
    }

    private function normalizeTaskStatus(
        ?string $status
    ): string {
        $status = strtolower(trim((string) $status));

        return match ($status) {
            'in progress',
            'in_progress' => 'in_progress',

            'done',
            'completed' => 'completed',

            default => 'pending',
        };
    }
}