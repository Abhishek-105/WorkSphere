<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    /**
     * Display projects assigned to the authenticated employee.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = $user->projects()
            ->with(['creator'])
            ->withCount([
                'tasks',
                'tasks as my_tasks_count' => function ($q) use ($user) {
                    $q->where('assigned_to', $user->id);
                },
            ]);

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $projects = $query->latest()->paginate(12)->withQueryString();

        return view('employee.projects.index', compact('projects'));
    }

    /**
     * Display a single assigned project.
     */
    public function show($id)
    {
        $user = Auth::user();

        $project = $user->projects()
            ->with([
                'creator',
                'employees',
                'files.uploader',
                'tasks' => function ($query) use ($user) {
                    $query->where('assigned_to', $user->id)->latest();
                },
            ])
            ->findOrFail($id);

        return view('employee.projects.show', compact('project'));
    }
}