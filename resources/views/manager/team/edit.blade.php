@extends('layouts.app')

@section('title', 'Edit Team Member')
@section('page_heading', 'Edit Team Member')
@section('page_subtitle', 'Update role, profile and account status')

@section('content')

<div class="mx-auto max-w-3xl">

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <form
            method="POST"
            action="{{ route('manager.team.update', $team) }}"
            class="space-y-6"
        >

            @csrf
            @method('PUT')

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                    <label class="text-sm font-semibold text-slate-700">
                        Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value="{{ old('name', $team->name) }}"
                        required
                        class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value="{{ old('email', $team->email) }}"
                        required
                        class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">
                        Designation
                    </label>

                    <input
                        type="text"
                        name="designation"
                        value="{{ old('designation', $team->designation ?? '') }}"
                        class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">
                        Phone
                    </label>

                    <input
                        type="text"
                        name="phone"
                        value="{{ old('phone', $team->phone ?? '') }}"
                        class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">
                        Role
                    </label>

                    <select
                        name="role"
                        class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option
                            value="employee"
                            @selected(old('role', $team->role) === 'employee')
                        >
                            Employee
                        </option>

                        <option
                            value="manager"
                            @selected(old('role', $team->role) === 'manager')
                        >
                            Manager
                        </option>
                    </select>
                </div>

                <div>
                    <label class="text-sm font-semibold text-slate-700">
                        Status
                    </label>

                    <select
                        name="status"
                        class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option
                            value="active"
                            @selected(old('status', $team->status ?? 'active') === 'active')
                        >
                            Active
                        </option>

                        <option
                            value="inactive"
                            @selected(old('status', $team->status ?? 'active') === 'inactive')
                        >
                            Inactive
                        </option>
                    </select>
                </div>

            </div>

            <div class="flex justify-end gap-3 border-t border-slate-200 pt-6">

                <a
                    href="{{ route('manager.team.index') }}"
                    class="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700"
                >
                    Cancel
                </a>

                <button
                    type="submit"
                    class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
                >
                    Save Changes
                </button>

            </div>

        </form>

    </div>

</div>

@endsection