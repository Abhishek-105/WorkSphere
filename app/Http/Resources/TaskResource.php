<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
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

            'project_id' => $this->project_id,
            'assigned_to' => $this->assigned_to,
            'created_by' => $this->created_by,

            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'deadline' => $this->deadline,

            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,

            'project' => new ProjectResource(
                $this->whenLoaded('project')
            ),

            'assignee' => new UserResource(
                $this->whenLoaded('assignee')
            ),

            'assigned_employee' => new UserResource(
                $this->whenLoaded('assignedEmployee')
            ),

            'creator' => new UserResource(
                $this->whenLoaded('creator')
            ),

            'assignees' => UserResource::collection(
                $this->whenLoaded('assignees')
            ),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}