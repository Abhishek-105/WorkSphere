<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 30)->nullable()->after('email');
            }

            if (!Schema::hasColumn('users', 'designation')) {
                $table->string('designation', 100)->nullable()->after('phone');
            }

            if (!Schema::hasColumn('users', 'profile_photo')) {
                $table->string('profile_photo')->nullable()->after('designation');
            }

            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status', 30)->default('active')->after('profile_photo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('users', 'phone')) {
                $columns[] = 'phone';
            }

            if (Schema::hasColumn('users', 'designation')) {
                $columns[] = 'designation';
            }

            if (Schema::hasColumn('users', 'profile_photo')) {
                $columns[] = 'profile_photo';
            }

            if (Schema::hasColumn('users', 'status')) {
                $columns[] = 'status';
            }

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};