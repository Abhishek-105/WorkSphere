@extends('layouts.app')

@section('title', 'Manager Profile')

@section('content')

    @php
        $profilePhotoUrl = null;

        if (
            $user->profile_photo &&
            \Illuminate\Support\Facades\Storage::disk('public')->exists($user->profile_photo)
        ) {
            $profilePhotoUrl = asset('storage/' . $user->profile_photo);
        }

        $initial = strtoupper(
            substr($user->name ?: 'M', 0, 1)
        );
    @endphp

    <div class="space-y-6">

        {{-- =========================================================
             SUCCESS MESSAGE
        ========================================================== --}}
        @if (session('success'))
            <div class="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-sm">

                <svg
                    class="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5 13l4 4L19 7"
                    />
                </svg>

                <div>
                    <p class="font-semibold">
                        Success
                    </p>

                    <p class="mt-0.5 text-emerald-700">
                        {{ session('success') }}
                    </p>
                </div>

            </div>
        @endif


        {{-- =========================================================
             VALIDATION ERRORS
        ========================================================== --}}
        @if ($errors->any())
            <div class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm">

                <div class="flex items-start gap-3">

                    <svg
                        class="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v3.5M12 16h.01M10.3 4.2l-7.1 12.3A2 2 0 005 19.5h14a2 2 0 001.8-3L13.7 4.2a2 2 0 00-3.4 0z"
                        />
                    </svg>

                    <div>

                        <p class="font-semibold">
                            Please check the form
                        </p>

                        <ul class="mt-2 space-y-1 text-red-700">
                            @foreach ($errors->all() as $error)
                                <li>
                                    {{ $error }}
                                </li>
                            @endforeach
                        </ul>

                    </div>

                </div>

            </div>
        @endif


        {{-- =========================================================
             PROFILE HEADER
        ========================================================== --}}
        <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-8 sm:px-8">

                <div class="flex flex-col gap-6 sm:flex-row sm:items-center">

                    {{-- Profile image --}}
                    <div class="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/20 bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-bold text-white shadow-2xl">

                        @if ($profilePhotoUrl)

                            <img
                                src="{{ $profilePhotoUrl }}"
                                alt="{{ $user->name }}"
                                class="h-full w-full object-cover"
                            >

                        @else

                            {{ $initial }}

                        @endif

                    </div>


                    <div class="min-w-0">

                        <div class="mb-2 flex flex-wrap items-center gap-2">

                            <span class="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                                Manager
                            </span>

                            <span class="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                Active
                            </span>

                        </div>

                        <h2 class="truncate text-2xl font-bold text-white sm:text-3xl">
                            {{ $user->name }}
                        </h2>

                        <p class="mt-1 truncate text-sm text-slate-400">
                            {{ $user->designation ?: 'Manager' }}
                        </p>

                        <p class="mt-2 text-xs text-slate-500">
                            {{ $user->email }}
                        </p>

                    </div>

                </div>

            </div>


            {{-- =====================================================
                 PROFILE PHOTO
            ====================================================== --}}
            <div class="border-t border-slate-100 px-6 py-6 sm:px-8">

                <div class="mb-5">

                    <h3 class="text-sm font-bold text-slate-900">
                        Profile photo
                    </h3>

                    <p class="mt-1 text-xs text-slate-500">
                        Upload a JPG, JPEG, PNG or WEBP image. Maximum size 2 MB.
                    </p>

                </div>


                {{-- Upload form --}}
                <form
                    method="POST"
                    action="{{ route('manager.profile.photo.upload') }}"
                    enctype="multipart/form-data"
                    id="profilePhotoForm"
                    class="space-y-4"
                >

                    @csrf

                    <div>

                        <label
                            for="profile_photo"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Select image
                        </label>

                        <input
                            id="profile_photo"
                            name="profile_photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            class="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-slate-900 file:px-5 file:py-3 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-600"
                        >

                        <p class="mt-2 text-xs text-slate-500">
                            Supported formats: JPG, JPEG, PNG, WEBP
                        </p>

                    </div>


                    {{-- Selected filename --}}
                    <div
                        id="selectedPhotoInfo"
                        class="hidden rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3"
                    >

                        <div class="flex items-center gap-3">

                            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">

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
                                        d="M4 16l4-4 3 3 4-5 5 6M5 20h14a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z"
                                    />
                                </svg>

                            </div>

                            <div class="min-w-0">

                                <p class="text-xs font-semibold text-indigo-900">
                                    Selected image
                                </p>

                                <p
                                    id="selectedPhotoName"
                                    class="truncate text-xs text-indigo-700"
                                ></p>

                            </div>

                        </div>

                    </div>


                    {{-- Client-side error --}}
                    <div
                        id="photoClientError"
                        class="hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                    ></div>


                    <div class="flex flex-wrap items-center gap-3">

                        <button
                            type="submit"
                            id="uploadPhotoButton"
                            class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                                    d="M4 16.5V19a1 1 0 001 1h14a1 1 0 001-1v-2.5M8 10l4-4 4 4M12 6v10"
                                />
                            </svg>

                            <span>
                                Upload photo
                            </span>

                        </button>

                    </div>

                </form>


                {{-- Remove form is intentionally separate.
                     Nested forms are invalid HTML. --}}
                @if ($user->profile_photo)

                    <form
                        method="POST"
                        action="{{ route('manager.profile.photo.remove') }}"
                        class="mt-3"
                        onsubmit="return confirm('Are you sure you want to remove the profile photo?');"
                    >

                        @csrf
                        @method('DELETE')

                        <button
                            type="submit"
                            class="rounded-xl border border-red-200 bg-white px-5 py-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                            Remove photo
                        </button>

                    </form>

                @endif

            </div>

        </section>


        {{-- =========================================================
             PERSONAL INFORMATION
        ========================================================== --}}
        <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-100 px-6 py-5 sm:px-8">

                <h2 class="text-base font-bold text-slate-900">
                    Personal information
                </h2>

                <p class="mt-1 text-xs text-slate-500">
                    Update your basic account information.
                </p>

            </div>


            <form
                method="POST"
                action="{{ route('manager.profile.update') }}"
                class="p-6 sm:p-8"
            >

                @csrf
                @method('PUT')

                <div class="grid gap-5 md:grid-cols-2">

                    <div>

                        <label
                            for="name"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Full name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value="{{ old('name', $user->name) }}"
                            required
                            maxlength="255"
                            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('name')
                            <p class="mt-1.5 text-xs text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    <div>

                        <label
                            for="email"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Email address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value="{{ old('email', $user->email) }}"
                            required
                            maxlength="255"
                            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('email')
                            <p class="mt-1.5 text-xs text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    <div>

                        <label
                            for="phone"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Phone
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            value="{{ old('phone', $user->phone) }}"
                            maxlength="30"
                            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('phone')
                            <p class="mt-1.5 text-xs text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    <div>

                        <label
                            for="designation"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Designation
                        </label>

                        <input
                            id="designation"
                            name="designation"
                            type="text"
                            value="{{ old('designation', $user->designation) }}"
                            maxlength="255"
                            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('designation')
                            <p class="mt-1.5 text-xs text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>

                </div>


                <div class="mt-6 flex justify-end">

                    <button
                        type="submit"
                        class="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        Save changes
                    </button>

                </div>

            </form>

        </section>


        {{-- =========================================================
             CHANGE PASSWORD
        ========================================================== --}}
        <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div class="border-b border-slate-100 px-6 py-5 sm:px-8">

                <h2 class="text-base font-bold text-slate-900">
                    Change password
                </h2>

                <p class="mt-1 text-xs text-slate-500">
                    Use a strong password with at least 8 characters.
                </p>

            </div>


            <form
                method="POST"
                action="{{ route('manager.profile.password.update') }}"
                class="p-6 sm:p-8"
            >

                @csrf
                @method('PUT')

                <div class="grid gap-5 md:grid-cols-3">

                    <div>

                        <label
                            for="current_password"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Current password
                        </label>

                        <input
                            id="current_password"
                            name="current_password"
                            type="password"
                            required
                            autocomplete="current-password"
                            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('current_password')
                            <p class="mt-1.5 text-xs text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    <div>

                        <label
                            for="password"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            New password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minlength="8"
                            autocomplete="new-password"
                            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                        @error('password')
                            <p class="mt-1.5 text-xs text-red-600">
                                {{ $message }}
                            </p>
                        @enderror

                    </div>


                    <div>

                        <label
                            for="password_confirmation"
                            class="mb-2 block text-xs font-semibold text-slate-700"
                        >
                            Confirm password
                        </label>

                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            required
                            minlength="8"
                            autocomplete="new-password"
                            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        >

                    </div>

                </div>


                <div class="mt-6 flex justify-end">

                    <button
                        type="submit"
                        class="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        Update password
                    </button>

                </div>

            </form>

        </section>

    </div>


    {{-- =============================================================
         PROFILE PHOTO CLIENT-SIDE VALIDATION
    ============================================================== --}}
    <script>
        document.addEventListener('DOMContentLoaded', function () {

            const form = document.getElementById('profilePhotoForm');
            const input = document.getElementById('profile_photo');
            const info = document.getElementById('selectedPhotoInfo');
            const fileName = document.getElementById('selectedPhotoName');
            const error = document.getElementById('photoClientError');
            const button = document.getElementById('uploadPhotoButton');

            if (!form || !input) {
                return;
            }

            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];

            const maxSize = 2 * 1024 * 1024;

            input.addEventListener('change', function () {

                error.classList.add('hidden');
                error.textContent = '';

                info.classList.add('hidden');
                fileName.textContent = '';

                button.disabled = false;

                const file = input.files && input.files.length
                    ? input.files[0]
                    : null;

                if (!file) {
                    return;
                }

                if (!allowedTypes.includes(file.type)) {

                    error.textContent =
                        'Please select a JPG, JPEG, PNG or WEBP image.';

                    error.classList.remove('hidden');

                    input.value = '';

                    return;
                }

                if (file.size > maxSize) {

                    error.textContent =
                        'The profile photo must not be larger than 2 MB.';

                    error.classList.remove('hidden');

                    input.value = '';

                    return;
                }

                fileName.textContent =
                    file.name + ' (' +
                    Math.round(file.size / 1024) +
                    ' KB)';

                info.classList.remove('hidden');
            });


            form.addEventListener('submit', function (event) {

                const file = input.files && input.files.length
                    ? input.files[0]
                    : null;

                error.classList.add('hidden');
                error.textContent = '';

                if (!file) {

                    event.preventDefault();

                    error.textContent =
                        'Please select a profile photo before clicking Upload photo.';

                    error.classList.remove('hidden');

                    input.focus();

                    return;
                }

                if (!allowedTypes.includes(file.type)) {

                    event.preventDefault();

                    error.textContent =
                        'Please select a JPG, JPEG, PNG or WEBP image.';

                    error.classList.remove('hidden');

                    return;
                }

                if (file.size > maxSize) {

                    event.preventDefault();

                    error.textContent =
                        'The profile photo must not be larger than 2 MB.';

                    error.classList.remove('hidden');

                    return;
                }

                button.disabled = true;

                const buttonText = button.querySelector('span');

                if (buttonText) {
                    buttonText.textContent = 'Uploading...';
                }
            });

        });
    </script>

@endsection