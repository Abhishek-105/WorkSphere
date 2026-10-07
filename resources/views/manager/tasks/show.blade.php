<x-app-layout>

    <div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {{-- Header --}}
        <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div class="flex items-start gap-3">

                <a
                    href="{{ route('manager.tasks.index') }}"
                    class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                    aria-label="Back to tasks"
                >
                    <svg
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </a>

                <div>

                    <p class="text-xs font-bold uppercase tracking-wider text-sky-600">
                        Task Details
                    </p>

                    <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        {{ $task->title }}
                    </h1>

                    <p class="mt-1 text-sm text-slate-500">
                        {{ $task->project?->title ?? 'No project' }}
                    </p>

                </div>

            </div>


            {{-- Actions --}}
            <div class="flex flex-wrap items-center gap-2">

                <a
                    href="{{ route('manager.tasks.edit', $task) }}"
                    class="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-200"
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
                            d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        />
                    </svg>

                    Edit Task

                </a>

            </div>

        </div>


        {{-- Success message --}}
        @if (session('success'))

            <div class="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <div class="flex items-center gap-3">

                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">

                        <svg
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>

                    </div>

                    <p class="text-sm font-semibold text-emerald-800">
                        {{ session('success') }}
                    </p>

                </div>

            </div>

        @endif


        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {{-- Main --}}
            <div class="space-y-6 lg:col-span-2">

                {{-- Overview --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-100 px-6 py-5">

                        <div class="flex items-center justify-between gap-4">

                            <div>

                                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Overview
                                </p>

                                <h2 class="mt-1 text-lg font-bold text-slate-900">
                                    {{ $task->title }}
                                </h2>

                            </div>


                            @php
                                $status = strtolower((string) $task->status);
                            @endphp

                            @if ($status === 'completed')

                                <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    Completed
                                </span>

                            @elseif ($status === 'in_progress')

                                <span class="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700">
                                    <span class="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                                    In Progress
                                </span>

                            @else

                                <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                                    <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                    Pending
                                </span>

                            @endif

                        </div>

                    </div>


                    <div class="p-6">

                        @if ($task->description)

                            <div>

                                <p class="text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Description
                                </p>

                                <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                                    {{ $task->description }}
                                </p>

                            </div>

                        @else

                            <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                                <p class="text-sm font-medium text-slate-500">
                                    No description has been added to this task.
                                </p>

                            </div>

                        @endif

                    </div>

                </div>


                {{-- Status controls --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-100 px-6 py-5">

                        <h2 class="text-base font-bold text-slate-900">
                            Task Status
                        </h2>

                        <p class="mt-1 text-xs text-slate-500">
                            Update the workflow status directly from the task.
                        </p>

                    </div>


                    <div class="p-6">

                        <form
                            method="POST"
                            action="{{ route('manager.tasks.updateStatus', $task) }}"
                            class="flex flex-col gap-3 sm:flex-row sm:items-center"
                        >

                            @csrf
                            @method('PATCH')

                            <select
                                name="status"
                                class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 sm:max-w-xs"
                            >

                                <option
                                    value="pending"
                                    @selected($status === 'pending')
                                >
                                    Pending
                                </option>

                                <option
                                    value="in_progress"
                                    @selected($status === 'in_progress')
                                >
                                    In Progress
                                </option>

                                <option
                                    value="completed"
                                    @selected($status === 'completed')
                                >
                                    Completed
                                </option>

                            </select>

                            <button
                                type="submit"
                                class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Update Status
                            </button>

                        </form>

                    </div>

                </div>


                {{-- Timeline --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-100 px-6 py-5">

                        <h2 class="text-base font-bold text-slate-900">
                            Task Timeline
                        </h2>

                        <p class="mt-1 text-xs text-slate-500">
                            Workflow timestamps for this task.
                        </p>

                    </div>


                    <div class="p-6">

                        <div class="space-y-5">

                            <div class="flex gap-4">

                                <div class="mt-1 h-3 w-3 shrink-0 rounded-full bg-slate-400"></div>

                                <div>

                                    <p class="text-sm font-semibold text-slate-800">
                                        Task created
                                    </p>

                                    <p class="mt-1 text-xs text-slate-500">
                                        {{ optional($task->created_at)->format('d M Y, h:i A') ?? '—' }}
                                    </p>

                                </div>

                            </div>


                            <div class="flex gap-4">

                                <div class="mt-1 h-3 w-3 shrink-0 rounded-full bg-sky-500"></div>

                                <div>

                                    <p class="text-sm font-semibold text-slate-800">
                                        Work started
                                    </p>

                                    <p class="mt-1 text-xs text-slate-500">
                                        {{ optional($task->started_at)->format('d M Y, h:i A') ?? 'Not started yet' }}
                                    </p>

                                </div>

                            </div>


                            <div class="flex gap-4">

                                <div class="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-500"></div>

                                <div>

                                    <p class="text-sm font-semibold text-slate-800">
                                        Task completed
                                    </p>

                                    <p class="mt-1 text-xs text-slate-500">
                                        {{ optional($task->completed_at)->format('d M Y, h:i A') ?? 'Not completed yet' }}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {{-- Sidebar --}}
            <div class="space-y-6">

                {{-- Task information --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-100 px-5 py-4">

                        <h2 class="text-sm font-bold text-slate-900">
                            Task Information
                        </h2>

                    </div>


                    <div class="divide-y divide-slate-100">

                        {{-- Project --}}
                        <div class="p-5">

                            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Project
                            </p>

                            <p class="mt-1.5 text-sm font-semibold text-slate-800">
                                {{ $task->project?->title ?? 'No project' }}
                            </p>

                        </div>


                        {{-- Employee --}}
                        <div class="p-5">

                            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Assigned Employee
                            </p>

                            @if ($task->assignedEmployee)

                                <div class="mt-2 flex items-center gap-3">

                                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                                        {{ strtoupper(substr($task->assignedEmployee->name, 0, 1)) }}
                                    </div>

                                    <div class="min-w-0">

                                        <p class="truncate text-sm font-semibold text-slate-800">
                                            {{ $task->assignedEmployee->name }}
                                        </p>

                                        <p class="truncate text-xs text-slate-500">
                                            {{ $task->assignedEmployee->email }}
                                        </p>

                                    </div>

                                </div>

                            @else

                                <p class="mt-1.5 text-sm font-medium text-slate-400">
                                    Unassigned
                                </p>

                            @endif

                        </div>


                        {{-- Priority --}}
                        <div class="p-5">

                            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Priority
                            </p>

                            @if ($task->priority === 'high')

                                <span class="mt-2 inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                    High
                                </span>

                            @elseif ($task->priority === 'low')

                                <span class="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                    Low
                                </span>

                            @else

                                <span class="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                                    Medium
                                </span>

                            @endif

                        </div>


                        {{-- Deadline --}}
                        <div class="p-5">

                            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Deadline
                            </p>

                            <p class="mt-1.5 text-sm font-semibold text-slate-800">
                                {{ optional($task->deadline)->format('d M Y') ?? 'No deadline' }}
                            </p>

                            @if ($task->deadline && $status !== 'completed' && $task->deadline->isPast())

                                <p class="mt-1 text-xs font-semibold text-red-600">
                                    Deadline has passed.
                                </p>

                            @endif

                        </div>


                        {{-- Created By --}}
                        <div class="p-5">

                            <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Created By
                            </p>

                            <p class="mt-1.5 text-sm font-semibold text-slate-800">
                                {{ $task->creator?->name ?? 'Unknown' }}
                            </p>

                        </div>

                    </div>

                </div>


                {{-- Project shortcut --}}
                @if ($task->project)

                    <div class="rounded-2xl border border-sky-200 bg-sky-50 p-5">

                        <p class="text-xs font-bold uppercase tracking-wide text-sky-600">
                            Project
                        </p>

                        <h3 class="mt-1 text-base font-bold text-slate-900">
                            {{ $task->project->title }}
                        </h3>

                        <p class="mt-2 text-xs leading-5 text-slate-500">
                            View the complete project workspace, team, tasks and project activity.
                        </p>

                        <a
                            href="{{ route('manager.projects.show', $task->project) }}"
                            class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-900"
                        >
                            Open Project

                            <svg
                                class="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M5 12h14m-6-6l6 6-6 6"
                                />
                            </svg>

                        </a>

                    </div>

                @endif


                {{-- Delete --}}
                <div class="rounded-2xl border border-red-200 bg-white p-5">

                    <p class="text-sm font-bold text-slate-900">
                        Delete Task
                    </p>

                    <p class="mt-1 text-xs leading-5 text-slate-500">
                        Permanently remove this task. This action cannot be undone.
                    </p>

                    <form
                        method="POST"
                        action="{{ route('manager.tasks.destroy', $task) }}"
                        class="mt-4"
                        onsubmit="return confirm('Are you sure you want to delete this task?');"
                    >

                        @csrf
                        @method('DELETE')

                        <button
                            type="submit"
                            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
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
                                    d="M6 7h12M9 7V4h6v3m-7 0l1 13h6l1-13M10 11v6M14 11v6"
                                />
                            </svg>

                            Delete Task

                        </button>

                    </form>

                </div>

            </div>

        </div>

    </div>

</x-app-layout>