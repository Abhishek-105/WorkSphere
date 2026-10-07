@extends('layouts.app')

@section('title', $task->title)
@section('page_heading', 'Task Details')
@section('page_subtitle', 'View task information and update progress')

@section('content')

@php
    $normalizedStatus = match (strtolower(trim((string) $task->status))) {
        'in progress',
        'in-progress',
        'in_progress' => 'in_progress',

        'done',
        'complete',
        'completed' => 'completed',

        default => 'pending',
    };

    $statusLabel = match ($normalizedStatus) {
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        default => 'Pending',
    };

    $statusClasses = match ($normalizedStatus) {
        'completed' => 'bg-emerald-100 text-emerald-700',
        'in_progress' => 'bg-sky-100 text-sky-700',
        default => 'bg-amber-100 text-amber-700',
    };

    $priority = strtolower((string) ($task->priority ?? 'medium'));

    $priorityClasses = match ($priority) {
        'high' => 'bg-rose-100 text-rose-700',
        'low' => 'bg-slate-100 text-slate-700',
        default => 'bg-amber-100 text-amber-700',
    };
@endphp

<div class="mx-auto max-w-5xl space-y-6">

    {{-- Header --}}
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div class="flex flex-col justify-between gap-5 md:flex-row md:items-start">

            <div>

                <p class="text-sm font-semibold text-indigo-600">
                    {{ $task->project?->title ?? 'No Project' }}
                </p>

                <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {{ $task->title }}
                </h1>

                <p class="mt-2 text-sm text-slate-500">
                    Created {{ $task->created_at?->format('d M Y') }}
                </p>

            </div>

            <span class="inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold {{ $statusClasses }}">
                {{ $statusLabel }}
            </span>

        </div>

    </div>


    {{-- Main Information --}}
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {{-- Description --}}
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <h2 class="text-lg font-semibold text-slate-900">
                Description
            </h2>

            <div class="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                {{ $task->description ?: 'No description provided.' }}
            </div>

        </div>


        {{-- Task Information --}}
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 class="text-lg font-semibold text-slate-900">
                Task Information
            </h2>

            <div class="mt-5 space-y-5 text-sm">

                {{-- Priority --}}
                <div>

                    <p class="text-slate-500">
                        Priority
                    </p>

                    <span class="mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold {{ $priorityClasses }}">
                        {{ ucfirst($task->priority ?? 'Medium') }}
                    </span>

                </div>


                {{-- Due Date --}}
                <div>

                    <p class="text-slate-500">
                        Due Date
                    </p>

                    <p class="mt-1 font-semibold text-slate-900">
                        {{ $task->deadline?->format('d M Y') ?? 'Not set' }}
                    </p>

                </div>


                {{-- Started --}}
                <div>

                    <p class="text-slate-500">
                        Started
                    </p>

                    <p class="mt-1 font-semibold text-slate-900">
                        {{ $task->started_at?->format('d M Y H:i') ?? 'Not started' }}
                    </p>

                </div>


                {{-- Completed --}}
                <div>

                    <p class="text-slate-500">
                        Completed
                    </p>

                    <p class="mt-1 font-semibold text-slate-900">
                        {{ $task->completed_at?->format('d M Y H:i') ?? 'Not completed' }}
                    </p>

                </div>

            </div>

        </div>

    </div>


    {{-- Status Update --}}
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

            <div>

                <h2 class="text-lg font-semibold text-slate-900">
                    Update Task Status
                </h2>

                <p class="mt-1 text-sm text-slate-500">
                    Update your current progress on this task.
                </p>

            </div>

            @if ($normalizedStatus === 'completed')

                <span class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Task Completed
                </span>

            @endif

        </div>


        <form
            method="POST"
            action="{{ route('employee.tasks.updateStatus', ['task' => $task]) }}"
            class="mt-5 flex flex-col gap-4 sm:flex-row"
        >

            @csrf
            @method('PATCH')

            <select
                name="status"
                class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >

                <option
                    value="pending"
                    @selected($normalizedStatus === 'pending')
                >
                    Pending
                </option>

                <option
                    value="in_progress"
                    @selected($normalizedStatus === 'in_progress')
                >
                    In Progress
                </option>

                <option
                    value="completed"
                    @selected($normalizedStatus === 'completed')
                >
                    Completed
                </option>

            </select>


            <button
                type="submit"
                class="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Update Status
            </button>

        </form>

    </div>

</div>

@endsection
