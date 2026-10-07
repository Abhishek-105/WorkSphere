@extends('layouts.app')

@section('title', 'Activity')

@section('page_title', 'Activity')

@section('page_subtitle', 'Track important workspace activity across projects, tasks and daily updates.')

@section('content')

<div class="space-y-6">

    {{-- Header --}}
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>
            <div class="flex items-center gap-3">

                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <div>
                    <h1 class="text-2xl font-bold tracking-tight text-slate-900">
                        Activity Center
                    </h1>

                    <p class="mt-1 text-sm text-slate-500">
                        A complete audit trail of important workspace actions.
                    </p>
                </div>

            </div>
        </div>

        <a
            href="{{ route('manager.dashboard') }}"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
            <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.8"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
                />
            </svg>

            Dashboard
        </a>

    </div>


    {{-- KPI cards --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div class="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Today
            </p>

            <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {{ $todayCount }}
            </p>

            <p class="mt-1 text-xs text-slate-500">
                Activities recorded today
            </p>
        </div>


        <div class="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-sky-600">
                This Week
            </p>

            <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {{ $weekCount }}
            </p>

            <p class="mt-1 text-xs text-slate-500">
                Workspace events this week
            </p>
        </div>


        <div class="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Project Activity
            </p>

            <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {{ $projectCount }}
            </p>

            <p class="mt-1 text-xs text-slate-500">
                Events connected to projects
            </p>
        </div>


        <div class="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-wider text-amber-600">
                Task Activity
            </p>

            <p class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {{ $taskCount }}
            </p>

            <p class="mt-1 text-xs text-slate-500">
                Events connected to tasks
            </p>
        </div>

    </div>


    {{-- Filters --}}
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div class="mb-4">
            <h2 class="text-sm font-bold text-slate-900">
                Filter Activity
            </h2>

            <p class="mt-1 text-xs text-slate-500">
                Narrow the audit trail by employee, project, action or period.
            </p>
        </div>

        <form
            method="GET"
            action="{{ route('manager.activity.index') }}"
            class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6"
        >

            <div class="xl:col-span-2">
                <label class="mb-1.5 block text-xs font-semibold text-slate-600">
                    Search
                </label>

                <input
                    type="text"
                    name="search"
                    value="{{ $search }}"
                    placeholder="Search activity..."
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
            </div>


            <div>
                <label class="mb-1.5 block text-xs font-semibold text-slate-600">
                    Employee
                </label>

                <select
                    name="actor_id"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="">All employees</option>

                    @foreach ($employees as $employee)
                        <option
                            value="{{ $employee->id }}"
                            {{ (string) $actorId === (string) $employee->id ? 'selected' : '' }}
                        >
                            {{ $employee->name }}
                        </option>
                    @endforeach
                </select>
            </div>


            <div>
                <label class="mb-1.5 block text-xs font-semibold text-slate-600">
                    Project
                </label>

                <select
                    name="project_id"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="">All projects</option>

                    @foreach ($projects as $project)
                        <option
                            value="{{ $project->id }}"
                            {{ (string) $projectId === (string) $project->id ? 'selected' : '' }}
                        >
                            {{ $project->title }}
                        </option>
                    @endforeach
                </select>
            </div>


            <div>
                <label class="mb-1.5 block text-xs font-semibold text-slate-600">
                    Action
                </label>

                <select
                    name="action"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="">All actions</option>

                    @foreach ($actions as $availableAction)
                        <option
                            value="{{ $availableAction }}"
                            {{ $action === $availableAction ? 'selected' : '' }}
                        >
                            {{ ucwords(str_replace('.', ' ', $availableAction)) }}
                        </option>
                    @endforeach
                </select>
            </div>


            <div>
                <label class="mb-1.5 block text-xs font-semibold text-slate-600">
                    Period
                </label>

                <select
                    name="period"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="all" {{ $period === 'all' ? 'selected' : '' }}>
                        All time
                    </option>

                    <option value="today" {{ $period === 'today' ? 'selected' : '' }}>
                        Today
                    </option>

                    <option value="week" {{ $period === 'week' ? 'selected' : '' }}>
                        This week
                    </option>
                </select>
            </div>


            <div class="flex items-end gap-2">

                <button
                    type="submit"
                    class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    Apply
                </button>

                <a
                    href="{{ route('manager.activity.index') }}"
                    class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                    Reset
                </a>

            </div>

        </form>

    </section>


    {{-- Activity timeline --}}
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
                <h2 class="text-base font-bold text-slate-900">
                    Activity Timeline
                </h2>

                <p class="mt-0.5 text-xs text-slate-500">
                    {{ $activities->total() }} matching activity records
                </p>
            </div>

            <span class="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Audit Trail
            </span>

        </div>


        @if ($activities->count())

            <div class="divide-y divide-slate-100">

                @foreach ($activities as $activity)

                    @php
                        $actionType = strtolower((string) $activity->action);

                        $badgeClass = match (true) {
                            str_contains($actionType, 'created') =>
                                'bg-emerald-100 text-emerald-700',

                            str_contains($actionType, 'updated') =>
                                'bg-sky-100 text-sky-700',

                            str_contains($actionType, 'deleted') =>
                                'bg-rose-100 text-rose-700',

                            default =>
                                'bg-indigo-100 text-indigo-700',
                        };

                        $iconPath = match (true) {
                            str_contains($actionType, 'created') =>
                                'M12 4v16m8-8H4',

                            str_contains($actionType, 'deleted') =>
                                'M6 7h12M9 7V4h6v3m-8 0l1 13h8l1-13',

                            str_contains($actionType, 'updated') =>
                                'M12 20h9M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4 12.5-11.5z',

                            default =>
                                'M12 8v4l3 2',
                        };
                    @endphp

                    <div class="group px-5 py-5 transition hover:bg-slate-50/70">

                        <div class="flex gap-4">

                            {{-- Timeline icon --}}
                            <div class="relative shrink-0">

                                <div class="flex h-10 w-10 items-center justify-center rounded-xl {{ $badgeClass }}">
                                    <svg
                                        class="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="1.8"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="{{ $iconPath }}"
                                        />
                                    </svg>
                                </div>

                            </div>


                            {{-- Content --}}
                            <div class="min-w-0 flex-1">

                                <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">

                                    <div class="min-w-0">

                                        <div class="flex flex-wrap items-center gap-2">

                                            <span class="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide {{ $badgeClass }}">
                                                {{ ucwords(str_replace('.', ' ', $activity->action)) }}
                                            </span>

                                            @if ($activity->actor)
                                                <span class="text-xs font-semibold text-slate-700">
                                                    {{ $activity->actor->name }}
                                                </span>
                                            @endif

                                        </div>

                                        <p class="mt-2 text-sm font-semibold leading-6 text-slate-900">
                                            {{ $activity->description }}
                                        </p>

                                    </div>


                                    <time
                                        datetime="{{ $activity->created_at?->toIso8601String() }}"
                                        class="shrink-0 text-xs font-medium text-slate-400"
                                    >
                                        {{ $activity->created_at?->diffForHumans() }}
                                    </time>

                                </div>


                                {{-- Context --}}
                                <div class="mt-3 flex flex-wrap gap-2">

                                    @if ($activity->project)
                                        <span class="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700">
                                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h6l2 2h10v10H3V7z" />
                                            </svg>

                                            {{ $activity->project->title }}
                                        </span>
                                    @endif


                                    @if ($activity->task)
                                        <span class="inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
                                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5h10M9 9h10M9 13h6M5 5h.01M5 9h.01M5 13h.01" />
                                            </svg>

                                            {{ $activity->task->title }}
                                        </span>
                                    @endif


                                    @if ($activity->dailyUpdate)
                                        <span class="inline-flex items-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                                            Daily Update
                                        </span>
                                    @endif

                                </div>


                                {{-- Changed fields --}}
                                @if (
                                    is_array($activity->metadata)
                                    && !empty($activity->metadata['changes'])
                                )

                                    <details class="mt-3">

                                        <summary class="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-indigo-600">
                                            View changed fields
                                        </summary>

                                        <div class="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3">

                                            <div class="grid grid-cols-1 gap-2 md:grid-cols-2">

                                                @foreach ($activity->metadata['changes'] as $field => $value)

                                                    <div class="rounded-lg bg-white px-3 py-2">

                                                        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                            {{ str_replace('_', ' ', $field) }}
                                                        </p>

                                                        <p class="mt-1 break-words text-xs font-medium text-slate-700">
                                                            @if (is_array($value))
                                                                {{ json_encode($value) }}
                                                            @elseif (is_null($value))
                                                                —
                                                            @else
                                                                {{ $value }}
                                                            @endif
                                                        </p>

                                                    </div>

                                                @endforeach

                                            </div>

                                        </div>

                                    </details>

                                @endif

                            </div>

                        </div>

                    </div>

                @endforeach

            </div>


            {{-- Pagination --}}
            <div class="border-t border-slate-100 px-5 py-4">
                {{ $activities->links() }}
            </div>

        @else

            <div class="px-6 py-16 text-center">

                <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                    <svg
                        class="h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.7"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>

                </div>

                <h3 class="mt-4 text-sm font-bold text-slate-900">
                    No activity found
                </h3>

                <p class="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                    Activity generated by projects, tasks and daily updates will appear here.
                </p>

            </div>

        @endif

    </section>

</div>

@endsection