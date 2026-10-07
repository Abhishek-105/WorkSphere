<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_updates', function (Blueprint $table) {
            if (!Schema::hasColumn('daily_updates', 'user_id')) {
                $table->foreignId('user_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('users')
                    ->cascadeOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'project_id')) {
                $table->foreignId('project_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('projects')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'task_id')) {
                $table->foreignId('task_id')
                    ->nullable()
                    ->after('project_id')
                    ->constrained('tasks')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'summary')) {
                $table->text('summary')->nullable();
            }

            if (!Schema::hasColumn('daily_updates', 'hours_logged')) {
                $table->decimal('hours_logged', 5, 2)
                    ->default(0);
            }

            if (!Schema::hasColumn('daily_updates', 'blocker_details')) {
                $table->text('blocker_details')->nullable();
            }

            if (!Schema::hasColumn('daily_updates', 'plans_for_tomorrow')) {
                $table->text('plans_for_tomorrow')->nullable();
            }

            if (!Schema::hasColumn('daily_updates', 'status')) {
                $table->string('status')
                    ->default('pending');
            }

            if (!Schema::hasColumn('daily_updates', 'reviewed_by')) {
                $table->foreignId('reviewed_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable();
            }

            if (!Schema::hasColumn('daily_updates', 'blocker_acknowledged_by')) {
                $table->foreignId('blocker_acknowledged_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'blocker_acknowledged_at')) {
                $table->timestamp('blocker_acknowledged_at')->nullable();
            }

            if (!Schema::hasColumn('daily_updates', 'manager_comment')) {
                $table->text('manager_comment')->nullable();
            }

            if (!Schema::hasColumn('daily_updates', 'submitted_for')) {
                $table->date('submitted_for')
                    ->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('daily_updates', function (Blueprint $table) {
            $columns = [
                'manager_comment',
                'blocker_acknowledged_at',
                'blocker_acknowledged_by',
                'reviewed_at',
                'reviewed_by',
                'status',
                'plans_for_tomorrow',
                'blocker_details',
                'hours_logged',
                'summary',
                'task_id',
                'project_id',
                'user_id',
                'submitted_for',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('daily_updates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};