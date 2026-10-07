<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_assignments', function (Blueprint $table) {
            if (!Schema::hasColumn('project_assignments', 'project_id')) {
                $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            }
            if (!Schema::hasColumn('project_assignments', 'employee_id')) {
                $table->foreignId('employee_id')->constrained('users')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('project_assignments', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropForeign(['employee_id']);
            $table->dropColumn(['project_id', 'employee_id']);
        });
    }
};