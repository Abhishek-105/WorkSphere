<?php

namespace App\Observers;

use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\Task;
use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Model;

class ActivityObserver
{
    public function __construct(
        private readonly ActivityLogger $logger
    ) {
    }

    public function created(Model $model): void
    {
        if (!$this->supported($model)) {
            return;
        }

        $this->logger->created($model);
    }

    public function updated(Model $model): void
    {
        if (!$this->supported($model)) {
            return;
        }

        $this->logger->updated($model);
    }

    public function deleted(Model $model): void
    {
        if (!$this->supported($model)) {
            return;
        }

        $this->logger->deleted($model);
    }

    private function supported(Model $model): bool
    {
        return $model instanceof Project
            || $model instanceof Task
            || $model instanceof DailyUpdate;
    }
}