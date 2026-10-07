<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\User;
use App\Models\Task;
use App\Models\ProjectFile;
use App\Models\DailyUpdate;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'start_date',
        'end_date',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Manager who created the project.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Employees assigned to this project.
     *
     * Pivot table: project_assignments
     */
    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'project_assignments',
            'project_id',
            'employee_id'
        )->withTimestamps();
    }

    /**
     * Tasks belonging to this project.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'project_id');
    }

    /**
     * Files uploaded to this project.
     */
    public function files(): HasMany
    {
        return $this->hasMany(ProjectFile::class, 'project_id');
    }

    /**
     * Daily updates related to this project.
     */
    public function dailyUpdates(): HasMany
    {
        return $this->hasMany(DailyUpdate::class, 'project_id');
    }
}