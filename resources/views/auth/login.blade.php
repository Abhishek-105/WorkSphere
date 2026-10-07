<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Login - Nexra</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="min-h-screen bg-slate-100 flex items-center justify-center px-4">

    <div class="w-full max-w-md">

        <!-- Company Logo -->
        <div class="text-center mb-8">

            <div class="flex justify-center items-center h-20">

                <img
                    src="{{ asset('images/netfrux-logo-animated.svg') }}"
                    alt="Netfrux Technologies"
                    class="h-16 w-auto max-w-[260px] object-contain"
                >

            </div>

            <h1 class="mt-4 text-3xl font-bold text-slate-900">
                Nexra
            </h1>

            <p class="mt-1 text-sm text-slate-500">
                Team Workflow & Project Management
            </p>

        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

            <div class="mb-6">

                <h2 class="text-xl font-semibold text-slate-900">
                    Welcome back
                </h2>

                <p class="text-sm text-slate-500 mt-1">
                    Sign in to continue to Nexra
                </p>

            </div>

            @if ($errors->any())

                <div class="mb-5 rounded-lg bg-red-50 border border-red-200 p-4">

                    <ul class="text-sm text-red-600 space-y-1">

                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach

                    </ul>

                </div>

            @endif

            <form method="POST" action="{{ route('login') }}" class="space-y-5">

                @csrf

                <div>

                    <label
                        for="email"
                        class="block text-sm font-medium text-slate-700 mb-2"
                    >
                        Email Address
                    </label>

                    <input
                        type="email"
                        id="email"
                        name="email"
                        value="{{ old('email') }}"
                        required
                        autofocus
                        placeholder="you@example.com"
                        class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
                               focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                               outline-none transition"
                    >

                </div>

                <div>

                    <label
                        for="password"
                        class="block text-sm font-medium text-slate-700 mb-2"
                    >
                        Password
                    </label>

                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        placeholder="Enter your password"
                        class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm
                               focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                               outline-none transition"
                    >

                </div>

                <div class="flex items-center">

                    <label class="flex items-center gap-2 text-sm text-slate-600">

                        <input
                            type="checkbox"
                            name="remember"
                            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        >

                        Remember me

                    </label>

                </div>

                <button
                    type="submit"
                    class="w-full rounded-xl bg-indigo-600 px-4 py-3
                           text-sm font-semibold text-white
                           hover:bg-indigo-700
                           focus:outline-none focus:ring-2 focus:ring-indigo-500
                           focus:ring-offset-2
                           transition"
                >
                    Sign In
                </button>

            </form>

        </div>

        <!-- Footer -->
        <div class="text-center mt-6">

            <p class="text-xs text-slate-400">
                © {{ date('Y') }} Netfrux Technologies
            </p>

            <p class="text-xs text-slate-400 mt-1">
                Nexra • Team Workflow & Project Management
            </p>

        </div>

    </div>

</body>
</html>