<x-app-layout>

    <div class="min-h-screen bg-slate-50">

        <main class="mx-auto w-full max-w-4xl px-5 pb-10 pt-5 sm:px-6 lg:px-8">

            {{-- Header --}}
            <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div class="mb-2 flex items-center gap-2 text-sm text-slate-500">

                        <a
                            href="{{ route('manager.team.index') }}"
                            class="transition hover:text-indigo-600"
                        >
                            Team
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

                        <span>Add Employee</span>

                    </div>

                    <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Add Employee
                    </h1>

                    <p class="mt-1 text-sm text-slate-500">
                        Create a new employee account for the Nexra workspace.
                    </p>

                </div>


                <a
                    href="{{ route('manager.team.index') }}"
                    class="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <svg
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M17 10a.75.75 0 0 1-.75.75H5.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 1 1 1.06 1.06l3.22 3.22H16.25A.75.75 0 0 1 17 10Z"
                            clip-rule="evenodd"
                        />
                    </svg>

                    Back to Team
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
                action="{{ route('manager.team.store') }}"
                class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >

                @csrf


                {{-- Form Header --}}
                <div class="border-b border-slate-200 px-6 py-5 sm:px-8">

                    <div class="flex items-center gap-3">

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

                        <div>

                            <h2 class="text-base font-semibold text-slate-900">
                                Employee Account
                            </h2>

                            <p class="text-sm text-slate-500">
                                Enter the employee's login information.
                            </p>

                        </div>

                    </div>

                </div>


                {{-- Form Fields --}}
                <div class="space-y-6 px-6 py-7 sm:px-8">


                    {{-- Name --}}
                    <div>

                        <label
                            for="name"
                            class="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Full Name
                            <span class="text-red-500">*</span>
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value="{{ old('name') }}"
                            autocomplete="name"
                            required
                            maxlength="255"
                            placeholder="e.g. Abhishek Sharma"
                            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('name')
                            <p class="mt-2 text-sm text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    {{-- Email --}}
                    <div>

                        <label
                            for="email"
                            class="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Email Address
                            <span class="text-red-500">*</span>
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value="{{ old('email') }}"
                            autocomplete="email"
                            required
                            maxlength="255"
                            placeholder="employee@example.com"
                            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('email')
                            <p class="mt-2 text-sm text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    {{-- Password --}}
                    <div>

                        <label
                            for="password"
                            class="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Password
                            <span class="text-red-500">*</span>
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value=""
                            autocomplete="new-password"
                            required
                            minlength="8"
                            placeholder="Enter a password"
                            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        <p class="mt-2 text-xs text-slate-500">
                            Password must contain at least 8 characters.
                        </p>

                        @error('password')
                            <p class="mt-2 text-sm text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    {{-- Confirm Password --}}
                    <div>

                        <label
                            for="password_confirmation"
                            class="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Confirm Password
                            <span class="text-red-500">*</span>
                        </label>

                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value=""
                            autocomplete="new-password"
                            required
                            minlength="8"
                            placeholder="Re-enter the password"
                            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                    </div>


                    {{-- Role Information --}}
                    <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">

                        <div class="flex gap-3">

                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">

                                <svg
                                    class="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 2.5a.75.75 0 0 1 .75.75v.5a6.25 6.25 0 0 1 5.5 6.21V12a.75.75 0 0 1-1.5 0V9.96A4.75 4.75 0 0 0 10 5.25a4.75 4.75 0 0 0-4.75 4.75V12a.75.75 0 0 1-1.5 0V9.96A6.25 6.25 0 0 1 9.25 3.75v-.5A.75.75 0 0 1 10 2.5ZM6.75 12.75A.75.75 0 0 1 7.5 12h5a.75.75 0 0 1 .75.75v.5a3.25 3.25 0 0 1-6.5 0v-.5Z"
                                        clip-rule="evenodd"
                                    />
                                </svg>

                            </div>

                            <div>

                                <p class="text-sm font-semibold text-indigo-900">
                                    Employee Role
                                </p>

                                <p class="mt-1 text-sm leading-5 text-indigo-700">
                                    This account will automatically be created with the
                                    <strong>Employee</strong> role.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {{-- Actions --}}
                <div class="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">

                    <a
                        href="{{ route('manager.team.index') }}"
                        class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Cancel
                    </a>

                    <button
                        type="submit"
                        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
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

                        Create Employee

                    </button>

                </div>

            </form>

        </main>

    </div>

</x-app-layout>