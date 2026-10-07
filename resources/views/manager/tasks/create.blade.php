<x-app-layout>
    <div class="min-h-screen bg-slate-50">

        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {{-- Header --}}
            <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div class="mb-2 flex items-center gap-2 text-sm text-slate-500">
                        <a href="{{ route('manager.tasks.index') }}"
                           class="transition hover:text-slate-900">
                            Tasks
                        </a>

                        <span>/</span>

                        <span class="font-medium text-slate-700">
                            Create Task
                        </span>
                    </div>

                    <h1 class="text-2xl font-bold tracking-tight text-slate-900">
                        Create Task
                    </h1>

                    <p class="mt-1 text-sm text-slate-500">
                        Create a task and assign it to one or more project team members.
                    </p>
                </div>

                <a href="{{ route('manager.tasks.index') }}"
                   class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    ← Back to Tasks
                </a>
            </div>


            {{-- Validation Errors --}}
            @if ($errors->any())
                <div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div class="flex gap-3">
                        <div class="mt-0.5 text-red-500">
                            ⚠
                        </div>

                        <div>
                            <h3 class="text-sm font-semibold text-red-800">
                                Please fix the following errors
                            </h3>

                            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif


            {{-- Form --}}
            <form method="POST"
                  action="{{ route('manager.tasks.store') }}"
                  class="space-y-6">

                @csrf

                {{-- Main Details --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-200 px-6 py-5">
                        <h2 class="text-base font-bold text-slate-900">
                            Task Details
                        </h2>

                        <p class="mt-1 text-sm text-slate-500">
                            Define the project, task information and deadline.
                        </p>
                    </div>


                    <div class="grid gap-6 p-6 md:grid-cols-2">

                        {{-- Project --}}
                        <div>
                            <label for="project_id"
                                   class="mb-2 block text-sm font-semibold text-slate-700">
                                Project <span class="text-red-500">*</span>
                            </label>

                            <select id="project_id"
                                    name="project_id"
                                    required
                                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">

                                <option value="">
                                    Select a project
                                </option>

                                @foreach ($projects as $project)
                                    <option value="{{ $project->id }}"
                                        {{ (string) old('project_id', $selectedProjectId ?? '') === (string) $project->id ? 'selected' : '' }}>
                                        {{ $project->title }}
                                    </option>
                                @endforeach
                            </select>

                            @error('project_id')
                                <p class="mt-1.5 text-xs font-medium text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>


                        {{-- Priority --}}
                        <div>
                            <label for="priority"
                                   class="mb-2 block text-sm font-semibold text-slate-700">
                                Priority
                            </label>

                            <select id="priority"
                                    name="priority"
                                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">

                                <option value="low" {{ old('priority', 'medium') === 'low' ? 'selected' : '' }}>
                                    Low
                                </option>

                                <option value="medium" {{ old('priority', 'medium') === 'medium' ? 'selected' : '' }}>
                                    Medium
                                </option>

                                <option value="high" {{ old('priority', 'medium') === 'high' ? 'selected' : '' }}>
                                    High
                                </option>
                            </select>

                            @error('priority')
                                <p class="mt-1.5 text-xs font-medium text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>


                        {{-- Task Title --}}
                        <div class="md:col-span-2">
                            <label for="title"
                                   class="mb-2 block text-sm font-semibold text-slate-700">
                                Task Title <span class="text-red-500">*</span>
                            </label>

                            <input type="text"
                                   id="title"
                                   name="title"
                                   value="{{ old('title') }}"
                                   required
                                   placeholder="e.g. Build responsive homepage"
                                   class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200">

                            @error('title')
                                <p class="mt-1.5 text-xs font-medium text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>


                        {{-- Deadline --}}
                        <div>
                            <label for="deadline"
                                   class="mb-2 block text-sm font-semibold text-slate-700">
                                Deadline
                            </label>

                            <input type="date"
                                   id="deadline"
                                   name="deadline"
                                   value="{{ old('deadline') }}"
                                   class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200">

                            @error('deadline')
                                <p class="mt-1.5 text-xs font-medium text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror
                        </div>


                        {{-- Initial Status --}}
                        <div>
                            <label class="mb-2 block text-sm font-semibold text-slate-700">
                                Initial Status
                            </label>

                            <div class="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                                <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                    Pending
                                </span>

                                <span class="ml-3 text-xs text-slate-500">
                                    New tasks start in Pending status.
                                </span>
                            </div>
                        </div>

                    </div>
                </div>


                {{-- Team Assignment --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-200 px-6 py-5">

                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h2 class="text-base font-bold text-slate-900">
                                    Assign Team Members
                                </h2>

                                <p class="mt-1 text-sm text-slate-500">
                                    Only employees assigned to the selected project can be selected.
                                </p>
                            </div>

                            <div id="selected-count"
                                 class="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                0 employees selected
                            </div>

                        </div>
                    </div>


                    <div class="p-6">

                        <div id="employee-empty"
                             class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">

                            <div class="text-2xl">
                                👥
                            </div>

                            <p class="mt-3 text-sm font-semibold text-slate-700">
                                Select a project first
                            </p>

                            <p class="mt-1 text-xs text-slate-500">
                                Available project team members will appear here.
                            </p>

                        </div>


                        <div id="employee-list"
                             class="hidden grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        </div>


                        @error('assignees')
                            <p class="mt-3 text-xs font-medium text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                        @error('assignees.*')
                            <p class="mt-3 text-xs font-medium text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>
                </div>


                {{-- Description --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-200 px-6 py-5">
                        <h2 class="text-base font-bold text-slate-900">
                            Description
                        </h2>

                        <p class="mt-1 text-sm text-slate-500">
                            Add instructions, requirements or additional context.
                        </p>
                    </div>

                    <div class="p-6">

                        <textarea id="description"
                                  name="description"
                                  rows="7"
                                  placeholder="Describe what needs to be completed..."
                                  class="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200">{{ old('description') }}</textarea>

                        @error('description')
                            <p class="mt-1.5 text-xs font-medium text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>
                </div>


                {{-- Actions --}}
                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <a href="{{ route('manager.tasks.index') }}"
                       class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        Cancel
                    </a>

                    <button type="submit"
                            class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
                        Create Task
                    </button>

                </div>

            </form>

        </div>
    </div>


    {{-- Project Employee Data --}}
    <div id="project-employees-data"
         class="hidden"
         aria-hidden="true">

        @foreach ($projects as $project)

            <div data-project-id="{{ $project->id }}">

                @foreach ($project->employees as $employee)

                    <span
                        data-employee-id="{{ $employee->id }}"
                        data-employee-name="{{ $employee->name }}"
                        data-employee-email="{{ $employee->email }}">
                    </span>

                @endforeach

            </div>

        @endforeach

    </div>


    {{-- Previous Assignees --}}
    <div id="previous-assignees"
         class="hidden"
         aria-hidden="true">

        @foreach ((array) old('assignees', []) as $employeeId)
            <span data-employee-id="{{ $employeeId }}"></span>
        @endforeach

    </div>


    <script>
        document.addEventListener('DOMContentLoaded', function () {

            const projectSelect = document.getElementById('project_id');
            const employeeList = document.getElementById('employee-list');
            const employeeEmpty = document.getElementById('employee-empty');
            const selectedCount = document.getElementById('selected-count');

            const projectData = document.getElementById('project-employees-data');
            const previousData = document.getElementById('previous-assignees');

            function getPreviousAssignees() {
                const ids = [];

                if (!previousData) {
                    return ids;
                }

                previousData.querySelectorAll('[data-employee-id]').forEach(function (item) {
                    ids.push(String(item.dataset.employeeId));
                });

                return ids;
            }

            function updateSelectedCount() {
                const checked = employeeList.querySelectorAll(
                    'input[name="assignees[]"]:checked'
                );

                const count = checked.length;

                selectedCount.textContent =
                    count === 1
                        ? '1 employee selected'
                        : count + ' employees selected';
            }

            function renderEmployees(projectId) {

                employeeList.innerHTML = '';

                if (!projectId) {
                    employeeList.classList.add('hidden');
                    employeeEmpty.classList.remove('hidden');

                    employeeEmpty.innerHTML = `
                        <div class="text-2xl">👥</div>
                        <p class="mt-3 text-sm font-semibold text-slate-700">
                            Select a project first
                        </p>
                        <p class="mt-1 text-xs text-slate-500">
                            Available project team members will appear here.
                        </p>
                    `;

                    updateSelectedCount();

                    return;
                }

                const project = projectData.querySelector(
                    '[data-project-id="' + projectId + '"]'
                );

                if (!project) {
                    employeeList.classList.add('hidden');
                    employeeEmpty.classList.remove('hidden');

                    employeeEmpty.innerHTML = `
                        <div class="text-2xl">👤</div>
                        <p class="mt-3 text-sm font-semibold text-slate-700">
                            No team members assigned
                        </p>
                        <p class="mt-1 text-xs text-slate-500">
                            Assign employees to this project before creating tasks.
                        </p>
                    `;

                    updateSelectedCount();

                    return;
                }

                const employees = project.querySelectorAll(
                    '[data-employee-id]'
                );

                if (!employees.length) {
                    employeeList.classList.add('hidden');
                    employeeEmpty.classList.remove('hidden');

                    employeeEmpty.innerHTML = `
                        <div class="text-2xl">👤</div>
                        <p class="mt-3 text-sm font-semibold text-slate-700">
                            No team members assigned
                        </p>
                        <p class="mt-1 text-xs text-slate-500">
                            Assign employees to this project before creating tasks.
                        </p>
                    `;

                    updateSelectedCount();

                    return;
                }

                const previousAssignees = getPreviousAssignees();

                employees.forEach(function (employee) {

                    const employeeId = String(employee.dataset.employeeId);
                    const employeeName = employee.dataset.employeeName || 'Employee';
                    const employeeEmail = employee.dataset.employeeEmail || '';

                    const label = document.createElement('label');

                    label.className =
                        'group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50';

                    const checkbox = document.createElement('input');

                    checkbox.type = 'checkbox';
                    checkbox.name = 'assignees[]';
                    checkbox.value = employeeId;
                    checkbox.className =
                        'h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400';

                    checkbox.checked = previousAssignees.includes(employeeId);

                    checkbox.addEventListener('change', updateSelectedCount);

                    const avatar = document.createElement('div');

                    avatar.className =
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white';

                    avatar.textContent =
                        employeeName.charAt(0).toUpperCase();

                    const content = document.createElement('div');

                    content.className = 'min-w-0 flex-1';

                    const name = document.createElement('div');

                    name.className =
                        'truncate text-sm font-semibold text-slate-800';

                    name.textContent = employeeName;

                    const email = document.createElement('div');

                    email.className =
                        'mt-0.5 truncate text-xs text-slate-500';

                    email.textContent = employeeEmail;

                    content.appendChild(name);
                    content.appendChild(email);

                    label.appendChild(checkbox);
                    label.appendChild(avatar);
                    label.appendChild(content);

                    employeeList.appendChild(label);
                });

                employeeList.classList.remove('hidden');
                employeeEmpty.classList.add('hidden');

                updateSelectedCount();
            }

            projectSelect.addEventListener('change', function () {
                renderEmployees(projectSelect.value);
            });

            if (projectSelect.value) {
                renderEmployees(projectSelect.value);
            }
        });
    </script>
</x-app-layout>