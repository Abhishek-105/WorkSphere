<x-app-layout>

@section('page_heading', 'Tasks')

@section('page_subtitle', 'Manage, assign and track all project tasks')

<div class="w-full">

    <div class="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {{-- ========================================================
             PAGE HEADER
        ========================================================= --}}
        <section class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
                <div class="flex items-center gap-2">

                    <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
                        Tasks
                    </h1>

                    <span class="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
                        {{ $tasks->total() }}
                    </span>

                </div>

                <p class="mt-1 text-sm text-slate-500">
                    Manage, assign and track all project tasks.
                </p>
            </div>


            <a
                href="{{ route('manager.tasks.create') }}"
                class="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                        d="M12 5.25v13.5M5.25 12h13.5"
                    />
                </svg>

                <span>Create Task</span>

            </a>

        </section>


        {{-- ========================================================
             FLASH MESSAGES
        ========================================================= --}}
        @if (session('success'))

            <div class="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">

                <svg
                    class="mt-0.5 h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.8"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m9 12.75 2.25 2.25 4.5-5.25"
                    />

                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                </svg>

                <span>{{ session('success') }}</span>

            </div>

        @endif


        @if (session('error'))

            <div class="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">

                <svg
                    class="mt-0.5 h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.8"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 8v4m0 4h.01"
                    />

                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                </svg>

                <span>{{ session('error') }}</span>

            </div>

        @endif


        {{-- ========================================================
             STATISTICS
        ========================================================= --}}
        <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <div class="rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Tasks
                </p>

                <p class="mt-2 text-3xl font-bold text-slate-900">
                    {{ $totalTasks ?? 0 }}
                </p>
            </div>


            <div class="rounded-xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Pending
                </p>

                <p class="mt-2 text-3xl font-bold text-amber-600">
                    {{ $pendingTasks ?? 0 }}
                </p>
            </div>


            <div class="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    In Progress
                </p>

                <p class="mt-2 text-3xl font-bold text-sky-600">
                    {{ $inProgressTasks ?? 0 }}
                </p>
            </div>


            <div class="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Completed
                </p>

                <p class="mt-2 text-3xl font-bold text-emerald-600">
                    {{ $completedTasks ?? 0 }}
                </p>
            </div>


            <div class="rounded-xl border border-slate-200 border-l-4 border-l-red-500 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Overdue
                </p>

                <p class="mt-2 text-3xl font-bold text-red-600">
                    {{ $overdueTasks ?? 0 }}
                </p>
            </div>

        </div>


        {{-- ========================================================
             FILTERS
        ========================================================= --}}
        <section class="mb-6 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">

            <form
                method="GET"
                action="{{ route('manager.tasks.index') }}"
                class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"
            >

                <div class="lg:col-span-2">

                    <label
                        for="search"
                        class="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Search
                    </label>

                    <input
                        type="text"
                        id="search"
                        name="search"
                        value="{{ request('search') }}"
                        placeholder="Search task title or description..."
                        class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >

                </div>


                <div>

                    <label
                        for="status"
                        class="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                        class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="">All Statuses</option>

                        <option
                            value="pending"
                            {{ request('status') === 'pending' ? 'selected' : '' }}
                        >
                            Pending
                        </option>

                        <option
                            value="in_progress"
                            {{ request('status') === 'in_progress' ? 'selected' : '' }}
                        >
                            In Progress
                        </option>

                        <option
                            value="completed"
                            {{ request('status') === 'completed' ? 'selected' : '' }}
                        >
                            Completed
                        </option>

                    </select>

                </div>


                <div>

                    <label
                        for="priority"
                        class="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Priority
                    </label>

                    <select
                        id="priority"
                        name="priority"
                        class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="">All Priorities</option>

                        <option
                            value="low"
                            {{ request('priority') === 'low' ? 'selected' : '' }}
                        >
                            Low
                        </option>

                        <option
                            value="medium"
                            {{ request('priority') === 'medium' ? 'selected' : '' }}
                        >
                            Medium
                        </option>

                        <option
                            value="high"
                            {{ request('priority') === 'high' ? 'selected' : '' }}
                        >
                            High
                        </option>

                    </select>

                </div>


                <div>

                    <label
                        for="project_id"
                        class="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Project
                    </label>

                    <select
                        id="project_id"
                        name="project_id"
                        class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="">All Projects</option>

                        @foreach ($projects as $project)

                            <option
                                value="{{ $project->id }}"
                                {{ (string) request('project_id') === (string) $project->id ? 'selected' : '' }}
                            >
                                {{ $project->title }}
                            </option>

                        @endforeach

                    </select>

                </div>


                <div class="flex items-end gap-2 md:col-span-2 lg:col-span-5">

                    <button
                        type="submit"
                        class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    >
                        Apply Filters
                    </button>

                    <a
                        href="{{ route('manager.tasks.index') }}"
                        class="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Reset
                    </a>

                </div>

            </form>

        </section>


        {{-- ========================================================
             TASK TABLE
        ========================================================= --}}
        <section class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">

            <div class="overflow-x-auto">

                <table class="min-w-[1050px] w-full divide-y divide-slate-200">

                    <thead class="bg-slate-50">

                        <tr>

                            <th class="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Task
                            </th>

                            <th class="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Project
                            </th>

                            <th class="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Assigned To
                            </th>

                            <th class="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Priority
                            </th>

                            <th class="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Status
                            </th>

                            <th class="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Deadline
                            </th>

                            <th class="whitespace-nowrap px-6 py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody class="divide-y divide-slate-200 bg-white">

                        @forelse ($tasks as $task)

                            <tr class="transition-colors hover:bg-slate-50">

                                <td class="whitespace-nowrap px-6 py-4 text-sm">

                                    <div class="min-w-0 max-w-[280px]">

                                        <a
                                            href="{{ route('manager.tasks.show', ['task' => $task->getKey()]) }}"
                                            class="block truncate font-semibold text-slate-900 transition hover:text-indigo-600"
                                        >
                                            {{ $task->title }}
                                        </a>

                                        @if ($task->description)

                                            <p class="mt-1 max-w-xs truncate text-sm text-slate-500">
                                                {{ $task->description }}
                                            </p>

                                        @endif

                                    </div>

                                </td>


                                <td class="whitespace-nowrap px-6 py-4 text-sm">

                                    @if ($task->project)

                                        <a
                                            href="{{ route('manager.projects.show', ['project' => $task->project->getKey()]) }}"
                                            class="font-medium text-indigo-600 transition hover:text-indigo-800"
                                        >
                                            {{ $task->project->title }}
                                        </a>

                                    @else

                                        <span class="text-slate-400">
                                            No Project
                                        </span>

                                    @endif

                                </td>


                                <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-700">

                                    @if ($task->assignedEmployee)

                                        {{ $task->assignedEmployee->name }}

                                    @else

                                        <span class="text-slate-400">
                                            Unassigned
                                        </span>

                                    @endif

                                </td>


                                <td class="whitespace-nowrap px-6 py-4 text-sm">

                                    @if ($task->priority === 'high')

                                        <span class="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                            High
                                        </span>

                                    @elseif ($task->priority === 'medium')

                                        <span class="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                            Medium
                                        </span>

                                    @else

                                        <span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            Low
                                        </span>

                                    @endif

                                </td>


                                <td class="whitespace-nowrap px-6 py-4 text-sm">

                                    @if ($task->status === 'completed')

                                        <span class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                            Completed
                                        </span>

                                    @elseif ($task->status === 'in_progress')

                                        <span class="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                            In Progress
                                        </span>

                                    @else

                                        <span class="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                            Pending
                                        </span>

                                    @endif

                                </td>


                                <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600">

                                    @if ($task->deadline)

                                        {{ $task->deadline->format('d M Y') }}

                                    @else

                                        <span class="text-slate-400">
                                            No deadline
                                        </span>

                                    @endif

                                </td>


                                <td class="whitespace-nowrap px-6 py-4 pr-6 text-right text-sm">

                                    <div class="flex items-center justify-end gap-2">

                                        <a
                                            href="{{ route('manager.tasks.show', ['task' => $task->getKey()]) }}"
                                            class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                        >
                                            View
                                        </a>

                                        <a
                                            href="{{ route('manager.tasks.edit', ['task' => $task->getKey()]) }}"
                                            class="inline-flex items-center rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                                        >
                                            Edit
                                        </a>

                                    </div>

                                </td>

                            </tr>

                        @empty

                            <tr>

                                <td
                                    colspan="7"
                                    class="px-6 py-14 text-center"
                                >

                                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">

                                        <svg
                                            class="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            stroke-width="1.8"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M5 4.5h14v15H5z"
                                            />

                                            <path
                                                stroke-linecap="round"
                                                d="M8 9h8M8 13h5M8 17h8"
                                            />
                                        </svg>

                                    </div>

                                    <p class="mt-4 text-sm font-semibold text-slate-800">
                                        No tasks found.
                                    </p>

                                    <p class="mt-1 text-sm text-slate-500">
                                        Create a new task or adjust your filters.
                                    </p>

                                </td>

                            </tr>

                        @endforelse

                    </tbody>

                </table>

            </div>


            {{-- Pagination --}}
            @if ($tasks->hasPages())

                <div class="border-t border-slate-200 px-6 py-4">
                    {{ $tasks->links() }}
                </div>

            @endif

        </section>

    </div>

</div>


</x-app-layout>
