<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionManagerSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'manager@netfrux.com',
            ],
            [
                'name' => 'Abhishek Sharma',
                'password' => Hash::make('123456'),
                'role' => 'manager',
                'status' => 'active',
            ]
        );

        $this->command->info(
            'Production manager account created/updated successfully.'
        );
    }
}