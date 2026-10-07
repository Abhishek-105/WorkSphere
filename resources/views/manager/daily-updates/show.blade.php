@extends('layouts.app')

@section('title', 'Daily Update')

@section('page_heading', 'Daily Update')

@section(
    'page_subtitle',
    'Review employee work, blockers and next steps.'
)

@section('content')

<div class="space-y-6">

    {{-- Back --}}
    <div>
        <a
            href="{{ route('manager.daily-updates.index') }}"
            class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
        >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                />
            </svg>

            Back to Daily Updates
        </a>
    </div>


    {{-- Header --}}
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div class="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-7 text-white">

            <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div class="flex items-center gap-4">

                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
                        {{ strtoupper(substr($dailyUpdate->employee?->name ?? 'U', 0, 1)) }}
                    </div>

                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Employee Daily Update
                        </p>

                        <h2 class="mt-1 text-2xl font-bold">
                            {{ $dailyUpdate->employee?->name ?? 'Unknown Employee' }}
                        </h2>

                        <p class="mt-1 text-sm text-slate-400">
                            {{ $dailyUpdate->update_date?->format('l, d F Y') }}
                        </p>
                    </div>

                </div>


                <div class="flex flex-wrap gap-2">

                    @if ($dailyUpdate->status === 'reviewed')

                        <span class="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                            Reviewed
                        </span>

                    @else

                        <span class="rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300">
                            Pending Review
                        </span>

                    @endif


                    @if ($dailyUpdate->hasBlocker())

                        @if ($dailyUpdate->blocker_acknowledged_at)

                            <span class="rounded-full bg-slate-500/30 px-3 py-1.5 text-xs font-bold text-slate-200">
                                Blocker Acknowledged
                            </span>

                        @else

                            <span class="rounded-full bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300">
                                Active Blocker
                            </span>

                        @endif

                    @endif

                </div>

            </div>

        </div>


        {{-- Context --}}
        <div class="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            <div class="p-5">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Project
                </p>

                <p class="mt-2 font-semibold text-slate-900">
                    {{ $dailyUpdate->project?->title ?? 'No project' }}
                </p>
            </div>


            <div class="p-5">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Task
                </p>

                <p class="mt-2 font-semibold text-slate-900">
                    {{ $dailyUpdate->task?->title ?? 'No specific task' }}
                </p>
            </div>


            <div class="p-5">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Hours Logged
                </p>

                <p class="mt-2 font-semibold text-slate-900">
                    {{ number_format((float) $dailyUpdate->hours_spent, 2) }} hours
                </p>
            </div>

        </div>

    </section>


    {{-- Manager Actions --}}
    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
                <h3 class="font-bold text-slate-900">
                    Manager Actions
                </h3>

                <p class="mt-1 text-sm text-slate-500">
                    Process this update and record any management response.
                </p>
            </div>


            <div class="flex flex-wrap gap-2">

                @if ($dailyUpdate->status !== 'reviewed')

                    <form
                        method="POST"
                        action="{{ route('manager.daily-updates.review', $dailyUpdate) }}"
                    >
                        @csrf

                        <button
                            type="submit"
                            class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            Mark Reviewed
                        </button>
                    </form>

                @else

                    <span class="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                        Reviewed
                    </span>

                @endif


                @if ($dailyUpdate->hasBlocker())

                    @if (!$dailyUpdate->blocker_acknowledged_at)

                        <form
                            method="POST"
                            action="{{ route('manager.daily-updates.acknowledge-blocker', $dailyUpdate) }}"
                        >
                            @csrf

                            <button
                                type="submit"
                                class="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                            >
                                Acknowledge Blocker
                            </button>
                        </form>

                    @else

                        <span class="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600">
                            Blocker Acknowledged
                        </span>

                    @endif

                @endif

            </div>

        </div>

    </section>


    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {{-- Main update --}}
        <div class="space-y-6 xl:col-span-2">

            {{-- Work Summary --}}
            <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div class="border-b border-slate-100 px-6 py-5">
                    <h3 class="font-bold text-slate-900">
                        What Was Done
                    </h3>

                    <p class="mt-1 text-xs text-slate-500">
                        Employee's work summary for the day.
                    </p>
                </div>

                <div class="px-6 py-6">
                    <p class="whitespace-pre-line text-sm leading-7 text-slate-700">
                        {{ $dailyUpdate->work_description }}
                    </p>
                </div>

            </section>


            {{-- Blocker --}}
            <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div class="border-b border-slate-100 px-6 py-5">
                    <h3 class="font-bold text-slate-900">
                        Blocker
                    </h3>
                </div>

                @if ($dailyUpdate->hasBlocker())

                    <div class="bg-rose-50 px-6 py-6">

                        <p class="whitespace-pre-line text-sm leading-7 text-rose-900">
                            {{ $dailyUpdate->blocker_details }}
                        </p>

                        @if ($dailyUpdate->blocker_acknowledged_at)

                            <div class="mt-4 border-t border-rose-200 pt-4 text-xs text-rose-700">
                                Acknowledged by
                                <strong>
                                    {{ $dailyUpdate->blockerAcknowledgedBy?->name ?? 'Manager' }}
                                </strong>

                                on
                                {{ $dailyUpdate->blocker_acknowledged_at?->format('d M Y, h:i A') }}
                            </div>

                        @else

                            <div class="mt-4 text-xs font-semibold text-rose-700">
                                Manager action required.
                            </div>

                        @endif

                    </div>

                @else

                    <div class="px-6 py-6">
                        <p class="text-sm text-slate-400">
                            No blocker reported.
                        </p>
                    </div>

                @endif

            </section>


            {{-- Tomorrow --}}
            <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div class="border-b border-slate-100 px-6 py-5">
                    <h3 class="font-bold text-slate-900">
                        Tomorrow's Plan
                    </h3>
                </div>

                <div class="px-6 py-6">

                    @if (!empty($dailyUpdate->plans_for_tomorrow))

                        <p class="whitespace-pre-line text-sm leading-7 text-slate-700">
                            {{ $dailyUpdate->plans_for_tomorrow }}
                        </p>

                    @else

                        <p class="text-sm text-slate-400">
                            No plan provided.
                        </p>

                    @endif

                </div>

            </section>

        </div>


        {{-- Manager panel --}}
        <div class="space-y-6">

            {{-- Review information --}}
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <h3 class="font-bold text-slate-900">
                    Review Information
                </h3>

                <div class="mt-5 space-y-4">

                    <div>
                        <p class="text-xs text-slate-400">
                            Submitted
                        </p>

                        <p class="mt-1 text-sm font-semibold text-slate-700">
                            {{ $dailyUpdate->created_at?->format('d M Y, h:i A') }}
                        </p>
                    </div>


                    <div>
                        <p class="text-xs text-slate-400">
                            Reviewed By
                        </p>

                        <p class="mt-1 text-sm font-semibold text-slate-700">
                            {{ $dailyUpdate->reviewer?->name ?? 'Not reviewed yet' }}
                        </p>
                    </div>


                    @if ($dailyUpdate->reviewed_at)

                        <div>
                            <p class="text-xs text-slate-400">
                                Reviewed At
                            </p>

                            <p class="mt-1 text-sm font-semibold text-slate-700">
                                {{ $dailyUpdate->reviewed_at->format('d M Y, h:i A') }}
                            </p>
                        </div>

                    @endif

                </div>

            </section>


            {{-- Manager comment --}}
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div>
                    <h3 class="font-bold text-slate-900">
                        Manager Comment
                    </h3>

                    <p class="mt-1 text-xs text-slate-500">
                        Leave feedback or a follow-up instruction.
                    </p>
                </div>


                <form
                    method="POST"
                    action="{{ route('manager.daily-updates.comment', $dailyUpdate) }}"
                    class="mt-5"
                >
                    @csrf

                    <textarea
                        name="manager_comment"
                        rows="6"
                        maxlength="3000"
                        class="w-full rounded-xl border-slate-200 bg-slate-50 text-sm leading-6 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Add a manager comment..."
                    >{{ old('manager_comment', $dailyUpdate->manager_comment) }}</textarea>

                    @error('manager_comment')
                        <p class="mt-2 text-xs font-medium text-red-600">
                            {{ $message }}
                        </p>
                    @enderror

                    <button
                        type="submit"
                        class="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Save Comment
                    </button>

                </form>

            </section>

        </div>

    </div>

</div>

@endsection