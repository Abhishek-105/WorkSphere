<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'created_by' => $this->created_by,

            'creator' => new UserResource(
                $this->whenLoaded('creator')
            ),

            'employees' => UserResource::collection(
                $this->whenLoaded('employees')
            ),

            'tasks' => TaskResource::collection(
                $this->whenLoaded('tasks')
            ),

            'files' => ProjectFileResource::collection(
                $this->whenLoaded('files')
            ),

            'daily_updates' => DailyUpdateResource::collection(
                $this->whenLoaded('dailyUpdates')
            ),

            'tasks_count' => $this->when(
                isset($this->tasks_count),
                $this->tasks_count
            ),

            'employees_count' => $this->when(
                isset($this->employees_count),
                $this->employees_count
            ),

            'files_count' => $this->when(
                isset($this->files_count),
                $this->files_count
            ),

            'daily_updates_count' => $this->when(
                isset($this->daily_updates_count),
                $this->daily_updates_count
            ),

            'my_tasks_count' => $this->when(
                isset($this->my_tasks_count),
                $this->my_tasks_count
            ),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}