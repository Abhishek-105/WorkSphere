<?php

namespace App\Providers;

use App\Models\DailyUpdate;
use App\Models\Project;
use App\Models\Task;
use App\Observers\ActivityObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Project::observe(ActivityObserver::class);
        Task::observe(ActivityObserver::class);
        DailyUpdate::observe(ActivityObserver::class);
    }
}