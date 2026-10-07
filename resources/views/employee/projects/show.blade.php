<x-app-layout>

    <div class="mx-auto max-w-7xl space-y-6">

        {{-- Back --}}
        <a
            href="{{ route('employee.projects.index') }}"
            class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
            ← Back to projects
        </a>


        {{-- Project Header --}}
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div class="bg-slate-900 px-6 py-8 md:px-8">

                <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                    <div class="flex min-w-0 items-start gap-4">

                        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                            📁
                        </div>

                        <div class="min-w-0">

                            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Project
                            </p>

                            <h1 class="mt-1 break-words text-3xl font-bold text-white">
                                {{ $project->name }}
                            </h1>

                            <p class="mt-2 text-sm text-slate-400">
                                Managed by
                                <span class="font-medium text-slate-200">
                                    {{ $project->creator?->name ?? 'Manager' }}
                                </span>
                            </p>

                        </div>

                    </div>


                    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">

                        <div class="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur">

                            <p class="text-xs text-slate-400">
                                My Tasks
                            </p>

                            <p class="mt-1 text-xl font-bold text-white">
                                {{ $project->tasks->count() }}
                            </p>

                        </div>


                        <div class="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur">

                            <p class="text-xs text-slate-400">
                                Team
                            </p>

                            <p class="mt-1 text-xl font-bold text-white">
                                {{ $project->employees->count() }}
                            </p>

                        </div>


                        <div class="rounded-xl bg-white/10 px-4 py-3 text-center backdrop-blur">

                            <p class="text-xs text-slate-400">
                                Files
                            </p>

                            <p class="mt-1 text-xl font-bold text-white">
                                {{ $project->files->count() }}
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {{-- Description --}}
            <div class="border-t border-slate-100 px-6 py-6 md:px-8">

                <h2 class="text-lg font-bold text-slate-900">
                    Project Description
                </h2>

                @if($project->description)

                    <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                        {{ $project->description }}
                    </p>

                @else

                    <p class="mt-3 text-sm italic text-slate-400">
                        No project description available.
                    </p>

                @endif

            </div>

        </div>


        {{-- Main Content --}}
        <div class="grid gap-6 lg:grid-cols-3">

            {{-- My Tasks --}}
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

                <div class="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                    <div>

                        <h2 class="text-lg font-bold text-slate-900">
                            My Tasks
                        </h2>

                        <p class="mt-1 text-sm text-slate-500">
                            Tasks assigned to you in this project.
                        </p>

                    </div>

                    <span class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        {{ $project->tasks->count() }} Tasks
                    </span>

                </div>


                <div class="divide-y divide-slate-100">

                    @forelse($project->tasks as $task)

                        <a
                            href="{{ route('employee.tasks.show', $task) }}"
                            class="group block px-6 py-5 transition hover:bg-slate-50"
                        >

                            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div class="min-w-0">

                                    <h3 class="truncate font-semibold text-slate-900 group-hover:text-slate-700">
                                        {{ $task->title }}
                                    </h3>

                                    @if($task->description)

                                        <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                            {{ $task->description }}
                                        </p>

                                    @endif

                                </div>


                                <div class="flex shrink-0 items-center gap-2">

                                    <x-priority-badge
                                        :priority="$task->priority"
                                    />

                                    <x-status-badge
                                        :status="$task->status"
                                    />

                                </div>

                            </div>

                        </a>

                    @empty

                        <div class="px-6 py-14 text-center">

                            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                ✓
                            </div>

                            <p class="mt-4 font-semibold text-slate-700">
                                No tasks assigned
                            </p>

                            <p class="mt-1 text-sm text-slate-500">
                                Your tasks for this project will appear here.
                            </p>

                        </div>

                    @endforelse

                </div>

            </div>


            {{-- Team --}}
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div class="border-b border-slate-200 px-6 py-5">

                    <h2 class="text-lg font-bold text-slate-900">
                        Project Team
                    </h2>

                    <p class="mt-1 text-sm text-slate-500">
                        People working on this project.
                    </p>

                </div>


                <div class="divide-y divide-slate-100">

                    @forelse($project->employees as $employee)

                        <div class="flex items-center gap-3 px-6 py-4">

                            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
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

                    @empty

                        <div class="px-6 py-12 text-center">

                            <p class="text-sm text-slate-500">
                                No team members found.
                            </p>

                        </div>

                    @endforelse

                </div>

            </div>

        </div>


        {{-- Project Files --}}
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-200 px-6 py-5">

                <div class="flex items-center justify-between gap-4">

                    <div>

                        <h2 class="text-lg font-bold text-slate-900">
                            Project Files
                        </h2>

                        <p class="mt-1 text-sm text-slate-500">
                            Files shared with this project.
                        </p>

                    </div>

                    <span class="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                        {{ $project->files->count() }} Files
                    </span>

                </div>

            </div>


            <div class="divide-y divide-slate-100">

                @forelse($project->files as $file)

                    <div class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                        <div class="flex min-w-0 items-center gap-4">

                            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                                📄
                            </div>

                            <div class="min-w-0">

                                <p class="truncate font-semibold text-slate-800">
                                    {{ $file->file_name ?? $file->name ?? 'Project file' }}
                                </p>

                                @if($file->uploader)

                                    <p class="mt-1 text-xs text-slate-400">
                                        Uploaded by {{ $file->uploader->name }}
                                    </p>

                                @endif

                            </div>

                        </div>


                        @if($file->file_path ?? $file->path ?? false)

                            <a
                                href="{{ asset('storage/' . ($file->file_path ?? $file->path)) }}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm
                                       font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                            >
                                Open File →
                            </a>

                        @endif

                    </div>

                @empty

                    <div class="px-6 py-14 text-center">

                        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg">
                            📄
                        </div>

                        <p class="mt-4 font-semibold text-slate-700">
                            No files available
                        </p>

                        <p class="mt-1 text-sm text-slate-500">
                            Files uploaded to this project will appear here.
                        </p>

                    </div>

                @endforelse

            </div>

        </div>

    </div>

</x-app-layout>
```
