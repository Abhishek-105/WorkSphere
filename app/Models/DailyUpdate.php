<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'project_id',
        'task_id',
        'update_date',
        'work_description',
        'hours_spent',
        'status',
        'attached_file',

        'blocker_details',
        'plans_for_tomorrow',

        'reviewed_by',
        'reviewed_at',

        'blocker_acknowledged_by',
        'blocker_acknowledged_at',

        'manager_comment',
    ];

    protected $casts = [
        'update_date' => 'date',
        'reviewed_at' => 'datetime',
        'blocker_acknowledged_at' => 'datetime',
        'hours_spent' => 'decimal:2',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function blockerAcknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'blocker_acknowledged_by'
        );
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function hasBlocker(): bool
    {
        return !empty(trim((string) $this->blocker_details));
    }

    public function isReviewed(): bool
    {
        return $this->status === 'reviewed';
    }

    public function blockerAcknowledged(): bool
    {
        return !is_null($this->blocker_acknowledged_at);
    }
}