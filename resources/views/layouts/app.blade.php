<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>
        @hasSection('title')
            @yield('title') - Nexra Workspace
        @else
            Nexra Workspace
        @endif
    </title>

    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
    >

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
            font-family: 'Inter', sans-serif;
            background: #f8fafc;
        }

        body {
            overflow-x: hidden;
        }

        .nexra-app {
            min-height: 100vh;
            width: 100%;
            background: #f8fafc;
        }

        /*
        |--------------------------------------------------------------------------
        | Sidebar
        |--------------------------------------------------------------------------
        */

        .nexra-sidebar-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 256px;
            height: 100vh;
            z-index: 1000;
        }

        /*
        |--------------------------------------------------------------------------
        | Main Application
        |--------------------------------------------------------------------------
        */

        .nexra-main {
            min-height: 100vh;
            width: calc(100% - 256px);
            margin-left: 256px;
            background: #f8fafc;
            overflow-x: hidden;
        }

        /*
        |--------------------------------------------------------------------------
        | Header
        |--------------------------------------------------------------------------
        */

        .nexra-header {
            position: sticky;
            top: 0;
            z-index: 900;
            min-height: 72px;
            width: 100%;
            background: rgba(255, 255, 255, 0.96);
            border-bottom: 1px solid #e2e8f0;
            backdrop-filter: blur(12px);
        }

        /*
        |--------------------------------------------------------------------------
        | Page Content
        |--------------------------------------------------------------------------
        */

        .nexra-content {
            width: 100%;
            min-height: calc(100vh - 72px);
            padding: 28px;
            box-sizing: border-box;
        }

        /*
        |--------------------------------------------------------------------------
        | Mobile
        |--------------------------------------------------------------------------
        */

        @media (max-width: 1023px) {
            .nexra-sidebar-wrapper {
                width: 256px;
                transform: translateX(-100%);
                transition: transform 0.25s ease;
            }

            .nexra-sidebar-wrapper.mobile-open {
                transform: translateX(0);
            }

            .nexra-main {
                width: 100%;
                margin-left: 0;
            }

            .nexra-content {
                padding: 20px;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Safety: page content must remain visible
        |--------------------------------------------------------------------------
        */

        .nexra-page-body {
            display: block;
            width: 100%;
            min-height: 300px;
            color: #0f172a;
        }
    </style>

    @stack('styles')
</head>

<body>

<div class="nexra-app">

    {{-- Mobile overlay --}}
    <div
        id="nexra-mobile-overlay"
        style="
            display:none;
            position:fixed;
            inset:0;
            background:rgba(15,23,42,.55);
            z-index:999;
        "
        onclick="closeNexraSidebar()"
    ></div>

    {{-- Fixed Sidebar --}}
    <div
        id="nexra-sidebar-wrapper"
        class="nexra-sidebar-wrapper"
    >
        <x-sidebar />
    </div>

    {{-- Main Application --}}
    <div class="nexra-main">

        {{-- Header --}}
        <header class="nexra-header">

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

                <div style="min-width:0;">

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                        "
                    >

                        {{-- Mobile menu --}}
                        <button
                            type="button"
                            onclick="openNexraSidebar()"
                            style="
                                display:none;
                                width:40px;
                                height:40px;
                                border:1px solid #e2e8f0;
                                border-radius:10px;
                                background:#ffffff;
                                cursor:pointer;
                                align-items:center;
                                justify-content:center;
                            "
                            id="nexra-mobile-menu"
                        >
                            ☰
                        </button>

                        <div>
                            @hasSection('page_heading')
                                <h1
                                    style="
                                        margin:0;
                                        font-size:20px;
                                        line-height:28px;
                                        font-weight:700;
                                        color:#0f172a;
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

                </div>

                {{-- Header User --}}
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

                        @if(auth()->user()->profile_photo)
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
                                    background:#0f172a;
                                    color:#ffffff;
                                    font-size:13px;
                                    font-weight:700;
                                "
                            >
                                {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                            </div>
                        @endif

                        <div class="hidden md:block">
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

        {{-- Page Content --}}
        <main class="nexra-content">

            {{-- Flash Messages --}}
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
                    <strong>Please fix the following:</strong>

                    <ul style="margin:8px 0 0 18px;">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            {{-- IMPORTANT: support the actual section used by pages --}}
            <div class="nexra-page-body">

                @if(View::hasSection('content'))

                    @yield('content')

                @elseif(View::hasSection('main'))

                    @yield('main')

                @elseif(View::hasSection('body'))

                    @yield('body')

                @else

                    <div
                        style="
                            padding:32px;
                            border:1px solid #e2e8f0;
                            border-radius:16px;
                            background:#ffffff;
                        "
                    >
                        <h2
                            style="
                                margin:0 0 8px;
                                font-size:18px;
                                font-weight:700;
                                color:#0f172a;
                            "
                        >
                            Page content not found
                        </h2>

                        <p
                            style="
                                margin:0;
                                font-size:14px;
                                color:#64748b;
                            "
                        >
                            This page does not define a content, main, or body section.
                        </p>
                    </div>

                @endif

            </div>

        </main>

    </div>

</div>

<script>
    function openNexraSidebar() {
        const sidebar = document.getElementById('nexra-sidebar-wrapper');
        const overlay = document.getElementById('nexra-mobile-overlay');

        if (!sidebar || !overlay) {
            return;
        }

        sidebar.classList.add('mobile-open');

        overlay.style.display = 'block';
    }

    function closeNexraSidebar() {
        const sidebar = document.getElementById('nexra-sidebar-wrapper');
        const overlay = document.getElementById('nexra-mobile-overlay');

        if (!sidebar || !overlay) {
            return;
        }

        sidebar.classList.remove('mobile-open');

        overlay.style.display = 'none';
    }

    function handleNexraResize() {
        const menu = document.getElementById('nexra-mobile-menu');

        if (!menu) {
            return;
        }

        if (window.innerWidth <= 1023) {
            menu.style.display = 'flex';
        } else {
            menu.style.display = 'none';
            closeNexraSidebar();
        }
    }

    window.addEventListener('resize', handleNexraResize);

    document.addEventListener('DOMContentLoaded', handleNexraResize);
</script>

@stack('scripts')

</body>
</html>