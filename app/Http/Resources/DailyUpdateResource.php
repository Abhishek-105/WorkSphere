<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DailyUpdateResource extends JsonResource
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

            'employee_id' => $this->employee_id,
            'project_id' => $this->project_id,
            'task_id' => $this->task_id,

            'update_date' => $this->update_date,
            'work_description' => $this->work_description,
            'hours_spent' => $this->hours_spent,
            'status' => $this->status,

            'attached_file' => $this->attached_file,

            'blocker_details' => $this->blocker_details,
            'plans_for_tomorrow' => $this->plans_for_tomorrow,

            'reviewed_by' => $this->reviewed_by,
            'reviewed_at' => $this->reviewed_at,

            'blocker_acknowledged_by' =>
                $this->blocker_acknowledged_by,

            'blocker_acknowledged_at' =>
                $this->blocker_acknowledged_at,

            'manager_comment' => $this->manager_comment,

            'employee' => new UserResource(
                $this->whenLoaded('employee')
            ),

            'project' => new ProjectResource(
                $this->whenLoaded('project')
            ),

            'task' => new TaskResource(
                $this->whenLoaded('task')
            ),

            'reviewer' => new UserResource(
                $this->whenLoaded('reviewer')
            ),

            'blocker_acknowledged_by_user' => new UserResource(
                $this->whenLoaded('blockerAcknowledgedBy')
            ),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}