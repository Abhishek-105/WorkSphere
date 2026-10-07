<x-app-layout>


@section('page_heading', 'Projects')

@section('page_subtitle', 'Manage projects and workspace delivery')

<div class="w-full">

    <div class="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {{-- ========================================================
             PAGE HEADER
        ========================================================= --}}
        <section class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
                <div class="flex items-center gap-2">

                    <h2 class="text-2xl font-semibold tracking-tight text-slate-900">
                        Projects
                    </h2>

                    <span class="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
                        {{ $projects->count() }}
                    </span>

                </div>

                <p class="mt-1 text-sm text-slate-500">
                    Create, monitor and manage your team's projects.
                </p>
            </div>

            <a
                href="{{ route('manager.projects.create') }}"
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

                <span>New Project</span>

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
             FILTER / TOOLBAR
        ========================================================= --}}
        <section class="mb-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">

            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div class="flex flex-1 flex-col gap-3 sm:flex-row">

                    {{-- Search --}}
                    <div class="relative min-w-0 flex-1">

                        <svg
                            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="1.8"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                            />
                        </svg>

                        <input
                            type="text"
                            placeholder="Search projects..."
                            class="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >

                    </div>


                    {{-- Status --}}
                    <div class="sm:w-44">

                        <label
                            for="project-status"
                            class="sr-only"
                        >
                            Filter by status
                        </label>

                        <select
                            id="project-status"
                            class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="">All statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                        </select>

                    </div>

                </div>


                <div class="flex shrink-0 items-center gap-2">

                    <span class="text-xs text-slate-500">
                        {{ $projects->count() }} projects
                    </span>

                </div>

            </div>

        </section>


        {{-- ========================================================
             PROJECT TABLE
        ========================================================= --}}
        <section class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">

            @if ($projects->isNotEmpty())

                <div class="overflow-x-auto">

                    <table class="w-full min-w-[760px] table-auto text-sm">

                        <thead class="border-b border-slate-200 bg-slate-50/80">

                            <tr class="text-left">

                                <th class="w-[30%] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Project
                                </th>

                                <th class="w-[20%] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Created By
                                </th>

                                <th class="w-[15%] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th class="w-[15%] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Created
                                </th>

                                <th class="w-[20%] px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody class="divide-y divide-slate-100">

                            @foreach ($projects as $project)

                                <tr class="group transition-colors hover:bg-slate-50/80">

                                    {{-- Project --}}
                                    <td class="max-w-[320px] px-6 py-4">

                                        <div class="flex min-w-0 items-center gap-3">

                                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">

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
                                                        d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7Z"
                                                    />
                                                </svg>

                                            </div>


                                            <div class="min-w-0">

                                                {{-- IMPORTANT:
                                                     projects.title is the canonical
                                                     project name field.
                                                --}}
                                                <a
                                                    href="{{ route('manager.projects.show', $project) }}"
                                                    class="block truncate font-semibold text-slate-800 transition hover:text-indigo-600"
                                                    title="{{ $project->title }}"
                                                >
                                                    {{ $project->title }}
                                                </a>


                                                {{-- Description is only a subtitle --}}
                                                @if (!empty($project->description))

                                                    <p
                                                        class="mt-0.5 max-w-[280px] truncate text-xs text-slate-400"
                                                        title="{{ $project->description }}"
                                                    >
                                                        {{ $project->description }}
                                                    </p>

                                                @else

                                                    <p class="mt-0.5 text-xs text-slate-400">
                                                        No description
                                                    </p>

                                                @endif

                                            </div>

                                        </div>

                                    </td>


                                    {{-- Creator --}}
                                    <td class="max-w-[180px] px-6 py-4">

                                        <div class="flex min-w-0 items-center gap-2.5">

                                            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
                                                {{ strtoupper(substr($project->creator->name ?? 'U', 0, 1)) }}
                                            </div>

                                            <span class="truncate text-sm text-slate-600">
                                                {{ $project->creator->name ?? '—' }}
                                            </span>

                                        </div>

                                    </td>


                                    {{-- Status --}}
                                    <td class="px-6 py-4">

                                        @php
                                            $projectStatus = strtolower($project->status ?? '');
                                        @endphp


                                        @if ($projectStatus === 'active')

                                            <span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">

                                                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>

                                                Active

                                            </span>

                                        @elseif ($projectStatus === 'completed')

                                            <span class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">

                                                <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>

                                                Completed

                                            </span>

                                        @elseif ($projectStatus === 'on-hold')

                                            <span class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">

                                                <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>

                                                On Hold

                                            </span>

                                        @else

                                            <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">

                                                <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>

                                                {{ $project->status ?? 'Unknown' }}

                                            </span>

                                        @endif

                                    </td>


                                    {{-- Created --}}
                                    <td class="whitespace-nowrap px-6 py-4 text-xs text-slate-500">

                                        {{ $project->created_at?->format('d M Y') ?? '—' }}

                                    </td>


                                    {{-- Actions --}}
                                    <td class="px-6 py-4">

                                        <div class="flex items-center justify-end gap-1">

                                            {{-- View --}}
                                            <a
                                                href="{{ route('manager.projects.show', $project) }}"
                                                class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                                title="View project"
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
                                                        d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z"
                                                    />

                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="2.5"
                                                    />
                                                </svg>

                                                <span class="hidden sm:inline">
                                                    View
                                                </span>

                                            </a>


                                            {{-- Edit --}}
                                            <a
                                                href="{{ route('manager.projects.edit', $project) }}"
                                                class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                                                title="Edit project"
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
                                                        d="m16.862 4.487 2.651 2.651M4 20h4l10.5-10.5a1.875 1.875 0 0 0-2.652-2.652L5.35 17.348 4 20Z"
                                                    />
                                                </svg>

                                                <span class="hidden sm:inline">
                                                    Edit
                                                </span>

                                            </a>


                                            {{-- Delete --}}
                                            <form
                                                method="POST"
                                                action="{{ route('manager.projects.destroy', $project) }}"
                                                onsubmit="return confirm('Are you sure you want to delete this project?');"
                                            >

                                                @csrf
                                                @method('DELETE')

                                                <button
                                                    type="submit"
                                                    class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                                                    title="Delete project"
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
                                                            d="M4.5 7.5h15M9.5 10.5v6M14.5 10.5v6M6.75 7.5l.75 12h9l.75-12M9 7.5V5.25A1.25 1.25 0 0 1 10.25 4h3.5A1.25 1.25 0 0 1 15 5.25V7.5"
                                                        />
                                                    </svg>

                                                    <span class="hidden sm:inline">
                                                        Delete
                                                    </span>

                                                </button>

                                            </form>

                                        </div>

                                    </td>

                                </tr>

                            @endforeach

                        </tbody>

                    </table>

                </div>

            @else

                {{-- ====================================================
                     EMPTY STATE
                ===================================================== --}}
                <div class="px-6 py-16 text-center">

                    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

                        <svg
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="1.7"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7Z"
                            />
                        </svg>

                    </div>

                    <h3 class="mt-4 text-sm font-semibold text-slate-900">
                        No projects found
                    </h3>

                    <p class="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                        Create your first project to start organizing work, assigning tasks and tracking delivery.
                    </p>

                    <a
                        href="{{ route('manager.projects.create') }}"
                        class="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
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

                        Create Project

                    </a>

                </div>

            @endif

        </section>

    </div>

</div>


</x-app-layout>
