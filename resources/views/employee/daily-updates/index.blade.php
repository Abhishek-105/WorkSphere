@extends('layouts.app')

@section('title', 'Daily Updates')
@section('page_heading', 'Daily Updates')
@section('page_subtitle', 'Track and submit your daily work')

@section('content')

<div class="space-y-6">

    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
            <h2 class="text-xl font-bold text-slate-900">
                My Daily Updates
            </h2>

            <p class="mt-1 text-sm text-slate-500">
                Keep your manager updated about your daily work.
            </p>
        </div>

        <a
            href="{{ route('employee.daily-updates.create') }}"
            class="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
            + Add Daily Update
        </a>

    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div class="overflow-x-auto">

            <table class="min-w-full divide-y divide-slate-200">

                <thead class="bg-slate-50">

                    <tr>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                            Date
                        </th>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                            Project
                        </th>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                            Work Done
                        </th>

                        <th class="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                            Hours
                        </th>

                    </tr>

                </thead>

                <tbody class="divide-y divide-slate-100">

                    @forelse($updates as $update)

                        <tr class="hover:bg-slate-50">

                            <td class="px-6 py-4 text-sm font-medium text-slate-900">
                                {{ $update->update_date->format('d M Y') }}
                            </td>

                            <td class="px-6 py-4 text-sm text-slate-600">
                                {{ $update->project?->title ?? '—' }}
                            </td>

                            <td class="px-6 py-4">

                                <p class="max-w-xl text-sm text-slate-600">
                                    {{ $update->work_description }}
                                </p>

                            </td>

                            <td class="px-6 py-4 text-sm font-semibold text-slate-900">
                                {{ $update->hours_spent }} hrs
                            </td>

                        </tr>

                    @empty

                        <tr>
                            <td colspan="4" class="px-6 py-16 text-center text-sm text-slate-500">
                                No daily updates submitted yet.
                            </td>
                        </tr>

                    @endforelse

                </tbody>

            </table>

        </div>

        @if($updates->hasPages())
            <div class="border-t border-slate-200 px-6 py-4">
                {{ $updates->links() }}
            </div>
        @endif

    </div>

</div>

@endsection