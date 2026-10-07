@extends('layouts.app')

@section('title', 'My Tasks')
@section('page_heading', 'My Tasks')
@section('page_subtitle', 'Tasks assigned to you across your projects')

@section('content')

<div class="space-y-6">

    {{-- Statistics --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">All Tasks</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">
                {{ $counts['all'] }}
            </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Pending</p>
            <p class="mt-2 text-3xl font-bold text-amber-600">
                {{ $counts['pending'] }}
            </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">In Progress</p>
            <p class="mt-2 text-3xl font-bold text-blue-600">
                {{ $counts['in_progress'] }}
            </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p class="text-sm font-medium text-slate-500">Completed</p>
            <p class="mt-2 text-3xl font-bold text-emerald-600">
                {{ $counts['done'] }}
            </p>
        </div>

    </div>

    {{-- Filters --}}
    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <form
            method="GET"
            action="{{ route('employee.tasks.index') }}"
            class="grid grid-cols-1 gap-4 md:grid-cols-4"
        >

            <input
                type="text"
                name="search"
                value="{{ request('search') }}"
                placeholder="Search tasks..."
                class="rounded-xl border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >

            <select
                name="status"
                class="rounded-xl border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
                <option value="">All Statuses</option>
                <option value="Pending" @selected(request('status') === 'Pending')>
                    Pending
                </option>
                <option value="In Progress" @selected(request('status') === 'In Progress')>
                    In Progress
                </option>
                <option value="Done" @selected(request('status') === 'Done')>
                    Done
                </option>
            </select>

            <select
                name="priority"
                class="rounded-xl border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
                <option value="">All Priorities</option>
                <option value="low" @selected(request('priority') === 'low')>
                    Low
                </option>
                <option value="medium" @selected(request('priority') === 'medium')>
                    Medium
                </option>
                <option value="high" @selected(request('priority') === 'high')>
                    High
                </option>
            </select>

            <button
                type="submit"
                class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
                Filter Tasks
            </button>

        </form>

    </div>

    {{-- Task Table --}}
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div class="overflow-x-auto">

            <table class="min-w-full divide-y divide-slate-200">

                <thead class="bg-slate-50">

                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Task
                        </th>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Project
                        </th>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Priority
                        </th>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Due Date
                        </th>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                        </th>

                        <th class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Action
                        </th>
                    </tr>

                </thead>

                <tbody class="divide-y divide-slate-100">

                    @forelse($tasks as $task)

                        <tr class="hover:bg-slate-50">

                            <td class="px-6 py-4">

                                <a
                                    href="{{ route('employee.tasks.show', $task) }}"
                                    class="font-semibold text-slate-900 hover:text-indigo-600"
                                >
                                    {{ $task->title }}
                                </a>

                                @if($task->description)
                                    <p class="mt-1 max-w-md truncate text-sm text-slate-500">
                                        {{ $task->description }}
                                    </p>
                                @endif

                            </td>

                            <td class="px-6 py-4 text-sm text-slate-600">
                                {{ $task->project?->title ?? 'No Project' }}
                            </td>

                            <td class="px-6 py-4">

                                @php
                                    $priorityClasses = match($task->priority) {
                                        'high' => 'bg-red-100 text-red-700',
                                        'medium' => 'bg-amber-100 text-amber-700',
                                        default => 'bg-slate-100 text-slate-700',
                                    };
                                @endphp

                                <span class="rounded-full px-3 py-1 text-xs font-semibold {{ $priorityClasses }}">
                                    {{ ucfirst($task->priority ?? 'low') }}
                                </span>

                            </td>

                            <td class="px-6 py-4 text-sm text-slate-600">
                                {{ $task->deadline?->format('d M Y') ?? '—' }}
                            </td>

                            <td class="px-6 py-4">

                                @php
                                    $statusClasses = match($task->status) {
                                        'Done' => 'bg-emerald-100 text-emerald-700',
                                        'In Progress' => 'bg-blue-100 text-blue-700',
                                        default => 'bg-amber-100 text-amber-700',
                                    };
                                @endphp

                                <span class="rounded-full px-3 py-1 text-xs font-semibold {{ $statusClasses }}">
                                    {{ $task->status }}
                                </span>

                            </td>

                            <td class="px-6 py-4 text-right">

                                <a
                                    href="{{ route('employee.tasks.show', $task) }}"
                                    class="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                    View
                                </a>

                            </td>

                        </tr>

                    @empty

                        <tr>
                            <td colspan="6" class="px-6 py-16 text-center">

                                <div class="mx-auto max-w-md">

                                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                        <span class="text-xl">✓</span>
                                    </div>

                                    <h3 class="mt-4 text-lg font-semibold text-slate-900">
                                        No tasks found
                                    </h3>

                                    <p class="mt-1 text-sm text-slate-500">
                                        You currently don't have any tasks matching these filters.
                                    </p>

                                </div>

                            </td>
                        </tr>

                    @endforelse

                </tbody>

            </table>

        </div>

        @if($tasks->hasPages())
            <div class="border-t border-slate-200 px-6 py-4">
                {{ $tasks->links() }}
            </div>
        @endif

    </div>

</div>

@endsection