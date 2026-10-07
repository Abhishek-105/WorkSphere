<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>

    <meta charset="utf-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
    >

    <meta
        name="csrf-token"
        content="{{ csrf_token() }}"
    >

    <title>
        @hasSection('title')
            @yield('title') - Nexra Workspace
        @else
            Nexra Workspace
        @endif
    </title>

    <link rel="preconnect" href="https://fonts.googleapis.com">

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
    >

    @vite([
        'resources/css/app.css',
        'resources/js/app.js'
    ])

    <style>

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
            color: #0f172a;
        }

        .nexra-component-shell {
            width: 100%;
            min-height: 100vh;
            background: #f8fafc;
        }

        /*
        |--------------------------------------------------------------------------
        | SIDEBAR
        |--------------------------------------------------------------------------
        */

        .nexra-component-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;

            width: 256px;
            height: 100vh;

            z-index: 1000;

            overflow: hidden;
        }

        /*
        |--------------------------------------------------------------------------
        | MAIN
        |--------------------------------------------------------------------------
        */

        .nexra-component-main {
            width: calc(100% - 256px);
            min-height: 100vh;

            margin-left: 256px;

            background: #f8fafc;

            overflow-x: hidden;
        }

        /*
        |--------------------------------------------------------------------------
        | HEADER
        |--------------------------------------------------------------------------
        */

        .nexra-component-header {
            position: sticky;
            top: 0;

            z-index: 900;

            width: 100%;
            min-height: 72px;

            background: rgba(255, 255, 255, 0.97);

            border-bottom: 1px solid #e2e8f0;

            backdrop-filter: blur(12px);
        }

        /*
        |--------------------------------------------------------------------------
        | CONTENT
        |--------------------------------------------------------------------------
        */

        .nexra-component-content {
            width: 100%;
            min-height: calc(100vh - 72px);

            padding: 28px;

            background: #f8fafc;
        }

        /*
        |--------------------------------------------------------------------------
        | MOBILE
        |--------------------------------------------------------------------------
        */

        @media (max-width: 1023px) {

            .nexra-component-sidebar {
                transform: translateX(-100%);
                transition: transform 0.25s ease;
            }

            .nexra-component-sidebar.mobile-open {
                transform: translateX(0);
            }

            .nexra-component-main {
                width: 100%;
                margin-left: 0;
            }

            .nexra-component-content {
                padding: 20px;
            }

        }

    </style>

    @stack('styles')

</head>

<body>

<div class="nexra-component-shell">

    {{-- Mobile overlay --}}
    <div
        id="nexra-component-overlay"
        style="
            display:none;
            position:fixed;
            inset:0;
            z-index:999;
            background:rgba(15,23,42,.55);
        "
        onclick="closeNexraComponentSidebar()"
    ></div>


    {{-- ============================================================
         FIXED SIDEBAR
    ============================================================= --}}

    <div
        id="nexra-component-sidebar"
        class="nexra-component-sidebar"
    >

        <x-sidebar />

    </div>


    {{-- ============================================================
         MAIN APPLICATION
    ============================================================= --}}

    <div class="nexra-component-main">

        {{-- HEADER --}}
        <header class="nexra-component-header">

            <div
                style="
                    min-height:72px;
                    padding:0 28px;
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:20px;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:14px;
                        min-width:0;
                    "
                >

                    {{-- Mobile menu --}}
                    <button
                        type="button"
                        onclick="openNexraComponentSidebar()"
                        id="nexra-component-menu"
                        style="
                            display:none;
                            width:40px;
                            height:40px;
                            align-items:center;
                            justify-content:center;
                            border:1px solid #e2e8f0;
                            border-radius:10px;
                            background:#ffffff;
                            color:#0f172a;
                            cursor:pointer;
                            font-size:18px;
                        "
                    >
                        ☰
                    </button>


                    <div style="min-width:0;">

                        @hasSection('page_heading')

                            <h1
                                style="
                                    margin:0;
                                    font-size:20px;
                                    line-height:28px;
                                    font-weight:700;
                                    color:#0f172a;
                                    white-space:nowrap;
                                    overflow:hidden;
                                    text-overflow:ellipsis;
                                "
                            >
                                @yield('page_heading')
                            </h1>

                        @else

                            <h1
                                style="
                                    margin:0;
                                    font-size:20px;
                                    line-height:28px;
                                    font-weight:700;
                                    color:#0f172a;
                                "
                            >
                                Nexra Workspace
                            </h1>

                        @endif


                        @hasSection('page_subtitle')

                            <p
                                style="
                                    margin:3px 0 0;
                                    font-size:13px;
                                    line-height:20px;
                                    color:#64748b;
                                "
                            >
                                @yield('page_subtitle')
                            </p>

                        @endif

                    </div>

                </div>


                {{-- USER --}}
                @auth

                    <a
                        href="{{
                            auth()->user()->role === 'manager'
                                ? route('manager.profile.show')
                                : route('employee.profile.show')
                        }}"
                        style="
                            display:flex;
                            align-items:center;
                            gap:10px;
                            text-decoration:none;
                            color:#0f172a;
                            flex-shrink:0;
                        "
                    >

                        @if(!empty(auth()->user()->profile_photo))

                            <img
                                src="{{ asset('storage/' . auth()->user()->profile_photo) }}"
                                alt="{{ auth()->user()->name }}"
                                style="
                                    width:38px;
                                    height:38px;
                                    border-radius:50%;
                                    object-fit:cover;
                                    border:2px solid #e2e8f0;
                                "
                            >

                        @else

                            <div
                                style="
                                    width:38px;
                                    height:38px;
                                    border-radius:50%;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    background:#4f46e5;
                                    color:#ffffff;
                                    font-size:13px;
                                    font-weight:700;
                                "
                            >
                                {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                            </div>

                        @endif


                        <div
                            style="
                                display:block;
                            "
                            class="nexra-header-user-info"
                        >

                            <div
                                style="
                                    font-size:13px;
                                    line-height:18px;
                                    font-weight:700;
                                "
                            >
                                {{ auth()->user()->name }}
                            </div>

                            <div
                                style="
                                    font-size:11px;
                                    line-height:16px;
                                    color:#64748b;
                                    text-transform:capitalize;
                                "
                            >
                                {{ auth()->user()->role }}
                            </div>

                        </div>

                    </a>

                @endauth

            </div>

        </header>


        {{-- ============================================================
             ACTUAL PAGE CONTENT
             
             THIS IS THE CRITICAL FIX.
             
             <x-app-layout> passes its page HTML through $slot.
        ============================================================= --}}

        <main class="nexra-component-content">

            {{-- Flash --}}
            @if(session('success'))

                <div
                    style="
                        margin-bottom:20px;
                        padding:14px 16px;
                        border:1px solid #bbf7d0;
                        border-radius:12px;
                        background:#f0fdf4;
                        color:#166534;
                        font-size:14px;
                    "
                >
                    {{ session('success') }}
                </div>

            @endif


            {{-- Error --}}
            @if(session('error'))

                <div
                    style="
                        margin-bottom:20px;
                        padding:14px 16px;
                        border:1px solid #fecaca;
                        border-radius:12px;
                        background:#fef2f2;
                        color:#991b1b;
                        font-size:14px;
                    "
                >
                    {{ session('error') }}
                </div>

            @endif


            {{-- Validation --}}
            @if($errors->any())

                <div
                    style="
                        margin-bottom:20px;
                        padding:14px 16px;
                        border:1px solid #fecaca;
                        border-radius:12px;
                        background:#fef2f2;
                        color:#991b1b;
                        font-size:14px;
                    "
                >

                    <strong>
                        Please fix the following:
                    </strong>

                    <ul style="margin:8px 0 0 18px;">

                        @foreach($errors->all() as $error)

                            <li>
                                {{ $error }}
                            </li>

                        @endforeach

                    </ul>

                </div>

            @endif


            {{-- ========================================================
                 PAGE SLOT
                 
                 Dashboard, Tasks, Projects etc. using:
                 
                 <x-app-layout>
                     ...
                 </x-app-layout>
                 
                 arrive here.
            ========================================================= --}}

            {{ $slot }}

        </main>

    </div>

</div>


<script>

    function openNexraComponentSidebar() {

        const sidebar =
            document.getElementById('nexra-component-sidebar');

        const overlay =
            document.getElementById('nexra-component-overlay');

        if (!sidebar || !overlay) {
            return;
        }

        sidebar.classList.add('mobile-open');

        overlay.style.display = 'block';
    }


    function closeNexraComponentSidebar() {

        const sidebar =
            document.getElementById('nexra-component-sidebar');

        const overlay =
            document.getElementById('nexra-component-overlay');

        if (!sidebar || !overlay) {
            return;
        }

        sidebar.classList.remove('mobile-open');

        overlay.style.display = 'none';
    }


    function handleNexraComponentResize() {

        const menu =
            document.getElementById('nexra-component-menu');

        if (!menu) {
            return;
        }

        if (window.innerWidth <= 1023) {

            menu.style.display = 'flex';

        } else {

            menu.style.display = 'none';

            closeNexraComponentSidebar();

        }

    }


    window.addEventListener(
        'resize',
        handleNexraComponentResize
    );


    document.addEventListener(
        'DOMContentLoaded',
        handleNexraComponentResize
    );

</script>


@stack('scripts')

</body>

</html>