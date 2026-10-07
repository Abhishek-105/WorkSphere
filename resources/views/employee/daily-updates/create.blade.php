@extends('layouts.app')

@section('title', 'Add Daily Update')
@section('page_heading', 'Add Daily Update')
@section('page_subtitle', 'Submit your work for the day')

@section('content')

<div class="mx-auto max-w-3xl">

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <form
            method="POST"
            action="{{ route('employee.daily-updates.store') }}"
            class="space-y-6"
        >

            @csrf

            <div>

                <label class="text-sm font-semibold text-slate-700">
                    Date
                </label>

                <input
                    type="date"
                    name="update_date"
                    value="{{ old('update_date', now()->format('Y-m-d')) }}"
                    required
                    class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                >

                @error('update_date')
                    <p class="mt-1 text-sm text-red-600">
                        {{ $message }}
                    </p>
                @enderror

            </div>

            <div>

                <label class="text-sm font-semibold text-slate-700">
                    Project
                </label>

                <select
                    name="project_id"
                    required
                    class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                >

                    <option value="">
                        Select Project
                    </option>

                    @foreach($projects as $project)

                        <option
                            value="{{ $project->id }}"
                            @selected(old('project_id') == $project->id)
                        >
                            {{ $project->title }}
                        </option>

                    @endforeach

                </select>

                @error('project_id')
                    <p class="mt-1 text-sm text-red-600">
                        {{ $message }}
                    </p>
                @enderror

            </div>

            <div>

                <label class="text-sm font-semibold text-slate-700">
                    Work Done
                </label>

                <textarea
                    name="work_description"
                    rows="7"
                    required
                    placeholder="Describe the work you completed today..."
                    class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                >{{ old('work_description') }}</textarea>

                @error('work_description')
                    <p class="mt-1 text-sm text-red-600">
                        {{ $message }}
                    </p>
                @enderror

            </div>

            <div>

                <label class="text-sm font-semibold text-slate-700">
                    Hours Spent
                </label>

                <input
                    type="number"
                    name="hours_spent"
                    min="0"
                    max="24"
                    step="0.25"
                    value="{{ old('hours_spent') }}"
                    required
                    placeholder="e.g. 7.5"
                    class="mt-2 w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                >

                @error('hours_spent')
                    <p class="mt-1 text-sm text-red-600">
                        {{ $message }}
                    </p>
                @enderror

            </div>

            <div class="flex justify-end gap-3 border-t border-slate-200 pt-6">

                <a
                    href="{{ route('employee.daily-updates.index') }}"
                    class="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </a>

                <button
                    type="submit"
                    class="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Submit Update
                </button>

            </div>

        </form>

    </div>

</div>

@endsection