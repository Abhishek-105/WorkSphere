<x-app-layout>

    <div class="min-h-screen bg-slate-50">

        <main class="mx-auto w-full max-w-7xl px-5 pb-10 pt-5 sm:px-6 lg:px-8">

            {{-- Header --}}
            <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div class="mb-2 flex items-center gap-2 text-sm text-slate-500">
                        <a
                            href="{{ route('manager.projects.index') }}"
                            class="transition hover:text-indigo-600"
                        >
                            Projects
                        </a>

                        <svg
                            class="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.06-.02Z"
                                clip-rule="evenodd"
                            />
                        </svg>

                        <span>Create Project</span>
                    </div>

                    <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Create New Project
                    </h1>

                    <p class="mt-1 text-sm text-slate-500">
                        Create a project and assign employees to your team.
                    </p>
                </div>

                <a
                    href="{{ route('manager.projects.index') }}"
                    class="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                    <svg
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M17 10a.75.75 0 0 1-.75.75H5.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 1 1 1.06 1.06l-3.22 3.22h10.69A.75.75 0 0 1 17 10Z"
                            clip-rule="evenodd"
                        />
                    </svg>

                    Back to Projects
                </a>

            </div>


            {{-- Validation Errors --}}
            @if ($errors->any())
                <div class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                    <div class="flex gap-3">

                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <svg
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-11a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 7Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
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
            <form
                method="POST"
                action="{{ route('manager.projects.store') }}"
                class="space-y-6"
            >

                @csrf


                {{-- Project Information --}}
                <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-200 px-6 py-5">
                        <div class="flex items-center gap-3">

                            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <svg
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M3 4.75A1.75 1.75 0 0 1 4.75 3h4.5A1.75 1.75 0 0 1 11 4.75v.5h4.25A1.75 1.75 0 0 1 17 7v8.25A1.75 1.75 0 0 1 15.25 17h-10A1.75 1.75 0 0 1 3.5 15.25V7A1.75 1.75 0 0 1 5.25 5.25H9.5v-.5a.25.25 0 0 0-.25-.25h-4.5a.25.25 0 0 0-.25.25v10.5a.75.75 0 0 1-1.5 0V4.75Z" />
                                </svg>
                            </div>

                            <div>
                                <h2 class="text-base font-semibold text-slate-900">
                                    Project Information
                                </h2>

                                <p class="text-sm text-slate-500">
                                    Define the basic details of the project.
                                </p>
                            </div>

                        </div>
                    </div>


                    <div class="grid gap-6 p-6 md:grid-cols-2">

                        {{-- Title --}}
                        <div class="md:col-span-2">

                            <label
                                for="title"
                                class="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Project Title
                                <span class="text-red-500">*</span>
                            </label>

                            <input
                                id="title"
                                name="title"
                                type="text"
                                value="{{ old('title') }}"
                                required
                                maxlength="255"
                                placeholder="e.g. Website Redesign"
                                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            >

                            @error('title')
                                <p class="mt-2 text-sm text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror

                        </div>


                        {{-- Description --}}
                        <div class="md:col-span-2">

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
                                placeholder="Describe the project objectives, requirements and expected outcome..."
                                class="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            >{{ old('description') }}</textarea>

                            @error('description')
                                <p class="mt-2 text-sm text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror

                        </div>


                        {{-- Start Date --}}
                        <div>

                            <label
                                for="start_date"
                                class="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Start Date
                                <span class="text-red-500">*</span>
                            </label>

                            <input
                                id="start_date"
                                name="start_date"
                                type="date"
                                value="{{ old('start_date') }}"
                                required
                                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            >

                            @error('start_date')
                                <p class="mt-2 text-sm text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror

                        </div>


                        {{-- End Date --}}
                        <div>

                            <label
                                for="end_date"
                                class="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                End Date
                            </label>

                            <input
                                id="end_date"
                                name="end_date"
                                type="date"
                                value="{{ old('end_date') }}"
                                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            >

                            @error('end_date')
                                <p class="mt-2 text-sm text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror

                        </div>


                        {{-- Status --}}
                        <div>

                            <label
                                for="status"
                                class="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Initial Status
                                <span class="text-red-500">*</span>
                            </label>

                            <select
                                id="status"
                                name="status"
                                required
                                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            >
                                <option
                                    value="active"
                                    @selected(old('status', 'active') === 'active')
                                >
                                    Active
                                </option>

                                <option
                                    value="on-hold"
                                    @selected(old('status') === 'on-hold')
                                >
                                    On Hold
                                </option>
                            </select>

                            <p class="mt-2 text-xs leading-5 text-slate-500">
                                New projects cannot be created as completed.
                                You can mark the project as completed later from Edit.
                            </p>

                            @error('status')
                                <p class="mt-2 text-sm text-red-600">
                                    {{ $message }}
                                </p>
                            @enderror

                        </div>

                    </div>

                </section>


                {{-- Team Assignment --}}
                <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-b border-slate-200 px-6 py-5">
                        <div class="flex items-center gap-3">

                            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                <svg
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M7.5 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16.25A4.75 4.75 0 0 1 7.25 11.5h.5a4.75 4.75 0 0 1 4.75 4.75.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75Zm10.25.75a.75.75 0 0 1-.75-.75 4.75 4.75 0 0 1 4.75-4.75h.25a3.5 3.5 0 0 1 3.5 3.5v1.25a.75.75 0 0 1-.75.75h-7Z" />
                                </svg>
                            </div>

                            <div>
                                <h2 class="text-base font-semibold text-slate-900">
                                    Assign Team Members
                                </h2>

                                <p class="text-sm text-slate-500">
                                    Select employees who will work on this project.
                                </p>
                            </div>

                        </div>
                    </div>


                    <div class="p-6">

                        @if ($employees->count())

                            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                @foreach ($employees as $employee)

                                    <label class="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40">

                                        <input
                                            type="checkbox"
                                            name="employees[]"
                                            value="{{ $employee->id }}"
                                            @checked(in_array($employee->id, old('employees', [])))
                                            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        >

                                        <div class="min-w-0">

                                            <p class="truncate text-sm font-semibold text-slate-800 group-hover:text-indigo-700">
                                                {{ $employee->name }}
                                            </p>

                                            <p class="truncate text-xs text-slate-500">
                                                {{ $employee->email }}
                                            </p>

                                        </div>

                                    </label>

                                @endforeach

                            </div>

                        @else

                            <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">

                                <p class="text-sm font-semibold text-slate-700">
                                    No employees available
                                </p>

                                <p class="mt-1 text-sm text-slate-500">
                                    Create an employee account before assigning a project.
                                </p>

                            </div>

                        @endif

                        @error('employees')
                            <p class="mt-3 text-sm text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                        @error('employees.*')
                            <p class="mt-3 text-sm text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>

                </section>


                {{-- Actions --}}
                <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <a
                        href="{{ route('manager.projects.index') }}"
                        class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        Cancel
                    </a>

                    <button
                        type="submit"
                        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                    >
                        <svg
                            class="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 3a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 10 3Z"
                                clip-rule="evenodd"
                            />
                        </svg>

                        Create Project
                    </button>

                </div>

            </form>

        </main>

    </div>

</x-app-layout>