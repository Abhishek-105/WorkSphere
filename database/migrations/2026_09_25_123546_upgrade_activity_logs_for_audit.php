<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table): void {
                $table->id();

                $table->foreignId('actor_id')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                $table->string('action', 100);
                $table->text('description');

                $table->foreignId('project_id')
                    ->nullable()
                    ->constrained('projects')
                    ->nullOnDelete();

                $table->foreignId('task_id')
                    ->nullable()
                    ->constrained('tasks')
                    ->nullOnDelete();

                $table->foreignId('daily_update_id')
                    ->nullable()
                    ->constrained('daily_updates')
                    ->nullOnDelete();

                $table->json('metadata')->nullable();

                $table->timestamps();

                $table->index(['actor_id', 'created_at']);
                $table->index(['project_id', 'created_at']);
                $table->index(['task_id', 'created_at']);
                $table->index(['daily_update_id', 'created_at']);
                $table->index(['action', 'created_at']);
            });

            return;
        }

        if (!Schema::hasColumn('activity_logs', 'actor_id')) {
            Schema::table('activity_logs', function (Blueprint $table): void {
                $table->foreignId('actor_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('users')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('activity_logs', 'action')) {
            Schema::table('activity_logs', function (Blueprint $table): void {
                $table->string('action', 100)
                    ->nullable()
                    ->after('actor_id');
            });
        }

        if (!Schema::hasColumn('activity_logs', 'description')) {
            Schema::table('activity_logs', function (Blueprint $table): void {
                $table->text('description')
                    ->nullable()
                    ->after('action');
            });
        }

        if (!Schema::hasColumn('activity_logs', 'project_id')) {
            Schema::table('activity_logs', function (Blueprint $table): void {
                $table->foreignId('project_id')
                    ->nullable()
                    ->after('description')
                    ->constrained('projects')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('activity_logs', 'task_id')) {
            Schema::table('activity_logs', function (Blueprint $table): void {
                $table->foreignId('task_id')
                    ->nullable()
                    ->after('project_id')
                    ->constrained('tasks')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('activity_logs', 'daily_update_id')) {
            Schema::table('activity_logs', function (Blueprint $table): void {
                $table->foreignId('daily_update_id')
                    ->nullable()
                    ->after('task_id')
                    ->constrained('daily_updates')
                    ->nullOnDelete();
            });
        }

        if (!Schema::hasColumn('activity_logs', 'metadata')) {
            Schema::table('activity_logs', function (Blueprint $table): void {
                $table->json('metadata')
                    ->nullable()
                    ->after('daily_update_id');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('activity_logs')) {
            return;
        }

        $columns = [
            'actor_id',
            'project_id',
            'task_id',
            'daily_update_id',
            'metadata',
            'action',
            'description',
        ];

        foreach ($columns as $column) {
            if (Schema::hasColumn('activity_logs', $column)) {
                Schema::table('activity_logs', function (Blueprint $table) use ($column): void {
                    try {
                        $table->dropColumn($column);
                    } catch (\Throwable $exception) {
                        // Ignore rollback issues caused by existing schema constraints.
                    }
                });
            }
        }
    }
};