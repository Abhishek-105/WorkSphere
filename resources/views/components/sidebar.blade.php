<aside
    class="
        fixed
        inset-y-0
        left-0
        z-50
        flex
        h-screen
        w-64
        flex-col
        overflow-hidden
        bg-slate-950
        text-white
        shadow-2xl
        shadow-slate-950/20
        transition-transform
        duration-300
        lg:translate-x-0
    "
    :class="mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
>

    {{-- ============================================================
         BRAND
    ============================================================= --}}
    <div class="flex h-20 shrink-0 items-center border-b border-white/10 px-5">

        <a
            href="{{ auth()->check()
                ? (auth()->user()->role === 'manager'
                    ? route('manager.dashboard')
                    : route('employee.dashboard'))
                : route('login') }}"
            class="group flex min-w-0 items-center gap-3"
        >

            <div
                class="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    bg-white
                    shadow-lg
                    transition
                    duration-200
                    group-hover:scale-105
                "
            >

                @if (file_exists(public_path('images/netfrux-logo-animated.svg')))

                    <img
                        src="{{ asset('images/netfrux-logo-animated.svg') }}"
                        alt="Netfrux Technologies"
                        class="h-8 w-8 object-contain"
                    >

                @else

                    <span class="text-lg font-extrabold text-indigo-600">
                        N
                    </span>

                @endif

            </div>

            <div class="min-w-0">

                <div class="text-lg font-extrabold tracking-tight text-white">
                    Nexra
                </div>

                <div class="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Netfrux Technologies
                </div>

            </div>

        </a>

    </div>


    {{-- ============================================================
         USER / MANAGER SUMMARY
    ============================================================= --}}
    @auth

        <div class="shrink-0 border-b border-white/10 px-4 py-4">

            <a
                href="{{ auth()->user()->role === 'manager'
                    ? route('manager.profile.show')
                    : route('employee.profile.show') }}"
                class="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    bg-white/[0.04]
                    p-3
                    transition
                    hover:bg-white/[0.07]
                "
            >

                <div
                    class="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        bg-gradient-to-br
                        from-indigo-500
                        to-violet-600
                        text-sm
                        font-bold
                        text-white
                        ring-2
                        ring-white/10
                    "
                >

                    @if (!empty(auth()->user()->profile_photo))

                        <img
                            src="{{ asset('storage/' . auth()->user()->profile_photo) }}"
                            alt="{{ auth()->user()->name }}"
                            class="h-full w-full object-cover"
                        >

                    @else

                        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}

                    @endif

                </div>

                <div class="min-w-0 flex-1">

                    <p class="truncate text-sm font-bold text-white">
                        {{ auth()->user()->name }}
                    </p>

                    <p class="mt-0.5 truncate text-xs capitalize text-slate-500">
                        {{ auth()->user()->role }}
                    </p>

                </div>

                <svg
                    class="h-4 w-4 shrink-0 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.8"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 5l7 7-7 7"
                    />
                </svg>

            </a>

        </div>

    @endauth


    {{-- ============================================================
         NAVIGATION
         This is the ONLY scrollable part of the sidebar.
    ============================================================= --}}
    <nav
        class="
            min-h-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
            px-3
            py-5
        "
    >

        <p class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
        </p>


        @auth

            {{-- ====================================================
                 MANAGER NAVIGATION
            ===================================================== --}}
            @if (auth()->user()->role === 'manager')

                {{-- Dashboard --}}
                <a
                    href="{{ route('manager.dashboard') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('manager.dashboard')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
                        />
                    </svg>

                    <span>Dashboard</span>

                </a>


                {{-- Projects --}}
                <a
                    href="{{ route('manager.projects.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('manager.projects.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                    </svg>

                    <span>Projects</span>

                </a>


                {{-- Tasks --}}
                <a
                    href="{{ route('manager.tasks.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('manager.tasks.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 5h6M9 9h6M9 13h6M9 17h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                        />
                    </svg>

                    <span>Tasks</span>

                </a>


                {{-- Daily Updates --}}
                <a
                    href="{{ route('manager.daily-updates.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('manager.daily-updates.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011 1z"
                        />
                    </svg>

                    <span>Daily Updates</span>

                </a>


                {{-- Team --}}
                <a
                    href="{{ route('manager.team.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('manager.team.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
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

                    <span>Team</span>

                </a>


                {{-- Activity --}}
                <a
                    href="{{ route('manager.activity.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('manager.activity.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M4 6h16M4 12h16M4 18h10"
                        />
                    </svg>

                    <span>Activity</span>

                </a>


            @else

                {{-- =================================================
                     EMPLOYEE NAVIGATION
                ================================================== --}}

                {{-- Dashboard --}}
                <a
                    href="{{ route('employee.dashboard') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('employee.dashboard')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
                        />
                    </svg>

                    <span>Dashboard</span>

                </a>


                {{-- Projects --}}
                <a
                    href="{{ route('employee.projects.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('employee.projects.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                    </svg>

                    <span>My Projects</span>

                </a>


                {{-- Tasks --}}
                <a
                    href="{{ route('employee.tasks.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('employee.tasks.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 5h6M9 9h6M9 13h6M9 17h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                        />
                    </svg>

                    <span>My Tasks</span>

                </a>


                {{-- Daily Updates --}}
                <a
                    href="{{ route('employee.daily-updates.index') }}"
                    class="
                        mb-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border-r-2
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        transition
                        {{ request()->routeIs('employee.daily-updates.*')
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white' }}
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011 1z"
                        />
                    </svg>

                    <span>Daily Updates</span>

                </a>

            @endif

        @endauth

    </nav>


    {{-- ============================================================
         SIDEBAR FOOTER
         Profile navigation intentionally removed.
         Manager/Employee identity is handled by the user summary above.
    ============================================================= --}}
    <div class="shrink-0 border-t border-white/10 p-3">

        @auth

            <form
                method="POST"
                action="{{ route('logout') }}"
            >

                @csrf

                <button
                    type="submit"
                    class="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-sm
                        font-medium
                        text-slate-400
                        transition
                        hover:bg-red-500/10
                        hover:text-red-400
                    "
                >

                    <svg
                        class="h-5 w-5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.8"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 00-2-2h-6"
                        />
                    </svg>

                    <span>Sign out</span>

                </button>

            </form>

        @endauth

        <p class="px-3 pb-1 pt-3 text-[9px] text-slate-600">
            © {{ date('Y') }} Netfrux Technologies
        </p>

    </div>

</aside>