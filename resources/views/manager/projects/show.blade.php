<x-app-layout>
    <div class="nexra-page">

        {{-- Header --}}
        <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <div class="mb-2 flex items-center gap-2 text-sm text-slate-500">
                    <a href="{{ route('manager.projects.index') }}" class="transition hover:text-slate-900">
                        Projects
                    </a>

                    <span>/</span>

                    <span class="text-slate-700">
                        {{ $project->title }}
                    </span>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                    <h1 class="text-2xl font-bold tracking-tight text-slate-900">
                        {{ $project->title }}
                    </h1>

                    @php
                        $projectStatus = strtolower(trim((string) $project->status));
                    @endphp

                    @if ($projectStatus === 'completed')
                        <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Completed
                        </span>
                    @elseif ($projectStatus === 'on-hold')
                        <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            On Hold
                        </span>
                    @else
                        <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            Active
                        </span>
                    @endif
                </div>

                @if ($project->description)
                    <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {{ $project->description }}
                    </p>
                @endif
            </div>

            <div class="flex flex-wrap gap-2">
                <a
                    href="{{ route('manager.projects.edit', $project) }}"
                    class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    Edit Project
                </a>

                <a
                    href="{{ route('manager.tasks.create', ['project_id' => $project->id]) }}"
                    class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                    + Add Task
                </a>
            </div>
        </div>

        {{-- Command Navigation --}}
        <div class="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <div class="flex min-w-max items-center">
                <a
                    href="#overview"
                    class="border-b-2 border-slate-900 px-5 py-4 text-sm font-semibold text-slate-900"
                >
                    Overview
                </a>

                <a
                    href="#tasks"
                    class="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                    Tasks
                </a>

                <a
                    href="#team"
                    class="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                    Team
                </a>

                <a
                    href="#files"
                    class="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                    Files
                </a>

                <a
                    href="#updates"
                    class="border-b-2 border-transparent px-5 py-4 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                >
                    Daily Updates
                </a>
            </div>
        </div>

        {{-- Overview --}}
        <section id="overview" class="scroll-mt-6">

            {{-- Statistics --}}
            <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-slate-500">
                            Total Tasks
                        </span>

                        <span class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            TASKS
                        </span>
                    </div>

                    <div class="mt-3 text-3xl font-bold text-slate-900">
                        {{ $totalTasks ?? 0 }}
                    </div>

                    <p class="mt-1 text-xs text-slate-500">
                        Tasks in this project
                    </p>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-slate-500">
                            Pending
                        </span>

                        <span class="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                            PENDING
                        </span>
                    </div>

                    <div class="mt-3 text-3xl font-bold text-slate-900">
                        {{ $pendingTasks ?? 0 }}
                    </div>

                    <p class="mt-1 text-xs text-slate-500">
                        Waiting to start
                    </p>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-slate-500">
                            In Progress
                        </span>

                        <span class="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                            ACTIVE
                        </span>
                    </div>

                    <div class="mt-3 text-3xl font-bold text-slate-900">
                        {{ $inProgressTasks ?? 0 }}
                    </div>

                    <p class="mt-1 text-xs text-slate-500">
                        Currently being worked on
                    </p>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-slate-500">
                            Completed
                        </span>

                        <span class="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            DONE
                        </span>
                    </div>

                    <div class="mt-3 text-3xl font-bold text-slate-900">
                        {{ $completedTasks ?? 0 }}
                    </div>

                    <p class="mt-1 text-xs text-slate-500">
                        Finished tasks
                    </p>
                </div>

            </div>

            {{-- Progress + Timeline --}}
            <div class="mt-6 grid gap-6 lg:grid-cols-3">

                <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-base font-bold text-slate-900">
                                Task Progress
                            </h2>

                            <p class="mt-1 text-sm text-slate-500">
                                Completion across all project tasks
                            </p>
                        </div>

                        <div class="text-2xl font-bold text-slate-900">
                            {{ $taskCompletionPercentage ?? 0 }}%
                        </div>
                    </div>

                    <div class="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            class="h-full rounded-full bg-slate-900 transition-all duration-500"
                            style="width: <?php echo isset($taskCompletionPercentage) ? $taskCompletionPercentage : 0; ?>%;"
                        ></div>
                    </div>

                    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <span>
                            {{ $completedTasks ?? 0 }} of {{ $totalTasks ?? 0 }} tasks completed
                        </span>

                        @if (($overdueTasks ?? 0) > 0)
                            <span class="font-semibold text-red-600">
                                {{ $overdueTasks }} overdue
                            </span>
                        @else
                            <span class="font-semibold text-emerald-600">
                                No overdue tasks
                            </span>
                        @endif
                    </div>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 class="text-base font-bold text-slate-900">
                        Project Timeline
                    </h2>

                    <div class="mt-5 space-y-4">

                        <div>
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Start Date
                            </p>

                            <p class="mt-1 text-sm font-semibold text-slate-800">
                                {{ $project->start_date ? $project->start_date->format('d M Y') : 'Not set' }}
                            </p>
                        </div>

                        <div>
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                                End Date
                            </p>

                            <p class="mt-1 text-sm font-semibold text-slate-800">
                                {{ $project->end_date ? $project->end_date->format('d M Y') : 'Not set' }}
                            </p>
                        </div>

                        <div>
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Created By
                            </p>

                            <p class="mt-1 text-sm font-semibold text-slate-800">
                                {{ $project->creator?->name ?? 'Unknown' }}
                            </p>
                        </div>

                    </div>
                </div>

            </div>

            {{-- Project Summary --}}
            <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Team Members
                    </p>

                    <p class="mt-2 text-2xl font-bold text-slate-900">
                        {{ $teamCount ?? 0 }}
                    </p>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Files
                    </p>

                    <p class="mt-2 text-2xl font-bold text-slate-900">
                        {{ $fileCount ?? 0 }}
                    </p>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Daily Updates
                    </p>

                    <p class="mt-2 text-2xl font-bold text-slate-900">
                        {{ $updateCount ?? 0 }}
                    </p>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Overdue
                    </p>

                    <p class="mt-2 text-2xl font-bold text-red-600">
                        {{ $overdueTasks ?? 0 }}
                    </p>
                </div>

            </div>

        </section>

        {{-- Tasks --}}
        <section id="tasks" class="mt-8 scroll-mt-6">

            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">
                        Project Tasks
                    </h2>

                    <p class="mt-1 text-sm text-slate-500">
                        Tasks assigned to this project team.
                    </p>
                </div>

                <a
                    href="{{ route('manager.tasks.create', ['project_id' => $project->id]) }}"
                    class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    + Add Task
                </a>
            </div>

            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                @if ($project->tasks && $project->tasks->count())

                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Task
                                    </th>

                                    <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Assignment
                                    </th>

                                    <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Priority
                                    </th>

                                    <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Deadline
                                    </th>

                                    <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-100">

                                @foreach ($project->tasks as $task)

                                    @php
                                        $taskStatus = strtolower(trim((string) $task->status));
                                    @endphp

                                    <tr class="transition hover:bg-slate-50">

                                        <td class="px-5 py-4">
                                            <div>
                                                <a
                                                    href="{{ route('manager.tasks.show', $task) }}"
                                                    class="text-sm font-semibold text-slate-900 hover:text-blue-600"
                                                >
                                                    {{ $task->title }}
                                                </a>

                                                @if ($task->description)
                                                    <p class="mt-1 max-w-md truncate text-xs text-slate-500">
                                                        {{ $task->description }}
                                                    </p>
                                                @endif
                                            </div>
                                        </td>

                                        <td class="px-5 py-4">
                                            <div class="text-sm text-slate-700">
                                                @if ($task->assignees && $task->assignees->count())
                                                    {{ $task->assignees->pluck('name')->join(', ') }}
                                                @elseif ($task->assignedEmployee)
                                                    {{ $task->assignedEmployee->name }}
                                                @else
                                                    <span class="text-slate-400">
                                                        Unassigned
                                                    </span>
                                                @endif
                                            </div>
                                        </td>

                                        <td class="px-5 py-4">
                                            @php
                                                $priority = strtolower(trim((string) $task->priority));
                                            @endphp

                                            @if ($priority === 'high')
                                                <span class="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                    High
                                                </span>
                                            @elseif ($priority === 'low')
                                                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                    Low
                                                </span>
                                            @else
                                                <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    Medium
                                                </span>
                                            @endif
                                        </td>

                                        <td class="px-5 py-4">

                                            @if ($taskStatus === 'completed' || $taskStatus === 'done')
                                                <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    Completed
                                                </span>
                                            @elseif ($taskStatus === 'in_progress' || $taskStatus === 'in progress')
                                                <span class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                    In Progress
                                                </span>
                                            @else
                                                <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    Pending
                                                </span>
                                            @endif

                                        </td>

                                        <td class="px-5 py-4">
                                            @if ($task->deadline)
                                                <span class="text-sm text-slate-700">
                                                    {{ $task->deadline->format('d M Y') }}
                                                </span>
                                            @else
                                                <span class="text-sm text-slate-400">
                                                    No deadline
                                                </span>
                                            @endif
                                        </td>

                                        <td class="px-5 py-4 text-right">
                                            <a
                                                href="{{ route('manager.tasks.show', $task) }}"
                                                class="text-sm font-semibold text-slate-700 hover:text-blue-600"
                                            >
                                                View
                                            </a>
                                        </td>

                                    </tr>

                                @endforeach

                            </tbody>
                        </table>
                    </div>

                @else

                    <div class="px-6 py-12 text-center">
                        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            ✓
                        </div>

                        <h3 class="mt-4 text-sm font-bold text-slate-900">
                            No tasks yet
                        </h3>

                        <p class="mt-1 text-sm text-slate-500">
                            Create the first task for this project.
                        </p>

                        <a
                            href="{{ route('manager.tasks.create', ['project_id' => $project->id]) }}"
                            class="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Create Task
                        </a>
                    </div>

                @endif

            </div>

        </section>

        {{-- Team --}}
        <section id="team" class="mt-8 scroll-mt-6">

            <div class="mb-4">
                <h2 class="text-lg font-bold text-slate-900">
                    Project Team
                </h2>

                <p class="mt-1 text-sm text-slate-500">
                    Employees assigned to this project.
                </p>
            </div>

            <div class="rounded-xl border border-slate-200 bg-white shadow-sm">

                @if ($project->employees && $project->employees->count())

                    <div class="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">

                        @foreach ($project->employees as $employee)

                            <div class="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                                    {{ strtoupper(substr($employee->name, 0, 1)) }}
                                </div>

                                <div class="min-w-0">
                                    <p class="truncate text-sm font-semibold text-slate-900">
                                        {{ $employee->name }}
                                    </p>

                                    <p class="truncate text-xs text-slate-500">
                                        {{ $employee->email }}
                                    </p>
                                </div>
                            </div>

                        @endforeach

                    </div>

                @else

                    <div class="px-6 py-10 text-center">
                        <p class="text-sm font-medium text-slate-600">
                            No employees assigned to this project.
                        </p>

                        <a
                            href="{{ route('manager.projects.edit', $project) }}"
                            class="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Assign team members
                        </a>
                    </div>

                @endif

            </div>

        </section>

        {{-- Files --}}
        <section id="files" class="mt-8 scroll-mt-6">

            <div class="mb-4">
                <h2 class="text-lg font-bold text-slate-900">
                    Project Files
                </h2>

                <p class="mt-1 text-sm text-slate-500">
                    Documents and files uploaded for this project.
                </p>
            </div>

            <div class="rounded-xl border border-slate-200 bg-white shadow-sm">

                @if ($project->files && $project->files->count())

                    <div class="divide-y divide-slate-100">

                        @foreach ($project->files as $file)

                            <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                <div class="flex min-w-0 items-center gap-3">
                                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        FILE
                                    </div>

                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-slate-900">
                                            {{ $file->file_name ?? $file->name ?? 'Project File' }}
                                        </p>

                                        <p class="text-xs text-slate-500">
                                            Uploaded by {{ $file->uploader?->name ?? 'Unknown' }}
                                        </p>
                                    </div>
                                </div>

                                @if (isset($file->id))
                                    <a
                                        href="{{ route('manager.projects.files.download', [$project, $file]) }}"
                                        class="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Download
                                    </a>
                                @endif

                            </div>

                        @endforeach

                    </div>

                @else

                    <div class="px-6 py-10 text-center">
                        <p class="text-sm text-slate-500">
                            No files uploaded for this project.
                        </p>
                    </div>

                @endif

            </div>

        </section>

        {{-- Daily Updates --}}
        <section id="updates" class="mt-8 scroll-mt-6">

            <div class="mb-4">
                <h2 class="text-lg font-bold text-slate-900">
                    Daily Updates
                </h2>

                <p class="mt-1 text-sm text-slate-500">
                    Recent work updates submitted by the project team.
                </p>
            </div>

            <div class="rounded-xl border border-slate-200 bg-white shadow-sm">

                @if ($project->dailyUpdates && $project->dailyUpdates->count())

                    <div class="divide-y divide-slate-100">

                        @foreach ($project->dailyUpdates->take(10) as $update)

                            <div class="px-5 py-4">

                                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                                    <div>
                                        <p class="text-sm font-semibold text-slate-900">
                                            {{ $update->employee?->name ?? 'Unknown Employee' }}
                                        </p>

                                        <p class="mt-1 text-xs text-slate-500">
                                            {{ $update->date ? $update->date->format('d M Y') : ($update->created_at?->format('d M Y') ?? '') }}
                                        </p>
                                    </div>

                                    @if ($update->hours ?? false)
                                        <span class="text-xs font-semibold text-slate-600">
                                            {{ $update->hours }} hrs
                                        </span>
                                    @endif

                                </div>

                                @if ($update->description)
                                    <p class="mt-3 text-sm leading-6 text-slate-600">
                                        {{ $update->description }}
                                    </p>
                                @endif

                            </div>

                        @endforeach

                    </div>

                @else

                    <div class="px-6 py-10 text-center">
                        <p class="text-sm text-slate-500">
                            No daily updates have been submitted for this project yet.
                        </p>
                    </div>

                @endif

            </div>

        </section>

    </div>
</x-app-layout>