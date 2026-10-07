<x-app-layout>
    @php
        /*
        |--------------------------------------------------------------------------
        | Safe Dashboard Defaults
        |--------------------------------------------------------------------------
        | These fallbacks prevent the dashboard from throwing a 500 if a
        | controller value is temporarily unavailable.
        */

        $projectCount = $projectCount ?? 0;
        $totalTasks = $totalTasks ?? 0;
        $pendingTasks = $pendingTasks ?? 0;
        $completedTasks = $completedTasks ?? 0;

        $loggedHours = $loggedHours ?? 0;
        $todayHours = $todayHours ?? 0;
        $dailyUpdateCount = $dailyUpdateCount ?? 0;

        $hasSubmittedToday = $hasSubmittedToday ?? false;

        $recentTasks = $recentTasks ?? collect();
        $recentUpdates = $recentUpdates ?? collect();

        $employeeName = auth()->user()?->name ?? 'Employee';
        $firstName = explode(' ', trim($employeeName))[0] ?? 'Employee';

        /*
        |--------------------------------------------------------------------------
        | Calculated Dashboard Values
        |--------------------------------------------------------------------------
        */

        $completedPercentage = $totalTasks > 0
            ? min(100, round(($completedTasks / $totalTasks) * 100))
            : 0;

        $pendingPercentage = $totalTasks > 0
            ? min(100, round(($pendingTasks / $totalTasks) * 100))
            : 0;

        $inProgressTasks = max(
            0,
            $totalTasks - $completedTasks - $pendingTasks
        );

        $inProgressPercentage = $totalTasks > 0
            ? min(100, round(($inProgressTasks / $totalTasks) * 100))
            : 0;

        $todayHourPercentage = min(
            100,
            round(($todayHours / 8) * 100)
        );

        $overallHourPercentage = min(
            100,
            round(($loggedHours / 40) * 100)
        );
    @endphp

    <div class="min-h-screen bg-slate-50">
        <main class="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-5 lg:px-6">

            {{-- ============================================================
                 COMPACT HERO
            ============================================================= --}}
            <section class="relative mb-4 overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 shadow-lg shadow-indigo-200/40">

                <div class="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div class="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-fuchsia-400/10 blur-3xl"></div>

                <div class="relative flex flex-col gap-3 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">

                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-sm text-white ring-1 ring-white/20">
                                ✦
                            </span>

                            <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-100">
                                Employee Workspace
                            </span>
                        </div>

                        <h1 class="mt-1.5 truncate text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                            Welcome back, {{ $firstName }} 👋
                        </h1>

                        <p class="mt-1 text-xs font-medium text-indigo-100 sm:text-sm">
                            Stay focused, track your work, and keep your daily progress moving.
                        </p>
                    </div>

                    <div class="flex shrink-0 items-center gap-2">
                        <div class="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                            <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                                Today
                            </p>

                            <p class="mt-0.5 text-sm font-bold text-white">
                                {{ now()->format('d M Y') }}
                            </p>
                        </div>

                        <a
                            href="{{ route('employee.daily-updates.create') }}"
                            class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14m-7-7h14" />
                            </svg>

                            Daily Update
                        </a>
                    </div>
                </div>
            </section>


            {{-- ============================================================
                 FLASH MESSAGES
            ============================================================= --}}
            @if (session('success'))
                <div class="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        ✓
                    </span>

                    <span>{{ session('success') }}</span>
                </div>
            @endif

            @if (session('error'))
                <div class="mb-4 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm">
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                        !
                    </span>

                    <span>{{ session('error') }}</span>
                </div>
            @endif


            {{-- ============================================================
                 STAT CARDS
            ============================================================= --}}
            <section class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

                {{-- Projects --}}
                <div class="group flex min-h-[122px] flex-col justify-between rounded-xl border border-indigo-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">

                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Projects
                            </p>

                            <p class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                                {{ $projectCount }}
                            </p>
                        </div>

                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 7.5A2.5 2.5 0 015.5 5h5l2 2h6A2.5 2.5 0 0121 9.5v8a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-10z" />
                            </svg>
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-medium text-slate-500">
                            Assigned workspace
                        </span>

                        <span class="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
                            Active
                        </span>
                    </div>
                </div>


                {{-- Tasks --}}
                <div class="group flex min-h-[122px] flex-col justify-between rounded-xl border border-violet-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">

                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Total Tasks
                            </p>

                            <p class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                                {{ $totalTasks }}
                            </p>
                        </div>

                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                            </svg>
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-medium text-slate-500">
                            {{ $completedTasks }} completed
                        </span>

                        <span class="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                            {{ $pendingTasks }} pending
                        </span>
                    </div>
                </div>


                {{-- Hours --}}
                <div class="group flex min-h-[122px] flex-col justify-between rounded-xl border border-fuchsia-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-fuchsia-200 hover:shadow-md">

                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Logged Hours
                            </p>

                            <p class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                                {{ number_format((float) $loggedHours, 1) }}
                                <span class="text-sm font-bold text-slate-400">h</span>
                            </p>
                        </div>

                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600 transition group-hover:bg-fuchsia-600 group-hover:text-white">
                            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-medium text-slate-500">
                            Today {{ number_format((float) $todayHours, 1) }}h
                        </span>

                        <span class="rounded-full bg-fuchsia-50 px-2 py-1 text-[10px] font-bold text-fuchsia-700">
                            Weekly activity
                        </span>
                    </div>
                </div>


                {{-- Daily Updates --}}
                <div class="group flex min-h-[122px] flex-col justify-between rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">

                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Daily Updates
                            </p>

                            <p class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                                {{ $dailyUpdateCount }}
                            </p>
                        </div>

                        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                            <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h8M8 14h5m6 6l-3.5-3.5A8 8 0 104 12a8 8 0 008 8c1.42 0 2.75-.37 3.9-1.02L19 20z" />
                            </svg>
                        </span>
                    </div>

                    <div class="flex items-center justify-between">
                        <span class="text-[11px] font-medium text-slate-500">
                            Work activity history
                        </span>

                        @if ($hasSubmittedToday ?? false)
                            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Submitted
                            </span>
                        @else
                            <span class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                                <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                Pending today
                            </span>
                        @endif
                    </div>
                </div>
            </section>


            {{-- ============================================================
                 MAIN CONTENT
            ============================================================= --}}
            <section class="grid grid-cols-1 gap-4 xl:grid-cols-12">

                {{-- ========================================================
                     TASK BREAKDOWN
                ========================================================= --}}
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-8">

                    <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <div>
                            <div class="flex items-center gap-2.5">
                                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
                                    </svg>
                                </span>

                                <div>
                                    <h2 class="text-sm font-bold text-slate-900">
                                        Task Breakdown
                                    </h2>

                                    <p class="text-[11px] text-slate-500">
                                        Current workload distribution
                                    </p>
                                </div>
                            </div>
                        </div>

                        <span class="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                            {{ $completedPercentage }}% complete
                        </span>
                    </div>

                    <div class="p-4">

                        {{-- Overall Progress --}}
                        <div class="mb-5">
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-xs font-semibold text-slate-600">
                                    Overall completion
                                </span>

                                <span class="text-xs font-extrabold text-violet-700">
                                    {{ $completedPercentage }}%
                                </span>
                            </div>

                            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-500 transition-all duration-700"
                                    style="width: <?php echo isset($completedPercentage) ? $completedPercentage : 0; ?>%;"
                                ></div>
                            </div>
                        </div>


                        {{-- Breakdown Cards --}}
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">

                            {{-- Pending --}}
                            <div class="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-amber-700">
                                        Pending
                                    </span>

                                    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                                        {{ $pendingTasks }}
                                    </span>
                                </div>

                                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
                                    <div
                                        class="h-full rounded-full bg-amber-500"
                                        style="width: <?php echo isset($pendingPercentage) ? $pendingPercentage : 0; ?>%;"
                                    ></div>
                                </div>

                                <p class="mt-1.5 text-[10px] font-medium text-amber-700/70">
                                    {{ $pendingPercentage }}% of total tasks
                                </p>
                            </div>


                            {{-- In Progress --}}
                            <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-indigo-700">
                                        In Progress
                                    </span>

                                    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                                        {{ $inProgressTasks }}
                                    </span>
                                </div>

                                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-100">
                                    <div
                                        class="h-full rounded-full bg-indigo-500"
                                        style="width: <?php echo isset($inProgressPercentage) ? $inProgressPercentage : 0; ?>%;"
                                    ></div>
                                </div>

                                <p class="mt-1.5 text-[10px] font-medium text-indigo-700/70">
                                    {{ $inProgressPercentage }}% of total tasks
                                </p>
                            </div>


                            {{-- Completed --}}
                            <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-emerald-700">
                                        Completed
                                    </span>

                                    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                                        {{ $completedTasks }}
                                    </span>
                                </div>

                                <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                                    <div
                                        class="h-full rounded-full bg-emerald-500"
                                        style="width: <?php echo isset($completedPercentage) ? $completedPercentage : 0; ?>%;"
                                    ></div>
                                </div>

                                <p class="mt-1.5 text-[10px] font-medium text-emerald-700/70">
                                    {{ $completedPercentage }}% of total tasks
                                </p>
                            </div>
                        </div>


                        {{-- Task Summary --}}
                        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3">
                            <div>
                                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Workload
                                </p>

                                <p class="mt-0.5 text-xs font-semibold text-slate-700">
                                    {{ $totalTasks }} total tasks assigned
                                </p>
                            </div>

                            <a
                                href="{{ route('employee.tasks.index') }}"
                                class="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-violet-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-violet-50 hover:ring-violet-200"
                            >
                                View Tasks

                                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>


                {{-- ========================================================
                     DAILY OVERVIEW
                ========================================================= --}}
                <aside class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-4">

                    <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <div class="flex items-center gap-2.5">
                            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>

                            <div>
                                <h2 class="text-sm font-bold text-slate-900">
                                    Daily Overview
                                </h2>

                                <p class="text-[11px] text-slate-500">
                                    Your activity today
                                </p>
                            </div>
                        </div>

                        <span class="text-[11px] font-bold text-slate-400">
                            8h target
                        </span>
                    </div>

                    <div class="space-y-4 p-4">

                        {{-- Hours --}}
                        <div>
                            <div class="mb-2 flex items-center justify-between">
                                <span class="text-xs font-semibold text-slate-600">
                                    Today's logged hours
                                </span>

                                <span class="text-xs font-extrabold text-fuchsia-700">
                                    {{ number_format((float) $todayHours, 1) }}h / 8h
                                </span>
                            </div>

                            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    class="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 transition-all duration-700"
                                    style="width: <?php echo isset($todayHourPercentage) ? $todayHourPercentage : 0; ?>%;"
                                ></div>
                            </div>
                        </div>


                        {{-- Daily Update Status --}}
                        <div class="rounded-xl border border-slate-100 bg-slate-50 p-3.5">

                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <p class="text-xs font-bold text-slate-800">
                                        Today's daily update
                                    </p>

                                    <p class="mt-0.5 text-[10px] text-slate-500">
                                        Keep your work activity up to date.
                                    </p>
                                </div>

                                @if ($hasSubmittedToday ?? false)
                                    <span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                        Submitted
                                    </span>
                                @else
                                    <span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                                        <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                        Not submitted
                                    </span>
                                @endif
                            </div>

                            @if (!($hasSubmittedToday ?? false))
                                <a
                                    href="{{ route('employee.daily-updates.create') }}"
                                    class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-violet-700"
                                >
                                    Submit Today's Update

                                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                            @else
                                <a
                                    href="{{ route('employee.daily-updates.index') }}"
                                    class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50"
                                >
                                    View Update History

                                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            @endif
                        </div>


                        {{-- Hours Summary --}}
                        <div class="grid grid-cols-2 gap-2">
                            <div class="rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
                                <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                    Today
                                </p>

                                <p class="mt-0.5 text-lg font-extrabold text-indigo-800">
                                    {{ number_format((float) $todayHours, 1) }}h
                                </p>
                            </div>

                            <div class="rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2.5">
                                <p class="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                                    Total
                                </p>

                                <p class="mt-0.5 text-lg font-extrabold text-violet-800">
                                    {{ number_format((float) $loggedHours, 1) }}h
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>


            {{-- ============================================================
                 RECENT TASKS
            ============================================================= --}}
            <section class="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                    <div class="flex items-center gap-2.5">
                        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                            </svg>
                        </span>

                        <div>
                            <h2 class="text-sm font-bold text-slate-900">
                                Recent Tasks
                            </h2>

                            <p class="text-[11px] text-slate-500">
                                Your latest assigned work
                            </p>
                        </div>
                    </div>

                    <a
                        href="{{ route('employee.tasks.index') }}"
                        class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 transition hover:text-indigo-800"
                    >
                        View all

                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>


                @if ($recentTasks->count())

                    <div class="overflow-x-auto">
                        <table class="w-full min-w-[680px] text-left">

                            <thead class="border-b border-slate-100 bg-slate-50/70">
                                <tr>
                                    <th class="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Task
                                    </th>

                                    <th class="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Project
                                    </th>

                                    <th class="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Priority
                                    </th>

                                    <th class="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-100">

                                @forelse ($recentTasks as $task)

                                    @php
                                        /** @var \App\Models\Task $task */

                                        $priority = strtolower((string) ($task?->priority ?? 'normal'));
                                        $status = strtolower((string) ($task?->status ?? 'pending'));

                                        $priorityClass = match ($priority) {
                                            'high', 'urgent' => 'bg-rose-50 text-rose-700 ring-rose-200',
                                            'medium' => 'bg-amber-50 text-amber-700 ring-amber-200',
                                            'low' => 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                                            default => 'bg-indigo-50 text-indigo-700 ring-indigo-200',
                                        };

                                        $statusClass = match ($status) {
                                            'done', 'completed', 'complete' => 'bg-emerald-50 text-emerald-700 ring-emerald-200',
                                            'in progress', 'in_progress', 'progress' => 'bg-indigo-50 text-indigo-700 ring-indigo-200',
                                            'blocked' => 'bg-rose-50 text-rose-700 ring-rose-200',
                                            default => 'bg-amber-50 text-amber-700 ring-amber-200',
                                        };
                                    @endphp

                                    <tr class="group transition hover:bg-indigo-50/30">

                                        <td class="max-w-[360px] px-4 py-3">
                                            <div class="flex items-center gap-3">

                                                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition group-hover:bg-violet-100">
                                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                                                    </svg>
                                                </span>

                                                <div class="min-w-0">
                                                    <p class="truncate text-xs font-bold text-slate-900">
                                                        {{ $task?->title ?? 'Untitled Task' }}
                                                    </p>

                                                    <p class="mt-0.5 truncate text-[10px] text-slate-400">
                                                        Assigned task
                                                    </p>
                                                </div>
                                            </div>
                                        </td>


                                        <td class="max-w-[220px] px-4 py-3">
                                            <span class="block truncate text-xs font-medium text-slate-600">
                                                {{ $task?->project?->title ?? 'No Project' }}
                                            </span>
                                        </td>


                                        <td class="px-4 py-3">
                                            <span class="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 {{ $priorityClass }}">
                                                {{ ucfirst($task?->priority ?? 'Normal') }}
                                            </span>
                                        </td>


                                        <td class="px-4 py-3">
                                            <span class="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 {{ $statusClass }}">
                                                {{ ucfirst($task?->status ?? 'Pending') }}
                                            </span>
                                        </td>

                                    </tr>

                                @empty

                                    <tr>
                                        <td colspan="4" class="px-4 py-10 text-center">

                                            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                                                </svg>
                                            </div>

                                            <p class="mt-2 text-xs font-bold text-slate-700">
                                                No tasks assigned yet
                                            </p>

                                            <p class="mt-0.5 text-[10px] text-slate-400">
                                                New tasks will appear here once assigned.
                                            </p>

                                        </td>
                                    </tr>

                                @endforelse

                            </tbody>
                        </table>
                    </div>

                @else

                    <div class="px-4 py-10 text-center">
                        <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                            </svg>
                        </div>

                        <p class="mt-2 text-xs font-bold text-slate-700">
                            No recent tasks
                        </p>
                    </div>

                @endif
            </section>


            {{-- ============================================================
                 BOTTOM GRID
            ============================================================= --}}
            <section class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">

                {{-- Recent Updates --}}
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-8">

                    <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                        <div class="flex items-center gap-2.5">
                            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h8M8 14h5m6 6l-3.5-3.5A8 8 0 104 12a8 8 0 008 8c1.42 0 2.75-.37 3.9-1.02L19 20z" />
                                </svg>
                            </span>

                            <div>
                                <h2 class="text-sm font-bold text-slate-900">
                                    Recent Daily Updates
                                </h2>

                                <p class="text-[11px] text-slate-500">
                                    Your latest work activity
                                </p>
                            </div>
                        </div>

                        <a
                            href="{{ route('employee.daily-updates.index') }}"
                            class="text-[11px] font-bold text-emerald-600 transition hover:text-emerald-800"
                        >
                            View history
                        </a>
                    </div>


                    @if ($recentUpdates->count())

                        <div class="divide-y divide-slate-100">

                            @foreach ($recentUpdates as $update)

                                <div class="px-4 py-3 transition hover:bg-emerald-50/20">

                                    <div class="flex items-start justify-between gap-3">

                                        <div class="min-w-0">
                                            <div class="flex flex-wrap items-center gap-2">

                                                <p class="text-xs font-bold text-slate-900">
                                                    {{ $update->project?->title ?? 'General Update' }}
                                                </p>

                                                @if (!empty($update->status))
                                                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                                        {{ ucfirst($update->status) }}
                                                    </span>
                                                @endif

                                            </div>

                                            <p class="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                                                {{ $update->summary ?? $update->description ?? 'No summary provided.' }}
                                            </p>
                                        </div>

                                        <span class="shrink-0 text-[10px] font-semibold text-slate-400">
                                            {{ optional($update->submitted_for)->format('d M Y') ?? 'Recent' }}
                                        </span>

                                    </div>

                                </div>

                            @endforeach

                        </div>

                    @else

                        <div class="px-4 py-10 text-center">

                            <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M8 10h8M8 14h5m6 6l-3.5-3.5A8 8 0 104 12a8 8 0 008 8c1.42 0 2.75-.37 3.9-1.02L19 20z" />
                                </svg>
                            </div>

                            <p class="mt-2 text-xs font-bold text-slate-700">
                                No daily updates yet
                            </p>

                            <p class="mt-0.5 text-[10px] text-slate-400">
                                Your submitted work updates will appear here.
                            </p>

                        </div>

                    @endif
                </div>


                {{-- Quick Actions --}}
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-4">

                    <div class="border-b border-slate-100 px-4 py-3.5">
                        <div class="flex items-center gap-2.5">
                            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4v16m8-8H4" />
                                </svg>
                            </span>

                            <div>
                                <h2 class="text-sm font-bold text-slate-900">
                                    Quick Actions
                                </h2>

                                <p class="text-[11px] text-slate-500">
                                    Common workspace actions
                                </p>
                            </div>
                        </div>
                    </div>


                    <div class="grid grid-cols-1 gap-2.5 p-3">

                        <a
                            href="{{ route('employee.projects.index') }}"
                            class="group flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-sm"
                        >
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 7.5A2.5 2.5 0 015.5 5h5l2 2h6A2.5 2.5 0 0121 9.5v8a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-10z" />
                                </svg>
                            </span>

                            <span class="min-w-0 flex-1">
                                <span class="block text-xs font-bold text-slate-900">
                                    My Projects
                                </span>

                                <span class="mt-0.5 block text-[10px] text-slate-500">
                                    View assigned projects
                                </span>
                            </span>

                            <svg class="h-3.5 w-3.5 text-indigo-400 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>


                        <a
                            href="{{ route('employee.tasks.index') }}"
                            class="group flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm"
                        >
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
                                </svg>
                            </span>

                            <span class="min-w-0 flex-1">
                                <span class="block text-xs font-bold text-slate-900">
                                    My Tasks
                                </span>

                                <span class="mt-0.5 block text-[10px] text-slate-500">
                                    Review assigned work
                                </span>
                            </span>

                            <svg class="h-3.5 w-3.5 text-violet-400 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>


                        <a
                            href="{{ route('employee.daily-updates.create') }}"
                            class="group flex items-center gap-3 rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-3 transition hover:-translate-y-0.5 hover:border-fuchsia-200 hover:bg-fuchsia-50 hover:shadow-sm"
                        >
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-600 text-white shadow-sm">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14m-7-7h14" />
                                </svg>
                            </span>

                            <span class="min-w-0 flex-1">
                                <span class="block text-xs font-bold text-slate-900">
                                    Submit Update
                                </span>

                                <span class="mt-0.5 block text-[10px] text-slate-500">
                                    Log today's work
                                </span>
                            </span>

                            <svg class="h-3.5 w-3.5 text-fuchsia-400 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </a>

                    </div>
                </div>
            </section>

        </main>
    </div>
</x-app-layout>