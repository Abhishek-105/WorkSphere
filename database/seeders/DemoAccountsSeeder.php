<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'demo.manager@worksphere.com'],
            [
                'name' => 'Demo Manager',
                'password' => Hash::make('Demo@123456'),
                'role' => 'manager',
                'status' => 'active',
                'is_demo' => true,
                'phone' => null,
                'designation' => 'Demo Manager',
                'profile_photo' => null,
            ]
        );

        User::updateOrCreate(
            ['email' => 'demo.employee@worksphere.com'],
            [
                'name' => 'Demo Employee',
                'password' => Hash::make('Demo@123456'),
                'role' => 'employee',
                'status' => 'active',
                'is_demo' => true,
                'phone' => null,
                'designation' => 'Demo Employee',
                'profile_photo' => null,
            ]
        );
    }
}