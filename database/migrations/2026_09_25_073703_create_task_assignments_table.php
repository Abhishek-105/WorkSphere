<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_updates', function (Blueprint $table) {
            if (!Schema::hasColumn('daily_updates', 'blocker_details')) {
                $table->text('blocker_details')->nullable()->after('work_description');
            }

            if (!Schema::hasColumn('daily_updates', 'plans_for_tomorrow')) {
                $table->text('plans_for_tomorrow')->nullable()->after('blocker_details');
            }

            if (!Schema::hasColumn('daily_updates', 'reviewed_by')) {
                $table->foreignId('reviewed_by')
                    ->nullable()
                    ->after('status')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'reviewed_at')) {
                $table->timestamp('reviewed_at')
                    ->nullable()
                    ->after('reviewed_by');
            }

            if (!Schema::hasColumn('daily_updates', 'blocker_acknowledged_by')) {
                $table->foreignId('blocker_acknowledged_by')
                    ->nullable()
                    ->after('reviewed_at')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('daily_updates', 'blocker_acknowledged_at')) {
                $table->timestamp('blocker_acknowledged_at')
                    ->nullable()
                    ->after('blocker_acknowledged_by');
            }

            if (!Schema::hasColumn('daily_updates', 'manager_comment')) {
                $table->text('manager_comment')
                    ->nullable()
                    ->after('blocker_acknowledged_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('daily_updates', function (Blueprint $table) {
            if (Schema::hasColumn('daily_updates', 'manager_comment')) {
                $table->dropColumn('manager_comment');
            }

            if (Schema::hasColumn('daily_updates', 'blocker_acknowledged_at')) {
                $table->dropColumn('blocker_acknowledged_at');
            }

            if (Schema::hasColumn('daily_updates', 'blocker_acknowledged_by')) {
                $table->dropForeign(['blocker_acknowledged_by']);
                $table->dropColumn('blocker_acknowledged_by');
            }

            if (Schema::hasColumn('daily_updates', 'reviewed_at')) {
                $table->dropColumn('reviewed_at');
            }

            if (Schema::hasColumn('daily_updates', 'reviewed_by')) {
                $table->dropForeign(['reviewed_by']);
                $table->dropColumn('reviewed_by');
            }

            if (Schema::hasColumn('daily_updates', 'plans_for_tomorrow')) {
                $table->dropColumn('plans_for_tomorrow');
            }

            if (Schema::hasColumn('daily_updates', 'blocker_details')) {
                $table->dropColumn('blocker_details');
            }
        });
    }
};