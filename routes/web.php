<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Employee\DashboardController as EmployeeDashboardController;
use App\Http\Controllers\Employee\DailyUpdateController as EmployeeDailyUpdateController;
use App\Http\Controllers\Employee\ProfileController as EmployeeProfileController;
use App\Http\Controllers\Employee\ProjectController as EmployeeProjectController;
use App\Http\Controllers\Employee\TaskController as EmployeeTaskController;
use App\Http\Controllers\Manager\ActivityController as ManagerActivityController;
use App\Http\Controllers\Manager\DashboardController as ManagerDashboardController;
use App\Http\Controllers\Manager\DailyUpdateController as ManagerDailyUpdateController;
use App\Http\Controllers\Manager\ProfileController as ManagerProfileController;
use App\Http\Controllers\Manager\ProjectController as ManagerProjectController;
use App\Http\Controllers\Manager\TaskController as ManagerTaskController;
use App\Http\Controllers\Manager\TeamController as ManagerTeamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get(
    'login',
    [AuthController::class, 'showLogin']
)->name('login');

Route::post(
    'login',
    [AuthController::class, 'login']
)->name('login.submit');

Route::post(
    'logout',
    [AuthController::class, 'logout']
)->name('logout');


/*
|--------------------------------------------------------------------------
| Manager Routes
|--------------------------------------------------------------------------
*/

Route::prefix('manager')
    ->name('manager.')
    ->middleware(['auth', 'role:manager'])
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get(
            'dashboard',
            [ManagerDashboardController::class, 'index']
        )->name('dashboard');


        /*
        |--------------------------------------------------------------------------
        | Projects
        |--------------------------------------------------------------------------
        */

        Route::resource(
            'projects',
            ManagerProjectController::class
        );

        Route::post(
            'projects/{project}/employees',
            [ManagerProjectController::class, 'assignEmployees']
        )->name('projects.employees.assign');

        Route::post(
            'projects/{project}/files',
            [ManagerProjectController::class, 'uploadFile']
        )->name('projects.files.upload');

        Route::get(
            'projects/{project}/files/{projectFile}/download',
            [ManagerProjectController::class, 'downloadFile']
        )->name('projects.files.download');

        Route::delete(
            'projects/{project}/files/{projectFile}',
            [ManagerProjectController::class, 'deleteFile']
        )->name('projects.files.delete');


        /*
        |--------------------------------------------------------------------------
        | Tasks
        |--------------------------------------------------------------------------
        |
        | Global Manager Task Management
        |
        */

        Route::resource(
            'tasks',
            ManagerTaskController::class
        );

        Route::patch(
            'tasks/{task}/status',
            [ManagerTaskController::class, 'updateStatus']
        )->name('tasks.updateStatus');


        /*
        |--------------------------------------------------------------------------
        | Daily Updates
        |--------------------------------------------------------------------------
        |
        | Manager workflow:
        | Dashboard → Review → Acknowledge blocker → Comment
        |
        */

        Route::get(
            'daily-updates',
            [ManagerDailyUpdateController::class, 'index']
        )->name('daily-updates.index');

        Route::post(
            'daily-updates/review',
            [ManagerDailyUpdateController::class, 'review']
        )->name('daily-updates.review');

        Route::post(
            'daily-updates/acknowledge-blocker',
            [ManagerDailyUpdateController::class, 'acknowledgeBlocker']
        )->name('daily-updates.acknowledge-blocker');

        Route::post(
            'daily-updates/comment',
            [ManagerDailyUpdateController::class, 'comment']
        )->name('daily-updates.comment');

        Route::get(
            'daily-updates/{dailyUpdate}',
            [ManagerDailyUpdateController::class, 'show']
        )->name('daily-updates.show');


        /*
        |--------------------------------------------------------------------------
        | Team / Employees
        |--------------------------------------------------------------------------
        */

        Route::resource(
            'team',
            ManagerTeamController::class
        )->except(['show']);


        /*
        |--------------------------------------------------------------------------
        | Activity / Audit Center
        |--------------------------------------------------------------------------
        */

        Route::get(
            'activity',
            [ManagerActivityController::class, 'index']
        )->name('activity.index');


        /*
        |--------------------------------------------------------------------------
        | Manager Profile
        |--------------------------------------------------------------------------
        |
        | One canonical profile module:
        | /manager/profile
        |
        */

        Route::get(
            'profile',
            [ManagerProfileController::class, 'index']
        )->name('profile.show');

        Route::put(
            'profile',
            [ManagerProfileController::class, 'update']
        )->name('profile.update');

        Route::put(
            'profile/password',
            [ManagerProfileController::class, 'updatePassword']
        )->name('profile.password.update');

        Route::post(
            'profile/photo',
            [ManagerProfileController::class, 'uploadPhoto']
        )->name('profile.photo.upload');

        Route::delete(
            'profile/photo',
            [ManagerProfileController::class, 'removePhoto']
        )->name('profile.photo.remove');
    });


/*
|--------------------------------------------------------------------------
| Employee Routes
|--------------------------------------------------------------------------
*/

Route::prefix('employee')
    ->name('employee.')
    ->middleware(['auth', 'role:employee'])
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        Route::get(
            'dashboard',
            [EmployeeDashboardController::class, 'index']
        )->name('dashboard');


        /*
        |--------------------------------------------------------------------------
        | Projects
        |--------------------------------------------------------------------------
        */

        Route::get(
            'projects',
            [EmployeeProjectController::class, 'index']
        )->name('projects.index');

        Route::get(
            'projects/{project}',
            [EmployeeProjectController::class, 'show']
        )->name('projects.show');


        /*
        |--------------------------------------------------------------------------
        | Tasks
        |--------------------------------------------------------------------------
        */

        Route::get(
            'tasks',
            [EmployeeTaskController::class, 'index']
        )->name('tasks.index');

        Route::get(
            'tasks/{task}',
            [EmployeeTaskController::class, 'show']
        )->name('tasks.show');

        Route::patch(
            'tasks/{task}/status',
            [EmployeeTaskController::class, 'updateStatus']
        )->name('tasks.updateStatus');


        /*
        |--------------------------------------------------------------------------
        | Daily Updates
        |--------------------------------------------------------------------------
        |
        | Employee workflow:
        | Daily Updates → Submit Today's Update → History
        |
        */

        Route::get(
            'daily-updates',
            [EmployeeDailyUpdateController::class, 'index']
        )->name('daily-updates.index');

        Route::get(
            'daily-updates/create',
            [EmployeeDailyUpdateController::class, 'create']
        )->name('daily-updates.create');

        Route::post(
            'daily-updates',
            [EmployeeDailyUpdateController::class, 'store']
        )->name('daily-updates.store');


        /*
        |--------------------------------------------------------------------------
        | Employee Profile
        |--------------------------------------------------------------------------
        */

        Route::get(
            'profile',
            [EmployeeProfileController::class, 'index']
        )->name('profile.show');

        Route::put(
            'profile',
            [EmployeeProfileController::class, 'update']
        )->name('profile.update');

        Route::put(
            'profile/password',
            [EmployeeProfileController::class, 'updatePassword']
        )->name('profile.password.update');

        Route::post(
            'profile/photo',
            [EmployeeProfileController::class, 'uploadPhoto']
        )->name('profile.photo.upload');

        Route::delete(
            'profile/photo',
            [EmployeeProfileController::class, 'removePhoto']
        )->name('profile.photo.remove');
    });
    