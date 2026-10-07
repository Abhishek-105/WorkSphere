<header class="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">


{{-- ============================================================
     LEFT SIDE
============================================================= --}}

<div class="flex min-w-0 items-center gap-3">


    {{-- Mobile Menu --}}
    <label
        for="nexra-mobile-sidebar"
        class="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
        aria-label="Open navigation"
    >

        <svg
            style="width:20px; height:20px"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
            />
        </svg>

    </label>


    {{-- Page Heading --}}

    <div class="min-w-0">

        @hasSection('page_heading')

            <h1 class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                @yield('page_heading')
            </h1>

        @else

            <h1 class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Nexra Workspace
            </h1>

        @endif


        @hasSection('page_subtitle')

            <p class="mt-0.5 hidden max-w-xl truncate text-xs font-medium text-slate-500 sm:block">
                @yield('page_subtitle')
            </p>

        @endif

    </div>

</div>


{{-- ============================================================
     RIGHT SIDE
============================================================= --}}

<div class="flex shrink-0 items-center gap-2 sm:gap-3">


    {{-- Search --}}

    <button
        type="button"
        class="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-400 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 md:flex"
    >

        <svg
            style="width:18px; height:18px"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>

        <span class="hidden lg:inline">
            Search
        </span>

        <span class="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 xl:inline">
            ⌘ K
        </span>

    </button>


    {{-- Notifications --}}

    <button
        type="button"
        class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        aria-label="Notifications"
    >

        <svg
            style="width:20px; height:20px"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0"
            />
        </svg>


        <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>

    </button>


    {{-- Divider --}}

    <div class="hidden h-8 w-px bg-slate-200 sm:block"></div>


    {{-- User --}}

    @auth

        <div class="flex items-center gap-3">

            <div class="hidden text-right sm:block">

                <p class="max-w-40 truncate text-sm font-semibold text-slate-800">
                    {{ auth()->user()->name }}
                </p>

                <p class="mt-0.5 text-[11px] font-medium capitalize text-slate-500">
                    {{ auth()->user()->role }}
                </p>

            </div>


            <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-100">

                @if (!empty(auth()->user()->profile_photo))

                    <img
                        src="{{ asset('storage/' . auth()->user()->profile_photo) }}"
                        alt="{{ auth()->user()->name }}"
                        class="h-full w-full object-cover"
                    >

                @else

                    {{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) }}

                @endif

            </div>

        </div>

    @endauth

</div>


</header>
