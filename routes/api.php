<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Employee\DashboardController as EmployeeDashboardController;
use App\Http\Controllers\Api\Employee\DailyUpdateController as EmployeeDailyUpdateController;
use App\Http\Controllers\Api\Employee\ProjectController as EmployeeProjectController;
use App\Http\Controllers\Api\Employee\TaskController as EmployeeTaskController;
use App\Http\Controllers\Api\Manager\DashboardController as ManagerDashboardController;
use App\Http\Controllers\Api\Manager\DailyUpdateController as ManagerDailyUpdateController;
use App\Http\Controllers\Api\Manager\ProjectController as ManagerProjectController;
use App\Http\Controllers\Api\Manager\TaskController as ManagerTaskController;
use App\Http\Controllers\Api\Manager\TeamController as ManagerTeamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Authenticated API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::get('/user', [AuthController::class, 'user']);

    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Manager
    |--------------------------------------------------------------------------
    */

    Route::prefix('manager')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            ManagerDashboardController::class,
            'index',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Projects
        |--------------------------------------------------------------------------
        */

        Route::get('/projects', [
            ManagerProjectController::class,
            'index',
        ]);

        Route::get('/projects/employees', [
            ManagerProjectController::class,
            'employees',
        ]);

        Route::post('/projects', [
            ManagerProjectController::class,
            'store',
        ]);

        Route::get('/projects/{project}', [
            ManagerProjectController::class,
            'show',
        ]);

        Route::put('/projects/{project}', [
            ManagerProjectController::class,
            'update',
        ]);

        Route::delete('/projects/{project}', [
            ManagerProjectController::class,
            'destroy',
        ]);

        Route::post('/projects/{project}/assign-employees', [
            ManagerProjectController::class,
            'assignEmployees',
        ]);

        Route::post('/projects/{project}/files', [
            ManagerProjectController::class,
            'uploadFile',
        ]);

        Route::get('/projects/{project}/files/{file}/download', [
            ManagerProjectController::class,
            'downloadFile',
        ]);

        Route::delete('/projects/{project}/files/{file}', [
            ManagerProjectController::class,
            'deleteFile',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Tasks
        |--------------------------------------------------------------------------
        */

        Route::get('/tasks', [
            ManagerTaskController::class,
            'index',
        ]);

        Route::post('/tasks', [
            ManagerTaskController::class,
            'store',
        ]);

        Route::get('/tasks/{task}', [
            ManagerTaskController::class,
            'show',
        ]);

        Route::put('/tasks/{task}', [
            ManagerTaskController::class,
            'update',
        ]);

        Route::patch('/tasks/{task}/status', [
            ManagerTaskController::class,
            'updateStatus',
        ]);

        Route::delete('/tasks/{task}', [
            ManagerTaskController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Team
        |--------------------------------------------------------------------------
        */

        Route::get('/team', [
            ManagerTeamController::class,
            'index',
        ]);

        Route::post('/team', [
            ManagerTeamController::class,
            'store',
        ]);

        Route::get('/team/{team}', [
            ManagerTeamController::class,
            'show',
        ]);

        Route::put('/team/{team}', [
            ManagerTeamController::class,
            'update',
        ]);

        Route::patch('/team/{team}/status', [
            ManagerTeamController::class,
            'updateStatus',
        ]);

        Route::delete('/team/{team}', [
            ManagerTeamController::class,
            'destroy',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Daily Updates
        |--------------------------------------------------------------------------
        */

        Route::get('/daily-updates', [
            ManagerDailyUpdateController::class,
            'index',
        ]);

        Route::get('/daily-updates/{dailyUpdate}', [
            ManagerDailyUpdateController::class,
            'show',
        ]);

        Route::patch('/daily-updates/{dailyUpdate}/review', [
            ManagerDailyUpdateController::class,
            'review',
        ]);

        Route::patch('/daily-updates/{dailyUpdate}/acknowledge-blocker', [
            ManagerDailyUpdateController::class,
            'acknowledgeBlocker',
        ]);

        Route::post('/daily-updates/{dailyUpdate}/comment', [
            ManagerDailyUpdateController::class,
            'comment',
        ]);
    });

    /*
    |--------------------------------------------------------------------------
    | Employee
    |--------------------------------------------------------------------------
    */

    Route::prefix('employee')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get('/dashboard', [
            EmployeeDashboardController::class,
            'index',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Projects
        |--------------------------------------------------------------------------
        */

        Route::get('/projects', [
            EmployeeProjectController::class,
            'index',
        ]);

        Route::get('/projects/{project}', [
            EmployeeProjectController::class,
            'show',
        ]);

        Route::get('/projects/{project}/files/{file}/download', [
            EmployeeProjectController::class,
            'downloadFile',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Tasks
        |--------------------------------------------------------------------------
        */

        Route::get('/tasks', [
            EmployeeTaskController::class,
            'index',
        ]);

        Route::get('/tasks/{task}', [
            EmployeeTaskController::class,
            'show',
        ]);

        Route::patch('/tasks/{task}/status', [
            EmployeeTaskController::class,
            'updateStatus',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Daily Updates
        |--------------------------------------------------------------------------
        */

        Route::get('/daily-updates', [
            EmployeeDailyUpdateController::class,
            'index',
        ]);

        Route::get('/daily-updates/create', [
            EmployeeDailyUpdateController::class,
            'create',
        ]);

        Route::post('/daily-updates', [
            EmployeeDailyUpdateController::class,
            'store',
        ]);

        Route::get('/daily-updates/{dailyUpdate}', [
            EmployeeDailyUpdateController::class,
            'show',
        ]);
    });
});