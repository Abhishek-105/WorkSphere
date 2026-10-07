<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    public function log(
        string $action,
        string $description,
        ?Model $subject = null,
        array $metadata = []
    ): ?ActivityLog {
        $actorId = Auth::id();

        if (!$actorId) {
            return null;
        }

        $data = [
            'actor_id' => (int) $actorId,
            'action' => $action,
            'description' => $description,
            'project_id' => null,
            'task_id' => null,
            'daily_update_id' => null,
            'metadata' => $metadata ?: null,
        ];

        if ($subject instanceof Project) {
            if ($action !== 'project.deleted') {
                $data['project_id'] = $subject->getKey();
            }
        }

        if ($subject instanceof Task) {
            if ($action !== 'task.deleted') {
                $data['task_id'] = $subject->getKey();
                $data['project_id'] = $subject->project_id;
            }
        }

        if ($subject instanceof DailyUpdate) {
            if ($action !== 'daily_update.deleted') {
                $data['daily_update_id'] = $subject->getKey();
                $data['project_id'] = $subject->project_id;
                $data['task_id'] = $subject->task_id;
            }
        }

        return ActivityLog::create($data);
    }

    public function created(Model $model): ?ActivityLog
    {
        return $this->log(
            $this->actionName($model, 'created'),
            $this->createdDescription($model),
            $model
        );
    }

    public function updated(Model $model): ?ActivityLog
    {
        $changes = $model->getChanges();

        unset($changes['updated_at']);

        return $this->log(
            $this->actionName($model, 'updated'),
            $this->updatedDescription($model),
            $model,
            [
                'changes' => $changes,
            ]
        );
    }

    public function deleted(Model $model): ?ActivityLog
    {
        return $this->log(
            $this->actionName($model, 'deleted'),
            $this->deletedDescription($model),
            $model
        );
    }

    private function actionName(
        Model $model,
        string $event
    ): string {
        $type = match (true) {
            $model instanceof Project => 'project',
            $model instanceof Task => 'task',
            $model instanceof DailyUpdate => 'daily_update',
            default => 'record',
        };

        return $type . '.' . $event;
    }

    private function createdDescription(Model $model): string
    {
        if ($model instanceof Project) {
            return 'Created project "' . $model->title . '".';
        }

        if ($model instanceof Task) {
            return 'Created task "' . $model->title . '".';
        }

        if ($model instanceof DailyUpdate) {
            return 'Submitted a daily work update.';
        }

        return 'Created a record.';
    }

    private function updatedDescription(Model $model): string
    {
        if ($model instanceof Project) {
            return 'Updated project "' . $model->title . '".';
        }

        if ($model instanceof Task) {
            return 'Updated task "' . $model->title . '".';
        }

        if ($model instanceof DailyUpdate) {
            if ($model->status === 'reviewed') {
                return 'Reviewed a daily work update.';
            }

            return 'Updated a daily work update.';
        }

        return 'Updated a record.';
    }

    private function deletedDescription(Model $model): string
    {
        if ($model instanceof Project) {
            return 'Deleted project "' . $model->title . '".';
        }

        if ($model instanceof Task) {
            return 'Deleted task "' . $model->title . '".';
        }

        if ($model instanceof DailyUpdate) {
            return 'Deleted a daily work update.';
        }

        return 'Deleted a record.';
    }
}
