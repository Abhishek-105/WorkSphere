<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class DailyUpdateController extends Controller
{
    /**
     * Employee daily update history.
     */
    public function index(): View
    {
        $employeeId = Auth::id();

        $updates = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->with([
                'project',
                'task',
                'reviewer',
                'blockerAcknowledgedBy',
            ])
            ->latest('update_date')
            ->latest('created_at')
            ->paginate(15);

        $today = now()->toDateString();

        $todayUpdate = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->whereDate('update_date', $today)
            ->with([
                'project',
                'task',
                'reviewer',
                'blockerAcknowledgedBy',
            ])
            ->latest('created_at')
            ->first();

        $totalUpdates = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->count();

        $pendingReviews = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->where('status', 'pending')
            ->count();

        $reviewedUpdates = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->where('status', 'reviewed')
            ->count();

        $activeBlockers = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->whereNotNull('blocker_details')
            ->where(function ($query): void {
                $query->whereNull('blocker_acknowledged_at');
            })
            ->count();

        return view('employee.daily-updates.index', [
            'updates' => $updates,
            'todayUpdate' => $todayUpdate,
            'totalUpdates' => $totalUpdates,
            'pendingReviews' => $pendingReviews,
            'reviewedUpdates' => $reviewedUpdates,
            'activeBlockers' => $activeBlockers,
        ]);
    }

    /**
     * Show daily update submission form.
     */
    public function create(): View
    {
        $employeeId = Auth::id();

        $projects = Project::query()
            ->where('status', '!=', 'completed')
            ->whereHas('employees', function ($query) use ($employeeId): void {
                $query->where('users.id', $employeeId);
            })
            ->with([
                'tasks' => function ($query) use ($employeeId): void {
                    $query
                        ->where('status', '!=', 'completed')
                        ->whereHas('assignees', function ($assigneeQuery) use ($employeeId): void {
                            $assigneeQuery->where('users.id', $employeeId);
                        })
                        ->orderBy('title');
                },
            ])
            ->orderBy('title')
            ->get();

        return view('employee.daily-updates.create', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store today's daily update.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_id' => [
                'required',
                'integer',
                'exists:projects,id',
            ],
            'task_id' => [
                'nullable',
                'integer',
                'exists:tasks,id',
            ],
            'update_date' => [
                'required',
                'date',
            ],
            'work_description' => [
                'required',
                'string',
                'max:5000',
            ],
            'hours_spent' => [
                'required',
                'numeric',
                'min:0',
                'max:24',
            ],
            'blocker_details' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'plans_for_tomorrow' => [
                'nullable',
                'string',
                'max:5000',
            ],
            'attached_file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,xlsx,png,jpg,jpeg,zip,txt',
            ],
        ]);

        $employeeId = Auth::id();

        $project = Project::query()
            ->whereKey((int) $validated['project_id'])
            ->where('status', '!=', 'completed')
            ->whereHas('employees', function ($query) use ($employeeId): void {
                $query->where('users.id', $employeeId);
            })
            ->first();

        if (!$project) {
            return back()
                ->withInput()
                ->with(
                    'error',
                    'You are not assigned to this project.'
                );
        }

        $task = null;

        if (!empty($validated['task_id'])) {
            $task = Task::query()
                ->whereKey((int) $validated['task_id'])
                ->where('project_id', $project->id)
                ->whereHas('assignees', function ($query) use ($employeeId): void {
                    $query->where('users.id', $employeeId);
                })
                ->first();

            if (!$task) {
                return back()
                    ->withInput()
                    ->with(
                        'error',
                        'The selected task is not assigned to you or does not belong to this project.'
                    );
            }
        }

        $duplicateExists = DailyUpdate::query()
            ->where('employee_id', $employeeId)
            ->where('project_id', $project->id)
            ->whereDate(
                'update_date',
                $validated['update_date']
            )
            ->exists();

        if ($duplicateExists) {
            return back()
                ->withInput()
                ->with(
                    'error',
                    'You have already submitted a daily update for this project on this date.'
                );
        }

        $filePath = null;

        if ($request->hasFile('attached_file')) {
            $filePath = $request
                ->file('attached_file')
                ->store(
                    'daily-updates/' . $employeeId,
                    'public'
                );
        }

        DailyUpdate::create([
            'employee_id' => $employeeId,
            'project_id' => $project->id,
            'task_id' => $task?->id,
            'update_date' => $validated['update_date'],
            'work_description' => $validated['work_description'],
            'hours_spent' => $validated['hours_spent'],
            'status' => 'pending',
            'attached_file' => $filePath,
            'blocker_details' => $validated['blocker_details'] ?? null,
            'plans_for_tomorrow' => $validated['plans_for_tomorrow'] ?? null,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'blocker_acknowledged_by' => null,
            'blocker_acknowledged_at' => null,
            'manager_comment' => null,
        ]);

        return redirect()
            ->route('employee.daily-updates.index')
            ->with(
                'success',
                'Daily update submitted successfully and is pending manager review.'
            );
    }
}