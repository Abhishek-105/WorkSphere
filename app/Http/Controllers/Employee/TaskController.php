<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class TaskController extends Controller
{
    /**
     * Display employee's assigned tasks.
     */
    public function index(Request $request): View
    {
        $user = Auth::user();

        $query = Task::query()
            ->with([
                'project',
                'assignee',
            ])
            ->where('assigned_to', $user->id);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search): void {
                $query
                    ->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
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
            ->paginate(10)
            ->withQueryString();

        $employeeTasks = Task::query()
            ->where('assigned_to', $user->id)
            ->get([
                'id',
                'status',
            ]);

        $counts = [
            'all' => $employeeTasks->count(),

            'pending' => $employeeTasks
                ->filter(function (Task $task): bool {
                    return $this->normalizeStatus($task->status) === 'pending';
                })
                ->count(),

            'in_progress' => $employeeTasks
                ->filter(function (Task $task): bool {
                    return $this->normalizeStatus($task->status) === 'in_progress';
                })
                ->count(),

            'done' => $employeeTasks
                ->filter(function (Task $task): bool {
                    return $this->normalizeStatus($task->status) === 'completed';
                })
                ->count(),
        ];

        return view(
            'employee.tasks.index',
            compact(
                'tasks',
                'counts'
            )
        );
    }

    /**
     * Display task details.
     */
    public function show(Task $task): View
    {
        $this->authorizeTask($task);

        $task->load([
            'project',
            'assignee',
        ]);

        return view(
            'employee.tasks.show',
            compact('task')
        );
    }

    /**
     * Update employee task status.
     */
    public function updateStatus(
        Request $request,
        Task $task
    ): RedirectResponse {
        $this->authorizeTask($task);

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
                'status' => 'Invalid task status.',
            ]);
        }

        $oldStatus = $this->normalizeStatus(
            $task->status
        );

        $task->status = $newStatus;

        $this->applyStatusTimestamps(
            $task,
            $oldStatus,
            $newStatus
        );

        $task->save();

        return back()->with(
            'success',
            'Task status updated successfully.'
        );
    }

    /**
     * Ensure employee can only access assigned tasks.
     */
    private function authorizeTask(Task $task): void
    {
        if ((int) $task->assigned_to !== (int) Auth::id()) {
            abort(403);
        }
    }

    /**
     * Normalize all supported task status values.
     */
    private function normalizeStatus(?string $status): string
    {
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

            if (
                $oldStatus !== 'completed'
                || $task->completed_at === null
            ) {
                $task->completed_at = Carbon::now();
            }
        }
    }
}
