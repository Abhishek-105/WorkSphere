<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_updates', function (Blueprint $table) {
            if (!Schema::hasColumn('daily_updates', 'employee_id')) {
                $table->foreignId('employee_id')->after('id')->constrained('users')->cascadeOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'project_id')) {
                $table->foreignId('project_id')->after('employee_id')->constrained('projects')->cascadeOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'task_id')) {
                $table->foreignId('task_id')->after('project_id')->nullable()->constrained('tasks')->nullOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'update_date')) {
                $table->date('update_date')->after('task_id');
            }

            if (!Schema::hasColumn('daily_updates', 'work_description')) {
                $table->text('work_description')->after('update_date');
            }

            if (!Schema::hasColumn('daily_updates', 'hours_spent')) {
                $table->decimal('hours_spent', 5, 2)->after('work_description');
            }

            if (!Schema::hasColumn('daily_updates', 'status')) {
                $table->string('status')->default('done')->after('hours_spent');
            }

            if (!Schema::hasColumn('daily_updates', 'attached_file')) {
                $table->string('attached_file')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('daily_updates', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropForeign(['project_id']);
            $table->dropForeign(['task_id']);

            $table->dropColumn([
                'employee_id',
                'project_id',
                'task_id',
                'update_date',
                'work_description',
                'hours_spent',
                'status',
                'attached_file',
            ]);
        });
    }
};