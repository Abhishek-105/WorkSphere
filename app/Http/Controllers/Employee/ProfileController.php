<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class ProfileController extends Controller
{
    private function employee(): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        return $user;
    }

    public function index(): View
    {
        $user = $this->employee();

        return view('employee.profile.index', compact('user'));
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $this->employee();

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

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $this->employee();

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
