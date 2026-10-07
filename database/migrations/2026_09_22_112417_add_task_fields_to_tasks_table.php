```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreignId('project_id')
                ->nullable()
                ->after('id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->foreignId('assigned_to')
                ->nullable()
                ->after('project_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title')
                ->after('assigned_to');

            $table->text('description')
                ->nullable()
                ->after('title');

            $table->string('priority')
                ->default('medium')
                ->after('status');

            $table->foreignId('created_by')
                ->nullable()
                ->after('priority')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropForeign(['assigned_to']);
            $table->dropForeign(['created_by']);

            $table->dropColumn([
                'project_id',
                'assigned_to',
                'title',
                'description',
                'priority',
                'created_by',
            ]);
        });
    }
};