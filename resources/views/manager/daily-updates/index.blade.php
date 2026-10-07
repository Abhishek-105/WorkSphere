@extends('layouts.app')

@section('title', 'Daily Updates')

@section('page_heading', 'Daily Updates')

@section(
    'page_subtitle',
    'Monitor team progress, review employee updates and resolve blockers.'
)

@section('content')

<div class="space-y-6">

    {{-- Header --}}
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
            <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                              d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
                    </svg>
                </div>

                <div>
                    <h2 class="text-xl font-bold text-slate-900">
                        Daily Updates
                    </h2>

                    <p class="text-sm text-slate-500">
                        Manager workspace for daily team activity.
                    </p>
                </div>
            </div>
        </div>

        <div class="text-sm text-slate-500">
            {{ now()->format('l, d M Y') }}
        </div>

    </div>


    {{-- Workflow Navigation --}}
    <div class="overflow-x-auto">
        <div class="flex min-w-max items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

            <a
                href="{{ route('manager.daily-updates.index', ['view' => 'today']) }}"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition
                    {{ $view === 'today'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100' }}"
            >
                Today
            </a>

            <a
                href="{{ route('manager.daily-updates.index', ['view' => 'pending']) }}"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition
                    {{ $view === 'pending'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100' }}"
            >
                Needs Review
            </a>

            <a
                href="{{ route('manager.daily-updates.index', ['view' => 'blockers']) }}"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition
                    {{ $view === 'blockers'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100' }}"
            >
                Blockers
            </a>

            <a
                href="{{ route('manager.daily-updates.index', ['view' => 'week']) }}"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition
                    {{ $view === 'week'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100' }}"
            >
                This Week
            </a>

            <a
                href="{{ route('manager.daily-updates.index', ['view' => 'all']) }}"
                class="rounded-xl px-4 py-2 text-sm font-semibold transition
                    {{ $view === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100' }}"
            >
                History
            </a>

        </div>
    </div>


    {{-- KPI Grid --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <a
            href="{{ route('manager.daily-updates.index', ['view' => 'today']) }}"
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-slate-500">
                    Submitted Today
                </span>

                <span class="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    ✓
                </span>
            </div>

            <p class="mt-3 text-3xl font-bold text-slate-900">
                {{ $totalSubmittedToday }}
            </p>

            <p class="mt-1 text-xs text-slate-400">
                Employee updates received
            </p>
        </a>


        <a
            href="{{ route('manager.daily-updates.index', ['view' => 'pending']) }}"
            class="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-amber-700">
                    Pending Review
                </span>

                <span class="rounded-xl bg-white p-2 text-amber-600">
                    !
                </span>
            </div>

            <p class="mt-3 text-3xl font-bold text-amber-900">
                {{ $pendingReview }}
            </p>

            <p class="mt-1 text-xs text-amber-700/70">
                Require manager attention
            </p>
        </a>


        <div class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-emerald-700">
                    Reviewed
                </span>

                <span class="rounded-xl bg-white p-2 text-emerald-600">
                    ✓
                </span>
            </div>

            <p class="mt-3 text-3xl font-bold text-emerald-900">
                {{ $reviewedToday }}
            </p>

            <p class="mt-1 text-xs text-emerald-700/70">
                Reviewed today
            </p>
        </div>


        <a
            href="{{ route('manager.daily-updates.index', ['view' => 'blockers']) }}"
            class="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-rose-700">
                    Active Blockers
                </span>

                <span class="rounded-xl bg-white p-2 text-rose-600">
                    !
                </span>
            </div>

            <p class="mt-3 text-3xl font-bold text-rose-900">
                {{ $activeBlockersCount }}
            </p>

            <p class="mt-1 text-xs text-rose-700/70">
                Need manager action
            </p>
        </a>


        <a
            href="{{ route('manager.daily-updates.index', ['view' => 'week']) }}"
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-slate-500">
                    This Week
                </span>

                <span class="rounded-xl bg-slate-100 p-2 text-slate-600">
                    7d
                </span>
            </div>

            <p class="mt-3 text-3xl font-bold text-slate-900">
                {{ $totalSubmittedThisWeek }}
            </p>

            <p class="mt-1 text-xs text-slate-400">
                Updates submitted
            </p>
        </a>

    </div>


    {{-- Missing Employees --}}
    @if ($view === 'today' && $missingUpdates->count() > 0)

        <section class="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm">

            <div class="flex flex-col gap-3 border-b border-orange-100 bg-orange-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h3 class="font-bold text-orange-900">
                        Missing Today's Update
                    </h3>

                    <p class="mt-0.5 text-xs text-orange-700">
                        These active employees have not submitted an update today.
                    </p>
                </div>

                <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                    {{ $missingUpdates->count() }} missing
                </span>

            </div>

            <div class="divide-y divide-slate-100">

                @foreach ($missingUpdates as $employee)

                    <div class="flex items-center justify-between gap-4 px-5 py-4">

                        <div class="flex min-w-0 items-center gap-3">

                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                {{ strtoupper(substr($employee->name, 0, 1)) }}
                            </div>

                            <div class="min-w-0">
                                <p class="truncate text-sm font-semibold text-slate-800">
                                    {{ $employee->name }}
                                </p>

                                <p class="truncate text-xs text-slate-400">
                                    {{ $employee->email }}
                                </p>
                            </div>

                        </div>

                        <span class="shrink-0 text-xs font-semibold text-orange-600">
                            Not submitted
                        </span>

                    </div>

                @endforeach

            </div>

        </section>

    @endif


    {{-- Filters --}}
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <form
            method="GET"
            action="{{ route('manager.daily-updates.index') }}"
            class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >

            <input
                type="hidden"
                name="view"
                value="{{ $view }}"
            >

            <div>
                <label class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Employee
                </label>

                <select
                    name="employee_id"
                    class="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="">
                        All employees
                    </option>

                    @foreach ($employees as $employee)

                        <option
                            value="{{ $employee->id }}"
                            {{ request('employee_id') == $employee->id ? 'selected' : '' }}
                        >
                            {{ $employee->name }}
                        </option>

                    @endforeach

                </select>
            </div>


            <div>
                <label class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Project
                </label>

                <select
                    name="project_id"
                    class="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="">
                        All projects
                    </option>

                    @foreach ($projects as $project)

                        <option
                            value="{{ $project->id }}"
                            {{ request('project_id') == $project->id ? 'selected' : '' }}
                        >
                            {{ $project->title }}
                        </option>

                    @endforeach

                </select>
            </div>


            <div>
                <label class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Review Status
                </label>

                <select
                    name="status"
                    class="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="">
                        All statuses
                    </option>

                    <option
                        value="pending"
                        {{ request('status') === 'pending' ? 'selected' : '' }}
                    >
                        Pending
                    </option>

                    <option
                        value="reviewed"
                        {{ request('status') === 'reviewed' ? 'selected' : '' }}
                    >
                        Reviewed
                    </option>

                </select>
            </div>


            <div class="flex items-end gap-2">

                <button
                    type="submit"
                    class="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    Apply Filters
                </button>

                <a
                    href="{{ route('manager.daily-updates.index', ['view' => $view]) }}"
                    class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                    Reset
                </a>

            </div>

        </form>

    </section>


    {{-- Updates --}}
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div class="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
                <h3 class="font-bold text-slate-900">
                    {{ $view === 'pending' ? 'Updates Requiring Review' : '' }}
                    {{ $view === 'blockers' ? 'Team Blockers' : '' }}
                    {{ $view === 'week' ? 'This Week' : '' }}
                    {{ $view === 'all' ? 'Update History' : '' }}
                    {{ $view === 'today' ? "Today's Updates" : '' }}
                </h3>

                <p class="mt-0.5 text-xs text-slate-400">
                    Open an update to review the complete employee submission.
                </p>
            </div>

            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {{ $updates->total() }} updates
            </span>

        </div>


        @if ($updates->count() > 0)

            <div class="divide-y divide-slate-100">

                @foreach ($updates as $update)

                    <a
                        href="{{ route('manager.daily-updates.show', $update) }}"
                        class="group block px-5 py-5 transition hover:bg-slate-50"
                    >

                        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                            <div class="min-w-0 flex-1">

                                <div class="flex flex-wrap items-center gap-2">

                                    <span class="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                                        {{ $update->employee?->name ?? 'Unknown Employee' }}
                                    </span>

                                    @if ($update->status === 'reviewed')

                                        <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                            Reviewed
                                        </span>

                                    @else

                                        <span class="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                            Pending Review
                                        </span>

                                    @endif

                                    @if ($update->hasBlocker())

                                        @if ($update->blocker_acknowledged_at)

                                            <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                                Blocker Acknowledged
                                            </span>

                                        @else

                                            <span class="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                                                Active Blocker
                                            </span>

                                        @endif

                                    @endif

                                </div>


                                <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">

                                    <span>
                                        {{ $update->project?->title ?? 'No project' }}
                                    </span>

                                    @if ($update->task)

                                        <span>
                                            Task: {{ $update->task->title }}
                                        </span>

                                    @endif

                                    <span>
                                        {{ $update->update_date?->format('d M Y') }}
                                    </span>

                                    <span>
                                        {{ number_format((float) $update->hours_spent, 2) }} hrs
                                    </span>

                                </div>


                                <p class="mt-3 line-clamp-2 max-w-4xl text-sm leading-6 text-slate-600">
                                    {{ $update->work_description }}
                                </p>

                            </div>


                            <div class="flex shrink-0 items-center gap-2 text-sm font-semibold text-indigo-600">

                                <span>
                                    Review Update
                                </span>

                                <svg
                                    class="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>

                            </div>

                        </div>

                    </a>

                @endforeach

            </div>


            <div class="border-t border-slate-200 px-5 py-4">
                {{ $updates->links() }}
            </div>

        @else

            <div class="px-6 py-16 text-center">

                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                              d="M9 12h6m-6 4h4M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    </svg>
                </div>

                <h3 class="mt-4 font-bold text-slate-900">
                    No updates found
                </h3>

                <p class="mt-1 text-sm text-slate-500">
                    There are no daily updates matching the current view and filters.
                </p>

            </div>

        @endif

    </section>

</div>

@endsection