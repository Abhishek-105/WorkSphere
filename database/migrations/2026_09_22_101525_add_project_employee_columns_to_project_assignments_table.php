```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('project_assignments', function (Blueprint $table) {
            $table->foreignId('project_id')
                ->after('id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->foreignId('employee_id')
                ->after('project_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->unique([
                'project_id',
                'employee_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_assignments', function (Blueprint $table) {
            $table->dropUnique([
                'project_assignments_project_id_employee_id_unique',
            ]);

            $table->dropForeign([
                'project_id',
            ]);

            $table->dropForeign([
                'employee_id',
            ]);

            $table->dropColumn([
                'project_id',
                'employee_id',
            ]);
        });
    }
};
