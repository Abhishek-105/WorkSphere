@extends('layouts.app')

@section('title', 'Edit Project')

@section('page_heading', 'Edit Project')

@section('page_subtitle', 'Update project details, timeline and team assignments')

@section('content')

<div class="w-full">

    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div class="flex min-w-0 items-start gap-3">

            <a
                href="{{ route('manager.projects.show', $project) }}"
                class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Back to project"
            >
                <svg
                    class="h-5 w-5"
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

            <div class="min-w-0">

                <p class="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Project Management
                </p>

                <h1 class="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">
                    Edit Project
                </h1>

                <p class="mt-1 text-sm text-slate-500">
                    Update the project and keep its team assignments synchronized.
                </p>

            </div>

        </div>

        <a
            href="{{ route('manager.projects.show', $project) }}"
            class="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
            View Project
        </a>

    </div>


    @if ($errors->any())

        <div class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p class="text-sm font-bold text-red-800">
                Please correct the following errors.
            </p>

            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">

                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach

            </ul>

        </div>

    @endif


    <form
        method="POST"
        action="{{ route('manager.projects.update', $project) }}"
        class="space-y-6"
    >

        @csrf
        @method('PUT')


        {{-- Project Details --}}
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-white to-white px-6 py-5">

                <h2 class="text-base font-bold text-slate-900">
                    Project Details
                </h2>

                <p class="mt-1 text-xs text-slate-500">
                    Basic project information and timeline.
                </p>

            </div>


            <div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">

                <div class="lg:col-span-2">

                    <label
                        for="title"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Project Title <span class="text-red-500">*</span>
                    </label>

                    <input
                        id="title"
                        type="text"
                        name="title"
                        value="{{ old('title', $project->title) }}"
                        required
                        maxlength="255"
                        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                </div>


                <div class="lg:col-span-2">

                    <label
                        for="description"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows="5"
                        class="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >{{ old('description', $project->description) }}</textarea>

                </div>


                <div>

                    <label
                        for="start_date"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Start Date <span class="text-red-500">*</span>
                    </label>

                    <input
                        id="start_date"
                        type="date"
                        name="start_date"
                        value="{{ old('start_date', optional($project->start_date)->format('Y-m-d')) }}"
                        required
                        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                </div>


                <div>

                    <label
                        for="end_date"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        End Date <span class="text-red-500">*</span>
                    </label>

                    <input
                        id="end_date"
                        type="date"
                        name="end_date"
                        value="{{ old('end_date', optional($project->end_date)->format('Y-m-d')) }}"
                        required
                        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                </div>


                <div>

                    <label
                        for="status"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Project Status <span class="text-red-500">*</span>
                    </label>

                    <select
                        id="status"
                        name="status"
                        required
                        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                        <option
                            value="active"
                            {{ old('status', $project->status) === 'active' ? 'selected' : '' }}
                        >
                            Active
                        </option>

                        <option
                            value="on-hold"
                            {{ old('status', $project->status) === 'on-hold' ? 'selected' : '' }}
                        >
                            On Hold
                        </option>

                        <option
                            value="completed"
                            {{ old('status', $project->status) === 'completed' ? 'selected' : '' }}
                        >
                            Completed
                        </option>

                    </select>

                </div>

            </div>

        </section>


        {{-- Project Team --}}
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-200 bg-gradient-to-r from-violet-50/70 via-white to-white px-6 py-5">

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h2 class="text-base font-bold text-slate-900">
                            Project Team
                        </h2>

                        <p class="mt-1 text-xs text-slate-500">
                            Select the employees who are part of this project.
                        </p>

                    </div>

                    <span
                        id="selected-count"
                        class="inline-flex w-fit rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700"
                    >
                        0 employees selected
                    </span>

                </div>

            </div>


            <div class="p-6">

                @if ($employees->count())

                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                        @foreach ($employees as $employee)

                            @php
                                $isSelected = in_array(
                                    (int) $employee->id,
                                    array_map('intval', $assignedEmployeeIds),
                                    true
                                );
                            @endphp

                            <label
                                class="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-violet-300 hover:bg-violet-50/40"
                            >

                                <input
                                    type="checkbox"
                                    name="employees[]"
                                    value="{{ $employee->id }}"
                                    class="employee-checkbox h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                    {{ old('employees') !== null
                                        ? (in_array($employee->id, old('employees', [])) ? 'checked' : '')
                                        : ($isSelected ? 'checked' : '') }}
                                >

                                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                                    {{ strtoupper(substr($employee->name, 0, 1)) }}
                                </div>

                                <div class="min-w-0">

                                    <p class="truncate text-sm font-semibold text-slate-800">
                                        {{ $employee->name }}
                                    </p>

                                    <p class="truncate text-xs text-slate-500">
                                        {{ $employee->designation ?: $employee->email }}
                                    </p>

                                </div>

                            </label>

                        @endforeach

                    </div>

                @else

                    <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">

                        <p class="text-sm font-semibold text-slate-700">
                            No active employees available.
                        </p>

                        <p class="mt-1 text-xs text-slate-500">
                            Add active employees before assigning a project team.
                        </p>

                    </div>

                @endif

            </div>

        </section>


        {{-- Actions --}}
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <a
                href="{{ route('manager.projects.show', $project) }}"
                class="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
            >
                Cancel
            </a>

            <button
                type="submit"
                class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
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
                        d="M5 12.75l4 4L19 7"
                    />
                </svg>

                Save Project Changes

            </button>

        </div>

    </form>

</div>


@push('scripts')

<script>
document.addEventListener('DOMContentLoaded', function () {

    const checkboxes = document.querySelectorAll('.employee-checkbox');
    const selectedCount = document.getElementById('selected-count');

    if (!selectedCount) {
        return;
    }

    const updateCount = function () {

        const selected = document.querySelectorAll(
            '.employee-checkbox:checked'
        ).length;

        selectedCount.textContent =
            selected === 1
                ? '1 employee selected'
                : selected + ' employees selected';
    };

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', updateCount);
    });

    updateCount();
});
</script>

@endpush

@endsection