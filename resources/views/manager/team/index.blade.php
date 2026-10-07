<x-app-layout>

    <div class="min-h-screen bg-slate-50">

        <main class="mx-auto w-full max-w-7xl px-5 pb-10 pt-5 sm:px-6 lg:px-8">

            {{-- Header --}}
            <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div class="mb-2 flex items-center gap-2 text-sm text-slate-500">
                        <span>Manager</span>

                        <svg
                            class="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.06-.02Z"
                                clip-rule="evenodd"
                            />
                        </svg>

                        <span>Team</span>
                    </div>

                    <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Team
                    </h1>

                    <p class="mt-1 text-sm text-slate-500">
                        Manage employees and their access to the Nexra workspace.
                    </p>
                </div>


                {{-- Add Employee --}}
                <a
                    href="{{ route('manager.team.create') }}"
                    class="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                >
                    <svg
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M10 3a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 10 3Z"
                            clip-rule="evenodd"
                        />
                    </svg>

                    Add Employee
                </a>

            </div>


            {{-- Success Message --}}
            @if (session('success'))
                <div class="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">

                    <div class="flex items-center gap-3">

                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <svg
                                class="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.42.002l-3.8-3.75a1 1 0 0 1 1.406-1.426l3.09 3.052 6.497-6.542a1 1 0 0 1 1.421 0Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>

                        <p class="text-sm font-medium text-emerald-800">
                            {{ session('success') }}
                        </p>

                    </div>

                </div>
            @endif


            {{-- Statistics --}}
            <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {{-- Total Employees --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-l-4 border-indigo-500 p-5">

                        <div class="flex items-center justify-between">

                            <div>
                                <p class="text-sm font-medium text-slate-500">
                                    Total Employees
                                </p>

                                <p class="mt-1 text-3xl font-bold text-slate-900">
                                    {{ $employees->total() }}
                                </p>
                            </div>

                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <svg
                                    class="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path d="M7.5 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM13 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16.25A4.75 4.75 0 0 1 7.25 11.5h.5a4.75 4.75 0 0 1 4.75 4.75.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75ZM13 11.5h.25A4.25 4.25 0 0 1 17.5 15.75v.5h-4.75a.75.75 0 0 1-.75-.75 4 4 0 0 1 1-2.65Z" />
                                </svg>
                            </div>

                        </div>

                    </div>

                </div>


                {{-- Current Page --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div class="border-l-4 border-sky-500 p-5">

                        <div class="flex items-center justify-between">

                            <div>
                                <p class="text-sm font-medium text-slate-500">
                                    Showing
                                </p>

                                <p class="mt-1 text-3xl font-bold text-slate-900">
                                    {{ $employees->count() }}
                                </p>
                            </div>

                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                <svg
                                    class="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M4.5 3A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 15.5 3h-11ZM5 6.75A.75.75 0 0 1 5.75 6h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 6.75ZM5.75 9a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM5 12.75a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>

                        </div>

                    </div>

                </div>


                {{-- Team Status --}}
                <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:col-span-2 lg:col-span-1">

                    <div class="border-l-4 border-emerald-500 p-5">

                        <div class="flex items-center justify-between">

                            <div>
                                <p class="text-sm font-medium text-slate-500">
                                    Team Management
                                </p>

                                <p class="mt-1 text-sm font-semibold text-emerald-600">
                                    Ready to manage
                                </p>
                            </div>

                            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <svg
                                    class="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.28-9.78a.75.75 0 0 0-1.06-1.06l-2.97 2.97-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {{-- Employees Table --}}
            <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div class="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 class="text-base font-semibold text-slate-900">
                            Employees
                        </h2>

                        <p class="mt-1 text-sm text-slate-500">
                            Manage employee accounts in your workspace.
                        </p>
                    </div>

                    <a
                        href="{{ route('manager.team.create') }}"
                        class="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
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

                        Add Employee
                    </a>

                </div>


                @if ($employees->count())

                    {{-- Desktop Table --}}
                    <div class="hidden overflow-x-auto md:block">

                        <table class="min-w-full divide-y divide-slate-200">

                            <thead class="bg-slate-50">

                                <tr>

                                    <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Employee
                                    </th>

                                    <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Email
                                    </th>

                                    <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Role
                                    </th>

                                    <th class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody class="divide-y divide-slate-100 bg-white">

                                @foreach ($employees as $employee)

                                    <tr class="transition hover:bg-slate-50">

                                        <td class="whitespace-nowrap px-6 py-4">

                                            <div class="flex items-center gap-3">

                                                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                                                    {{ strtoupper(substr($employee->name, 0, 1)) }}
                                                </div>

                                                <div>
                                                    <p class="text-sm font-semibold text-slate-900">
                                                        {{ $employee->name }}
                                                    </p>

                                                    <p class="text-xs text-slate-500">
                                                        Employee ID #{{ $employee->id }}
                                                    </p>
                                                </div>

                                            </div>

                                        </td>


                                        <td class="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                            {{ $employee->email }}
                                        </td>


                                        <td class="whitespace-nowrap px-6 py-4">

                                            <span class="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                Employee
                                            </span>

                                        </td>


                                        <td class="whitespace-nowrap px-6 py-4 text-right">

                                            <a
                                                href="{{ route('manager.team.edit', $employee) }}"
                                                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                            >
                                                <svg
                                                    class="h-4 w-4"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.5 8.5-3.5.75.75-3.5 8.422-8.578ZM5.75 12.25l-.5 2.25 2.25-.5 7.854-7.854-1.75-1.75L5.75 12.25Z" />
                                                </svg>

                                                Edit
                                            </a>

                                        </td>

                                    </tr>

                                @endforeach

                            </tbody>

                        </table>

                    </div>


                    {{-- Mobile Cards --}}
                    <div class="divide-y divide-slate-100 md:hidden">

                        @foreach ($employees as $employee)

                            <div class="p-5">

                                <div class="flex items-start justify-between gap-4">

                                    <div class="flex min-w-0 items-center gap-3">

                                        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                                            {{ strtoupper(substr($employee->name, 0, 1)) }}
                                        </div>

                                        <div class="min-w-0">

                                            <p class="truncate text-sm font-semibold text-slate-900">
                                                {{ $employee->name }}
                                            </p>

                                            <p class="truncate text-xs text-slate-500">
                                                {{ $employee->email }}
                                            </p>

                                        </div>

                                    </div>

                                    <span class="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        Employee
                                    </span>

                                </div>


                                <div class="mt-4">

                                    <a
                                        href="{{ route('manager.team.edit', $employee) }}"
                                        class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        <svg
                                            class="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-8.5 8.5-3.5.75.75-3.5 8.422-8.578ZM5.75 12.25l-.5 2.25 2.25-.5 7.854-7.854-1.75-1.75L5.75 12.25Z" />
                                        </svg>

                                        Edit Employee
                                    </a>

                                </div>

                            </div>

                        @endforeach

                    </div>

                @else

                    {{-- Empty State --}}
                    <div class="px-6 py-16 text-center">

                        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

                            <svg
                                class="h-8 w-8"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M7.5 9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM13 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2.5 16.25A4.75 4.75 0 0 1 7.25 11.5h.5a4.75 4.75 0 0 1 4.75 4.75.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75ZM13 11.5h.25A4.25 4.25 0 0 1 17.5 15.75v.5h-4.75a.75.75 0 0 1-.75-.75 4 4 0 0 1 1-2.65Z" />
                            </svg>

                        </div>

                        <h3 class="mt-5 text-base font-semibold text-slate-900">
                            No employees yet
                        </h3>

                        <p class="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Add your first employee to start assigning projects and tasks to your team.
                        </p>

                        <a
                            href="{{ route('manager.team.create') }}"
                            class="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            <svg
                                class="h-5 w-5"
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

                            Add Employee
                        </a>

                    </div>

                @endif


                {{-- Pagination --}}
                @if ($employees->hasPages())

                    <div class="border-t border-slate-200 px-6 py-4">
                        {{ $employees->links() }}
                    </div>

                @endif

            </section>

        </main>

    </div>

</x-app-layout>