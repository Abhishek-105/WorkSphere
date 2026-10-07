```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_files', function (Blueprint $table) {
            $table->foreignId('project_id')
                ->after('id')
                ->constrained('projects')
                ->cascadeOnDelete();

            $table->foreignId('uploaded_by')
                ->after('project_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('file_name')
                ->after('uploaded_by');

            $table->string('file_path')
                ->after('file_name');

            $table->string('file_type')
                ->nullable()
                ->after('file_path');

            $table->timestamp('uploaded_at')
                ->nullable()
                ->after('file_type');
        });
    }

    public function down(): void
    {
        Schema::table('project_files', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropForeign(['uploaded_by']);

            $table->dropColumn([
                'project_id',
                'uploaded_by',
                'file_name',
                'file_path',
                'file_type',
                'uploaded_at',
            ]);
        });
    }
};