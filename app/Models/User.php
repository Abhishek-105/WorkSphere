<?php

namespace App\Models;

use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'designation',
        'profile_photo',
        'status',
        'is_demo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_demo' => 'boolean',
        ];
    }

    // Relationships
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(
            Project::class,
            'project_assignments',
            'employee_id',
            'project_id'
        )->withTimestamps();
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(
            Task::class,
            'assigned_to'
        );
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(
            Task::class,
            'assigned_to'
        );
    }

    public function dailyUpdates(): HasMany
    {
        return $this->hasMany(
            DailyUpdate::class,
            'employee_id'
        );
    }

    // Helper Functions
    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isEmployee(): bool
    {
        return $this->role === 'employee';
    }

    public function isDemo(): bool
    {
        return $this->is_demo === true;
    }
}