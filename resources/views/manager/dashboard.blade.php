<x-app-layout>
    <div class="min-h-screen bg-slate-50">
        <main class="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">


            {{-- =========================================================
             PAGE HEADER / HERO
        ========================================================== --}}
            <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-950 px-6 py-8 shadow-xl sm:px-8 lg:px-10">
                <div class="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
                <div class="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"></div>

                <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div class="max-w-3xl">
                        <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur-sm">
                            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                            Manager Workspace
                        </div>

                        <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Welcome back, {{ auth()->user()->name }} 👋
                        </h1>

                        <p class="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                            Monitor projects, track team productivity, manage tasks, and stay on top of today's work from one workspace.
                        </p>
                    </div>

                    <div class="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
                        <p class="text-xs font-medium uppercase tracking-wider text-indigo-200">
                            Today's Updates
                        </p>
                        <div class="mt-1 flex items-end gap-2">
                            <span class="text-3xl font-bold text-white">
                                {{ $todayUpdates }}
                            </span>
                            <span class="pb-1 text-sm text-indigo-200">
                                submitted
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {{-- =========================================================
             FLASH MESSAGES
        ========================================================== --}}
            @if (session('success'))
            <div class="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">
                <svg class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75" />
                    <circle cx="12" cy="12" r="9" />
                </svg>
                <span>{{ session('success') }}</span>
            </div>
            @endif

            @if (session('error'))
            <div class="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm">
                <svg class="mt-0.5 h-5 w-5 shrink-0 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01" />
                    <circle cx="12" cy="12" r="9" />
                </svg>
                <span>{{ session('error') }}</span>
            </div>
            @endif

            {{-- =========================================================
             KPI CARDS
        ========================================================== --}}
            <section class="mt-6">
                <div class="mb-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
                        Workspace Overview
                    </p>
                    <h2 class="mt-1 text-xl font-bold text-slate-900">
                        Performance at a glance
                    </h2>
                </div>

                <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {{-- Projects --}}
                    <a href="{{ route('manager.projects.index') }}"
                        class="group relative overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-500">Total Projects</p>
                                <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                    {{ $totalProjects }}
                                </p>
                                <p class="mt-2 text-xs font-medium text-indigo-600">
                                    {{ $activeProjects }} active
                                </p>
                            </div>

                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5h6l1.5 2.25h9v8.25A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7.5Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5V6A2.25 2.25 0 0 1 6 3.75h4.5l1.5 2.25H18A2.25 2.25 0 0 1 20.25 8.25v1.5" />
                                </svg>
                            </div>
                        </div>

                        <div class="mt-5 flex items-center justify-between text-xs">
                            <span class="font-medium text-slate-500">Open project workspace</span>
                            <svg class="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    </a>

                    {{-- Tasks --}}
                    <a href="{{ route('manager.tasks.index') }}"
                        class="group relative overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-500">Total Tasks</p>
                                <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                    {{ $totalTasks }}
                                </p>
                                <p class="mt-2 text-xs font-medium text-sky-600">
                                    {{ $inProgressTasks }} in progress
                                </p>
                            </div>

                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <rect x="4" y="3.75" width="16" height="16.5" rx="2.25" />
                                    <path stroke-linecap="round" d="M8 8h8M8 12h8M8 16h5" />
                                </svg>
                            </div>
                        </div>

                        <div class="mt-5 flex items-center justify-between text-xs">
                            <span class="font-medium text-slate-500">Manage all tasks</span>
                            <svg class="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    </a>

                    {{-- Team --}}
                    <a href="{{ route('manager.team.index') }}"
                        class="group relative overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-violet-500 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-500">Team Members</p>
                                <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                    {{ $totalEmployees }}
                                </p>
                                <p class="mt-2 text-xs font-medium text-violet-600">
                                    Employees
                                </p>
                            </div>

                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <circle cx="9" cy="8" r="3" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 19.25a5.25 5.25 0 0 1 10.5 0" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.5 5.5a3 3 0 0 1 0 5.75M16.5 14.25a4.75 4.75 0 0 1 3.75 4.75" />
                                </svg>
                            </div>
                        </div>

                        <div class="mt-5 flex items-center justify-between text-xs">
                            <span class="font-medium text-slate-500">View team workspace</span>
                            <svg class="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    </a>

                    {{-- Daily Updates --}}
                    <a href="{{ route('manager.daily-updates.index') }}"
                        class="group relative overflow-hidden rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-slate-500">Today's Updates</p>
                                <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                                    {{ $todayUpdates }}
                                </p>
                                <p class="mt-2 text-xs font-medium text-emerald-600">
                                    Team submissions
                                </p>
                            </div>

                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75h9A2.25 2.25 0 0 1 18.75 6v12A2.25 2.25 0 0 1 16.5 20.25h-9A2.25 2.25 0 0 1 5.25 18V6A2.25 2.25 0 0 1 7.5 3.75Z" />
                                    <path stroke-linecap="round" d="M8.5 8h7M8.5 12h7M8.5 16h4" />
                                </svg>
                            </div>
                        </div>

                        <div class="mt-5 flex items-center justify-between text-xs">
                            <span class="font-medium text-slate-500">Review daily work</span>
                            <svg class="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </div>
                    </a>
                </div>
            </section>

            {{-- =========================================================
             OPERATIONAL HEALTH
        ========================================================== --}}
            <section class="mt-6 grid gap-6 lg:grid-cols-3">

                {{-- Task Completion --}}
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                                Task Performance
                            </p>
                            <h2 class="mt-1 text-xl font-bold text-slate-900">
                                Completion overview
                            </h2>
                            <p class="mt-1 text-sm text-slate-500">
                                Current distribution of tasks across the workspace.
                            </p>
                        </div>

                        <div class="text-left sm:text-right">
                            <p class="text-3xl font-extrabold text-slate-900">
                                {{ $taskCompletionPercentage }}%
                            </p>
                            <p class="text-xs font-medium text-slate-500">
                                completed
                            </p>
                        </div>
                    </div>

                    <div class="mt-7">
                        <div class="h-3 overflow-hidden rounded-full bg-slate-100">

                            @php
                            $cWidth = $completionWidth ?? (($totalTasks ?? 0) > 0 ? round((($completedTasks ?? 0) / $totalTasks) * 100) : 0);
                            @endphp


                            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    class="bg-indigo-600 h-2.5 rounded-full"
                                    style="width: <?php echo isset($completionWidth) ? $completionWidth : 0; ?>%;"></div>
                            </div>




                        </div>
                        <div class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div class="rounded-xl bg-slate-50 p-4">
                                <div class="flex items-center gap-2">
                                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                    <span class="text-xs font-semibold text-slate-500">Completed</span>
                                </div>
                                <p class="mt-2 text-xl font-bold text-slate-900">{{ $completedTasks }}</p>
                            </div>

                            <div class="rounded-xl bg-slate-50 p-4">
                                <div class="flex items-center gap-2">
                                    <span class="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                                    <span class="text-xs font-semibold text-slate-500">In Progress</span>
                                </div>
                                <p class="mt-2 text-xl font-bold text-slate-900">{{ $inProgressTasks }}</p>
                            </div>

                            <div class="rounded-xl bg-slate-50 p-4">
                                <div class="flex items-center gap-2">
                                    <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                                    <span class="text-xs font-semibold text-slate-500">Pending</span>
                                </div>
                                <p class="mt-2 text-xl font-bold text-slate-900">{{ $pendingTasks }}</p>
                            </div>

                            <div class="rounded-xl bg-slate-50 p-4">
                                <div class="flex items-center gap-2">
                                    <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                                    <span class="text-xs font-semibold text-slate-500">Overdue</span>
                                </div>
                                <p class="mt-2 text-xl font-bold text-slate-900">{{ $overdueTasks }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Deadline Snapshot --}}
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">
                            Deadline Snapshot
                        </p>
                        <h2 class="mt-1 text-xl font-bold text-slate-900">
                            Work requiring attention
                        </h2>
                    </div>

                    <div class="mt-6 space-y-3">
                        <div class="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                            <div>
                                <p class="text-sm font-semibold text-slate-800">Overdue tasks</p>
                                <p class="text-xs text-slate-500">Past their deadline</p>
                            </div>
                            <span class="text-xl font-extrabold text-red-600">{{ $overdueTasks }}</span>
                        </div>

                        <div class="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                            <div>
                                <p class="text-sm font-semibold text-slate-800">Due today</p>
                                <p class="text-xs text-slate-500">Need attention today</p>
                            </div>
                            <span class="text-xl font-extrabold text-amber-600">{{ $tasksDueToday }}</span>
                        </div>

                        <div class="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
                            <div>
                                <p class="text-sm font-semibold text-slate-800">Due this week</p>
                                <p class="text-xs text-slate-500">Upcoming workload</p>
                            </div>
                            <span class="text-xl font-extrabold text-sky-600">{{ $tasksDueThisWeek }}</span>
                        </div>
                    </div>
                </div>
            </section>

            {{-- =========================================================
             RECENT PROJECTS + PROJECT HEALTH
        ========================================================== --}}
            <section class="mt-6 grid gap-6 xl:grid-cols-3">

                {{-- Recent Projects --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <div class="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                                Projects
                            </p>
                            <h2 class="mt-1 text-xl font-bold text-slate-900">
                                Recent projects
                            </h2>
                        </div>

                        <a href="{{ route('manager.projects.index') }}"
                            class="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800">
                            View all
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </a>
                    </div>

                    @if ($recentProjects->count())
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-slate-50">
                                <tr class="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <th class="px-6 py-3">Project</th>
                                    <th class="px-6 py-3">Created By</th>
                                    <th class="px-6 py-3">Status</th>
                                    <th class="px-6 py-3">Created</th>
                                </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-100">
                                @foreach ($recentProjects as $project)
                                @php
                                $projectStatus = strtolower((string) $project->status);

                                $projectStatusClasses = match ($projectStatus) {
                                'active' => 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
                                'completed', 'complete' => 'bg-sky-50 text-sky-700 ring-sky-600/20',
                                'pending' => 'bg-amber-50 text-amber-700 ring-amber-600/20',
                                default => 'bg-slate-100 text-slate-700 ring-slate-500/20',
                                };
                                @endphp

                                <tr class="transition hover:bg-slate-50">
                                    <td class="px-6 py-4">
                                        <div class="min-w-[220px]">
                                            <p class="font-semibold text-slate-900">
                                                {{ $project->title }}
                                            </p>

                                            @if ($project->description)
                                            <p class="mt-1 max-w-md truncate text-xs text-slate-500">
                                                {{ $project->description }}
                                            </p>
                                            @endif
                                        </div>
                                    </td>

                                    <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                        {{ optional($project->creator)->name ?? '—' }}
                                    </td>

                                    <td class="whitespace-nowrap px-6 py-4">
                                        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset {{ $projectStatusClasses }}">
                                            {{ ucfirst($project->status ?? 'Unknown') }}
                                        </span>
                                    </td>

                                    <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                        {{ optional($project->created_at)->format('d M Y') }}
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                    @else
                    <div class="px-6 py-12 text-center">
                        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5h6l1.5 2.25h9v8.25A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V7.5Z" />
                            </svg>
                        </div>
                        <p class="mt-4 font-semibold text-slate-800">No projects yet</p>
                        <p class="mt-1 text-sm text-slate-500">Create your first project to get started.</p>
                    </div>
                    @endif
                </div>

                {{-- Project Health --}}
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
                        Project Health
                    </p>
                    <h2 class="mt-1 text-xl font-bold text-slate-900">
                        Portfolio status
                    </h2>

                    @php
                    $projectHealthTotal = $totalProjects > 0 ? $totalProjects : 1;

                    $activeProjectPercentage = (int) round(($activeProjects / $projectHealthTotal) * 100);
                    $completedProjectPercentage = (int) round(($completedProjects / $projectHealthTotal) * 100);
                    $pendingProjectPercentage = (int) round(($pendingProjects / $projectHealthTotal) * 100);

                    $activeProjectPercentage = min(100, max(0, $activeProjectPercentage));
                    $completedProjectPercentage = min(100, max(0, $completedProjectPercentage));
                    $pendingProjectPercentage = min(100, max(0, $pendingProjectPercentage));
                    @endphp

                    <div class="mt-6 space-y-5">

                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-sm font-medium text-slate-600">Active</span>
                                <span class="text-sm font-bold text-slate-900">{{ $activeProjects }}</span>
                            </div>

                            <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    class="h-full rounded-full bg-emerald-500"
                                    style="width: <?php echo isset($activeProjectPercentage) ? $activeProjectPercentage : 0; ?>%;"></div>
                            </div>
                        </div>

                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-sm font-medium text-slate-600">Completed</span>
                                <span class="text-sm font-bold text-slate-900">{{ $completedProjects }}</span>
                            </div>

                            <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    class="h-full rounded-full bg-sky-500"
                                    style="width: <?php echo isset($completedProjectPercentage) ? $completedProjectPercentage : 0; ?>%;"></div>
                            </div>
                        </div>

                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-sm font-medium text-slate-600">Pending</span>
                                <span class="text-sm font-bold text-slate-900">{{ $pendingProjects }}</span>
                            </div>

                            <div class="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    class="h-full rounded-full bg-amber-500"
                                    style="width: <?php echo isset($pendingProjectPercentage) ? $pendingProjectPercentage : 0; ?>%;"></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-7 border-t border-slate-100 pt-5">
                        <a href="{{ route('manager.projects.index') }}"
                            class="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                            Manage Projects
                        </a>
                    </div>
                </div>
            </section>

            {{-- =========================================================
             RECENT TASKS + TEAM UPDATES
        ========================================================== --}}
            <section class="mt-6 grid gap-6 xl:grid-cols-2">

                {{-- Recent Tasks --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div class="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">
                                Tasks
                            </p>
                            <h2 class="mt-1 text-xl font-bold text-slate-900">
                                Recent tasks
                            </h2>
                        </div>

                        <a href="{{ route('manager.tasks.index') }}"
                            class="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-800">
                            View all
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </a>
                    </div>

                    @if ($recentTasks->count())
                    <div class="divide-y divide-slate-100">
                        @foreach ($recentTasks as $task)
                        @php
                        $taskStatus = strtolower((string) $task->status);

                        $taskStatusClasses = match ($taskStatus) {
                        'done', 'completed' => 'bg-emerald-50 text-emerald-700',
                        'in progress', 'in_progress' => 'bg-sky-50 text-sky-700',
                        'pending' => 'bg-amber-50 text-amber-700',
                        default => 'bg-slate-100 text-slate-700',
                        };

                        $taskPriority = strtolower((string) $task->priority);

                        $taskPriorityClasses = match ($taskPriority) {
                        'high', 'urgent' => 'text-red-600',
                        'medium' => 'text-amber-600',
                        'low' => 'text-emerald-600',
                        default => 'text-slate-500',
                        };
                        @endphp

                        <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div class="min-w-0">
                                <p class="truncate font-semibold text-slate-900">
                                    {{ $task->title }}
                                </p>

                                <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                    <span>{{ optional($task->project)->title ?? 'No project' }}</span>
                                    <span class="text-slate-300">•</span>
                                    <span>{{ optional($task->assignee)->name ?? 'Unassigned' }}</span>
                                </div>
                            </div>

                            <div class="flex shrink-0 items-center gap-3">
                                <span class="text-xs font-semibold {{ $taskPriorityClasses }}">
                                    {{ ucfirst($task->priority ?? 'Normal') }}
                                </span>

                                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold {{ $taskStatusClasses }}">
                                    {{ ucfirst($task->status ?? 'Unknown') }}
                                </span>
                            </div>
                        </div>
                        @endforeach
                    </div>
                    @else
                    <div class="px-6 py-12 text-center">
                        <p class="font-semibold text-slate-800">No tasks yet</p>
                        <p class="mt-1 text-sm text-slate-500">Tasks will appear here once created.</p>
                    </div>
                    @endif
                </div>

                {{-- Team Updates --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div class="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
                                Team Activity
                            </p>
                            <h2 class="mt-1 text-xl font-bold text-slate-900">
                                Recent work updates
                            </h2>
                        </div>

                        <a href="{{ route('manager.daily-updates.index') }}"
                            class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-800">
                            View all
                            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
                            </svg>
                        </a>
                    </div>

                    @if ($recentUpdates->count())
                    <div class="divide-y divide-slate-100">
                        @foreach ($recentUpdates as $update)
                        <div class="px-6 py-5">
                            <div class="flex items-start gap-3">
                                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                                    {{ strtoupper(substr(optional($update->employee)->name ?? 'U', 0, 1)) }}
                                </div>

                                <div class="min-w-0 flex-1">
                                    <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <p class="font-semibold text-slate-900">
                                            {{ optional($update->employee)->name ?? 'Unknown employee' }}
                                        </p>

                                        <span class="text-xs text-slate-400">
                                            {{ optional($update->update_date)->format('d M Y') }}
                                        </span>
                                    </div>

                                    <p class="mt-1 text-xs text-slate-500">
                                        {{ optional($update->project)->title ?? 'No project' }}
                                        @if ($update->task)
                                        <span class="mx-1 text-slate-300">•</span>
                                        {{ $update->task->title }}
                                        @endif
                                    </p>

                                    <p class="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
                                        {{ $update->work_description ?? 'No work description provided.' }}
                                    </p>

                                    @if ($update->hours_spent !== null)
                                    <div class="mt-3 inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                                        {{ $update->hours_spent }} hrs logged
                                    </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                    @else
                    <div class="px-6 py-12 text-center">
                        <p class="font-semibold text-slate-800">No updates yet</p>
                        <p class="mt-1 text-sm text-slate-500">Employee work updates will appear here.</p>
                    </div>
                    @endif
                </div>
            </section>

            {{-- =========================================================
             QUICK ACTIONS + RECENT EMPLOYEES
        ========================================================== --}}
            <section class="mt-6 grid gap-6 lg:grid-cols-3">

                {{-- Quick Actions --}}
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                            Quick Actions
                        </p>
                        <h2 class="mt-1 text-xl font-bold text-slate-900">
                            Move work forward
                        </h2>
                    </div>

                    <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <a href="{{ route('manager.projects.create') }}"
                            class="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path stroke-linecap="round" d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                            <p class="mt-3 text-sm font-bold text-slate-900">New Project</p>
                            <p class="mt-1 text-xs text-slate-500">Create a workspace</p>
                        </a>

                        <a href="{{ route('manager.tasks.create') }}"
                            class="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path stroke-linecap="round" d="M12 5v14M5 12h14" />
                                </svg>
                            </div>
                            <p class="mt-3 text-sm font-bold text-slate-900">New Task</p>
                            <p class="mt-1 text-xs text-slate-500">Assign team work</p>
                        </a>

                        <a href="{{ route('manager.team.create') }}"
                            class="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path stroke-linecap="round" d="M15 19a4 4 0 0 0-6 0M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z" />
                                </svg>
                            </div>
                            <p class="mt-3 text-sm font-bold text-slate-900">Add Employee</p>
                            <p class="mt-1 text-xs text-slate-500">Grow your team</p>
                        </a>

                        <a href="{{ route('manager.daily-updates.index') }}"
                            class="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50">
                            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75h9A2.25 2.25 0 0 1 18.75 6v12A2.25 2.25 0 0 1 16.5 20.25h-9A2.25 2.25 0 0 1 5.25 18V6A2.25 2.25 0 0 1 7.5 3.75Z" />
                                    <path stroke-linecap="round" d="M8.5 8h7M8.5 12h7M8.5 16h4" />
                                </svg>
                            </div>
                            <p class="mt-3 text-sm font-bold text-slate-900">Daily Updates</p>
                            <p class="mt-1 text-xs text-slate-500">Review team work</p>
                        </a>
                    </div>
                </div>

                {{-- Recent Employees --}}
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
                                Team
                            </p>
                            <h2 class="mt-1 text-xl font-bold text-slate-900">
                                Recent members
                            </h2>
                        </div>

                        <a href="{{ route('manager.team.index') }}"
                            class="text-sm font-semibold text-violet-600 hover:text-violet-800">
                            View
                        </a>
                    </div>

                    @if ($recentEmployees->count())
                    <div class="mt-5 space-y-3">
                        @foreach ($recentEmployees as $employee)
                        <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
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
                    <div class="mt-5 rounded-xl bg-slate-50 p-5 text-center">
                        <p class="text-sm font-semibold text-slate-800">No employees yet</p>
                        <p class="mt-1 text-xs text-slate-500">Add your first team member.</p>
                    </div>
                    @endif
                </div>
            </section>

            {{-- =========================================================
             MOBILE PROJECT CTA
        ========================================================== --}}
            <div class="mt-6 sm:hidden">
                <a href="{{ route('manager.projects.index') }}"
                    class="flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                    View All Projects
                </a>
            </div>

        </main>
    </div>

</x-app-layout>