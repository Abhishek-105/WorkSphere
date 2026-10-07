@extends('layouts.app')

@section('title', 'Edit Task')

@section('page_heading', 'Edit Task')

@section('page_subtitle', 'Update task details, assignment, priority and workflow status')

@section('content')

<div class="w-full">

    {{-- ============================================================
         PAGE HEADER
    ============================================================= --}}
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div class="flex min-w-0 items-start gap-3">

            <a
                href="{{ route('manager.tasks.show', $task) }}"
                class="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Back to task"
            >
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
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </a>

            <div class="min-w-0">

                <p class="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Task Management
                </p>

                <h1 class="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900">
                    Edit Task
                </h1>

                <p class="mt-1 max-w-2xl text-sm text-slate-500">
                    Update the task information and keep the assigned team members,
                    deadline and workflow status synchronized.
                </p>

            </div>

        </div>

        <a
            href="{{ route('manager.tasks.show', $task) }}"
            class="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
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
                    d="M15 19l-7-7 7-7"
                />
            </svg>

            Back to Task
        </a>

    </div>


    {{-- ============================================================
         VALIDATION ERRORS
    ============================================================= --}}
    @if ($errors->any())

        <div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

            <div class="flex items-start gap-3">

                <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">

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
                            d="M12 9v3.75m0 3h.007M10.29 3.86l-7.1 12.28A1.75 1.75 0 004.71 18.75h14.58a1.75 1.75 0 001.52-2.61L13.71 3.86a1.75 1.75 0 00-3.42 0z"
                        />
                    </svg>

                </div>

                <div>

                    <p class="text-sm font-bold text-red-800">
                        Please correct the following errors:
                    </p>

                    <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">

                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach

                    </ul>

                </div>

            </div>

        </div>

    @endif


    {{-- ============================================================
         MAIN FORM
    ============================================================= --}}
    <form
        method="POST"
        action="{{ route('manager.tasks.update', $task) }}"
        class="space-y-6"
    >

        @csrf
        @method('PUT')


        {{-- ========================================================
             TASK DETAILS
        ========================================================= --}}
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-200 bg-gradient-to-r from-indigo-50/70 via-white to-white px-6 py-5">

                <div class="flex items-center gap-3">

                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">

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
                                d="M9 5h6m-9 4h12M6 13h12M6 17h8"
                            />
                        </svg>

                    </div>

                    <div>

                        <h2 class="text-base font-bold text-slate-900">
                            Task Details
                        </h2>

                        <p class="mt-0.5 text-xs text-slate-500">
                            Core information about this task.
                        </p>

                    </div>

                </div>

            </div>


            <div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">

                {{-- Project --}}
                <div>

                    <label
                        for="project_id"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Project <span class="text-red-500">*</span>
                    </label>

                    <select
                        id="project_id"
                        name="project_id"
                        required
                        class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                        <option value="">
                            Select Project
                        </option>

                        @foreach ($projects as $project)

                            <option
                                value="{{ $project->id }}"
                                {{ (string) old('project_id', $task->project_id) === (string) $project->id ? 'selected' : '' }}
                            >
                                {{ $project->title }}
                            </option>

                        @endforeach

                    </select>

                    <p class="mt-2 text-xs text-slate-500">
                        Only active and available projects should receive new task work.
                    </p>

                </div>


                {{-- Task Title --}}
                <div>

                    <label
                        for="title"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Task Title <span class="text-red-500">*</span>
                    </label>

                    <input
                        id="title"
                        type="text"
                        name="title"
                        value="{{ old('title', $task->title) }}"
                        required
                        maxlength="255"
                        placeholder="Enter task title"
                        class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                </div>


                {{-- Description --}}
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
                        placeholder="Describe the task, expected work, requirements or notes..."
                        class="block w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >{{ old('description', $task->description) }}</textarea>

                </div>

            </div>

        </section>


        {{-- ============================================================
             WORKFLOW
        ============================================================= --}}
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-200 bg-gradient-to-r from-sky-50/70 via-white to-white px-6 py-5">

                <div class="flex items-center gap-3">

                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">

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
                                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                            />
                        </svg>

                    </div>

                    <div>

                        <h2 class="text-base font-bold text-slate-900">
                            Workflow
                        </h2>

                        <p class="mt-0.5 text-xs text-slate-500">
                            Control priority, deadline and current task status.
                        </p>

                    </div>

                </div>

            </div>


            <div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">

                {{-- Status --}}
                <div>

                    <label
                        for="status"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Status <span class="text-red-500">*</span>
                    </label>

                    <select
                        id="status"
                        name="status"
                        required
                        class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                        <option
                            value="pending"
                            {{ old('status', $task->status) === 'pending' ? 'selected' : '' }}
                        >
                            Pending
                        </option>

                        <option
                            value="in_progress"
                            {{ old('status', $task->status) === 'in_progress' ? 'selected' : '' }}
                        >
                            In Progress
                        </option>

                        <option
                            value="completed"
                            {{ old('status', $task->status) === 'completed' ? 'selected' : '' }}
                        >
                            Completed
                        </option>

                    </select>

                </div>


                {{-- Priority --}}
                <div>

                    <label
                        for="priority"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Priority <span class="text-red-500">*</span>
                    </label>

                    <select
                        id="priority"
                        name="priority"
                        required
                        class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                        <option
                            value="low"
                            {{ old('priority', $task->priority) === 'low' ? 'selected' : '' }}
                        >
                            Low
                        </option>

                        <option
                            value="medium"
                            {{ old('priority', $task->priority) === 'medium' ? 'selected' : '' }}
                        >
                            Medium
                        </option>

                        <option
                            value="high"
                            {{ old('priority', $task->priority) === 'high' ? 'selected' : '' }}
                        >
                            High
                        </option>

                    </select>

                </div>


                {{-- Deadline --}}
                <div>

                    <label
                        for="deadline"
                        class="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Deadline
                    </label>

                    <input
                        id="deadline"
                        type="date"
                        name="deadline"
                        value="{{ old('deadline', optional($task->deadline)->format('Y-m-d')) }}"
                        class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                </div>

            </div>

        </section>


        {{-- ============================================================
             ASSIGN TEAM MEMBERS
        ============================================================= --}}
        <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-200 bg-gradient-to-r from-violet-50/70 via-white to-white px-6 py-5">

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div class="flex items-center gap-3">

                        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">

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
                                    d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m7-10a4 4 0 100-8 4 4 0 000 8zm7-5a4 4 0 100 8m4 5v-2a4 4 0 00-3-3.87"
                                />
                            </svg>

                        </div>

                        <div>

                            <h2 class="text-base font-bold text-slate-900">
                                Assign Team Members
                            </h2>

                            <p class="mt-0.5 text-xs text-slate-500">
                                Select one or more employees from the selected project.
                            </p>

                        </div>

                    </div>


                    <div
                        id="selected-members-count"
                        class="inline-flex w-fit items-center rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700"
                    >
                        0 employees selected
                    </div>

                </div>

            </div>


            <div class="p-6">

                <div
                    id="employee-selection"
                    class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                        Select a project to view its team members.
                    </div>
                </div>

            </div>

        </section>


        {{-- ============================================================
             FORM ACTIONS
        ============================================================= --}}
        <div class="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-slate-100/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">

            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                <a
                    href="{{ route('manager.tasks.show', $task) }}"
                    class="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
                >
                    Cancel
                </a>


                <button
                    type="submit"
                    class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
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
                            d="M5 12.75l4 4L19 7"
                        />
                    </svg>

                    Save Task Changes

                </button>

            </div>

        </div>

    </form>


    {{-- ============================================================
         PROJECT / EMPLOYEE DATA
         No Blade expressions inside JavaScript.
    ============================================================= --}}
    <div
        id="project-employees-data"
        class="hidden"
        aria-hidden="true"
    >

        @foreach ($projects as $project)

            <div data-project-id="{{ $project->id }}">

                @foreach ($project->employees as $employee)

                    <span
                        data-employee-id="{{ $employee->id }}"
                        data-employee-name="{{ $employee->name }}"
                        data-employee-email="{{ $employee->email }}"
                    ></span>

                @endforeach

            </div>

        @endforeach

    </div>


    <div
        id="current-task-assignees"
        class="hidden"
        aria-hidden="true"
    >

        @foreach ($assignedEmployeeIds as $employeeId)

            <span
                data-employee-id="{{ $employeeId }}"
            ></span>

        @endforeach

    </div>

</div>


@push('scripts')

<script>
document.addEventListener('DOMContentLoaded', function () {

    const projectSelect = document.getElementById('project_id');
    const employeeSelection = document.getElementById('employee-selection');
    const selectedCount = document.getElementById('selected-members-count');

    const projectData = document.getElementById('project-employees-data');
    const currentAssignees = document.getElementById('current-task-assignees');

    if (
        !projectSelect ||
        !employeeSelection ||
        !selectedCount ||
        !projectData ||
        !currentAssignees
    ) {
        return;
    }

    const getCurrentAssigneeIds = function () {
        return Array.from(
            currentAssignees.querySelectorAll('[data-employee-id]')
        ).map(function (element) {
            return String(element.dataset.employeeId);
        });
    };

    const getProjectEmployees = function (projectId) {

        const project = Array.from(
            projectData.children
        ).find(function (element) {
            return String(element.dataset.projectId) === String(projectId);
        });

        if (!project) {
            return [];
        }

        return Array.from(
            project.querySelectorAll('[data-employee-id]')
        ).map(function (element) {

            return {
                id: String(element.dataset.employeeId),
                name: element.dataset.employeeName || 'Unknown Employee',
                email: element.dataset.employeeEmail || ''
            };

        });
    };

    const updateSelectedCount = function () {

        const checked = employeeSelection.querySelectorAll(
            'input[name="assignees[]"]:checked'
        );

        const count = checked.length;

        selectedCount.textContent =
            count === 1
                ? '1 employee selected'
                : count + ' employees selected';
    };

    const renderEmployees = function (preserveExistingSelection) {

        const projectId = projectSelect.value;

        employeeSelection.innerHTML = '';

        if (!projectId) {

            employeeSelection.innerHTML = `
                <div class="sm:col-span-2 xl:col-span-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Select a project to view its team members.
                </div>
            `;

            updateSelectedCount();

            return;
        }

        const employees = getProjectEmployees(projectId);

        if (!employees.length) {

            employeeSelection.innerHTML = `
                <div class="sm:col-span-2 xl:col-span-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-8 text-center">
                    <p class="text-sm font-semibold text-amber-800">
                        No active employees are assigned to this project.
                    </p>

                    <p class="mt-1 text-xs text-amber-700">
                        Add employees to the project before assigning this task.
                    </p>
                </div>
            `;

            updateSelectedCount();

            return;
        }

        const currentIds = preserveExistingSelection
            ? getCurrentAssigneeIds()
            : [];

        employees.forEach(function (employee) {

            const wrapper = document.createElement('label');

            wrapper.className =
                'group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-violet-300 hover:bg-violet-50/40';

            const checkbox = document.createElement('input');

            checkbox.type = 'checkbox';
            checkbox.name = 'assignees[]';
            checkbox.value = employee.id;

            checkbox.className =
                'h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500';

            if (currentIds.includes(employee.id)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', updateSelectedCount);

            const avatar = document.createElement('div');

            avatar.className =
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700';

            avatar.textContent =
                employee.name
                    .trim()
                    .charAt(0)
                    .toUpperCase();

            const details = document.createElement('div');

            details.className =
                'min-w-0 flex-1';

            const name = document.createElement('p');

            name.className =
                'truncate text-sm font-semibold text-slate-800';

            name.textContent =
                employee.name;

            const email = document.createElement('p');

            email.className =
                'truncate text-xs text-slate-500';

            email.textContent =
                employee.email;

            details.appendChild(name);
            details.appendChild(email);

            wrapper.appendChild(checkbox);
            wrapper.appendChild(avatar);
            wrapper.appendChild(details);

            employeeSelection.appendChild(wrapper);

        });

        updateSelectedCount();
    };

    projectSelect.addEventListener('change', function () {
        renderEmployees(false);
    });

    renderEmployees(true);
});
</script>

@endpush

@endsection