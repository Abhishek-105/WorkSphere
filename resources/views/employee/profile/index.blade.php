@extends('layouts.app')

@section('title', 'My Profile')

@section('page_heading', 'My Profile')

@section('page_subtitle', 'Manage your personal information and account security.')

@section('content')

@php
    /** @var \App\Models\User $user */
@endphp

<div class="space-y-6">

    {{-- ============================================================
         PROFILE HEADER
    ============================================================= --}}
    <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div class="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 py-8 sm:px-8">

            <div class="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>
            <div class="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-indigo-300/10 blur-3xl"></div>

            <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center">

                {{-- Avatar --}}
                <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/20 bg-white/10 text-3xl font-extrabold text-white shadow-xl">

                    @if ($user->profile_photo)
                        <img
                            src="{{ asset('storage/' . $user->profile_photo) }}"
                            alt="{{ $user->name }}"
                            class="h-full w-full object-cover"
                        >
                    @else
                        {{ strtoupper(substr($user->name ?? 'U', 0, 1)) }}
                    @endif

                </div>

                <div class="min-w-0">

                    <p class="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
                        Employee Account
                    </p>

                    <h1 class="mt-1 truncate text-2xl font-extrabold text-white sm:text-3xl">
                        {{ $user->name }}
                    </h1>

                    <p class="mt-1 text-sm text-indigo-100">
                        {{ $user->designation ?: 'Employee' }}
                    </p>

                </div>

            </div>

        </div>

    </section>


    {{-- ============================================================
         FLASH MESSAGE
    ============================================================= --}}
    @if (session('success'))

        <div class="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800 shadow-sm">

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
                    d="M5 13l4 4L19 7"
                />
            </svg>

            <span>{{ session('success') }}</span>

        </div>

    @endif


    {{-- ============================================================
         VALIDATION ERRORS
    ============================================================= --}}
    @if ($errors->any())

        <div class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm">

            <p class="font-bold">
                Please check the following:
            </p>

            <ul class="mt-2 list-disc space-y-1 pl-5">

                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach

            </ul>

        </div>

    @endif


    {{-- ============================================================
         MAIN GRID
    ============================================================= --}}
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {{-- ========================================================
             PERSONAL INFORMATION
        ========================================================= --}}
        <section class="xl:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-100 px-6 py-5">

                <div class="flex items-center gap-3">

                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

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
                                d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                            />
                        </svg>

                    </div>

                    <div>

                        <h2 class="text-base font-bold text-slate-900">
                            Personal Information
                        </h2>

                        <p class="text-xs text-slate-500">
                            Update your basic employee information.
                        </p>

                    </div>

                </div>

            </div>


            <form
                method="POST"
                action="{{ route('employee.profile.update') }}"
                class="space-y-6 p-6"
            >

                @csrf
                @method('PUT')

                <div class="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {{-- Name --}}
                    <div>

                        <label
                            for="name"
                            class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                        >
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value="{{ old('name', $user->name) }}"
                            required
                            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        >

                    </div>


                    {{-- Email --}}
                    <div>

                        <label
                            for="email"
                            class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value="{{ old('email', $user->email) }}"
                            required
                            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        >

                    </div>


                    {{-- Phone --}}
                    <div>

                        <label
                            for="phone"
                            class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                        >
                            Phone
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            value="{{ old('phone', $user->phone) }}"
                            placeholder="Enter phone number"
                            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        >

                    </div>


                    {{-- Designation --}}
                    <div>

                        <label
                            for="designation"
                            class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                        >
                            Designation
                        </label>

                        <input
                            id="designation"
                            name="designation"
                            type="text"
                            value="{{ old('designation', $user->designation) }}"
                            placeholder="e.g. Laravel Developer"
                            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                        >

                    </div>

                </div>


                <div class="flex justify-end border-t border-slate-100 pt-5">

                    <button
                        type="submit"
                        class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
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
                                d="M5 12h14M12 5l7 7-7 7"
                            />
                        </svg>

                        Save Changes

                    </button>

                </div>

            </form>

        </section>


        {{-- ========================================================
             ACCOUNT INFORMATION
        ========================================================= --}}
        <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-100 px-6 py-5">

                <h2 class="text-base font-bold text-slate-900">
                    Account
                </h2>

                <p class="mt-1 text-xs text-slate-500">
                    Your Nexra account details.
                </p>

            </div>

            <div class="space-y-4 p-6">

                <div class="rounded-2xl bg-slate-50 p-4">

                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Role
                    </p>

                    <p class="mt-1 text-sm font-bold capitalize text-slate-900">
                        {{ $user->role }}
                    </p>

                </div>


                <div class="rounded-2xl bg-slate-50 p-4">

                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Account Status
                    </p>

                    <div class="mt-2">

                        <span class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                            {{ $user->status ?: 'Active' }}
                        </span>

                    </div>

                </div>


                <div class="rounded-2xl bg-slate-50 p-4">

                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Member Since
                    </p>

                    <p class="mt-1 text-sm font-bold text-slate-900">
                        {{ optional($user->created_at)->format('d M Y') ?? '—' }}
                    </p>

                </div>

            </div>

        </section>

    </div>


    {{-- ============================================================
         PASSWORD
    ============================================================= --}}
    <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div class="border-b border-slate-100 px-6 py-5">

            <div class="flex items-center gap-3">

                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2zM8 10V7a4 4 0 118 0v3"
                        />
                    </svg>

                </div>

                <div>

                    <h2 class="text-base font-bold text-slate-900">
                        Change Password
                    </h2>

                    <p class="text-xs text-slate-500">
                        Keep your Nexra account secure.
                    </p>

                </div>

            </div>

        </div>


        <form
            method="POST"
            action="{{ route('employee.profile.password') }}"
            class="space-y-5 p-6"
        >

            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 gap-5 md:grid-cols-3">

                <div>

                    <label
                        for="current_password"
                        class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                        Current Password
                    </label>

                    <input
                        id="current_password"
                        name="current_password"
                        type="password"
                        required
                        autocomplete="current-password"
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    >

                </div>


                <div>

                    <label
                        for="password"
                        class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                        New Password
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minlength="8"
                        autocomplete="new-password"
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    >

                </div>


                <div>

                    <label
                        for="password_confirmation"
                        class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600"
                    >
                        Confirm Password
                    </label>

                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        minlength="8"
                        autocomplete="new-password"
                        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    >

                </div>

            </div>


            <div class="flex justify-end border-t border-slate-100 pt-5">

                <button
                    type="submit"
                    class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-indigo-700"
                >
                    Update Password
                </button>

            </div>

        </form>

    </section>

</div>

@endsection
