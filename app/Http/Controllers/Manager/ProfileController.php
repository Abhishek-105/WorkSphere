<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * Get the authenticated manager.
     */
    private function manager(): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        abort_unless(
            $user instanceof User && $user->isManager(),
            403
        );

        return $user;
    }

    /**
     * Display manager profile.
     */
    public function index(): View
    {
        $user = $this->manager();

        return view('manager.profile.index', compact('user'));
    }

    /**
     * Update manager profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $this->manager();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'designation' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        $user->update($validated);

        return back()->with(
            'success',
            'Your profile information has been updated successfully.'
        );
    }

    /**
     * Upload or replace manager profile photo.
     */
    public function updatePhoto(Request $request): RedirectResponse
    {
        $user = $this->manager();

        $validated = $request->validate([
            'profile_photo' => [
                'required',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $file = $validated['profile_photo'];

        /*
         * Store the new image first.
         *
         * This prevents us from deleting the old image
         * before the new upload has successfully completed.
         */
        $newPhoto = $file->store(
            'profile-photos',
            'public'
        );

        if (!$newPhoto) {
            return back()->withErrors([
                'profile_photo' => 'The profile photo could not be uploaded. Please try again.',
            ]);
        }

        $oldPhoto = $user->profile_photo;

        $user->update([
            'profile_photo' => $newPhoto,
        ]);

        /*
         * Delete the old image only after the new image
         * has been successfully stored and saved.
         */
        if (
            $oldPhoto &&
            Storage::disk('public')->exists($oldPhoto)
        ) {
            Storage::disk('public')->delete($oldPhoto);
        }

        return back()->with(
            'success',
            'Profile photo updated successfully.'
        );
    }

    /**
     * Remove manager profile photo.
     */
    public function removePhoto(): RedirectResponse
    {
        $user = $this->manager();

        $oldPhoto = $user->profile_photo;

        if ($oldPhoto) {
            if (
                Storage::disk('public')->exists($oldPhoto)
            ) {
                Storage::disk('public')->delete($oldPhoto);
            }

            $user->update([
                'profile_photo' => null,
            ]);
        }

        return back()->with(
            'success',
            'Profile photo removed successfully.'
        );
    }

    /**
     * Update manager password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $this->manager();

        $validated = $request->validate([
            'current_password' => [
                'required',
                'current_password',
            ],

            'password' => [
                'required',
                'confirmed',
                'min:8',
            ],
        ]);

        $user->update([
            'password' => Hash::make(
                $validated['password']
            ),
        ]);

        return back()->with(
            'success',
            'Your password has been changed successfully.'
        );
    }
}
