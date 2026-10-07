<?php

namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProjectController extends Controller
{
    /**
     * Display projects assigned to the authenticated employee.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        $query = $user->projects()
            ->with(['creator'])
            ->withCount([
                'tasks',
                'tasks as my_tasks_count' => function ($query) use ($user) {
                    $query->where('assigned_to', $user->id);
                },
            ]);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'title',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'description',
                        'like',
                        '%' . $search . '%'
                    );
            });
        }

        if (
            $request->filled('status')
            && $request->input('status') !== 'all'
        ) {
            $query->where(
                'status',
                $request->input('status')
            );
        }

        $projects = $query
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return response()->json([
            'message' => 'Employee projects retrieved successfully.',
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    /**
     * Display a single assigned project.
     */
    public function show(int $id): JsonResponse
    {
        /** @var User|null $user */
        $user = request()->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        $project = $user->projects()
            ->with([
                'creator',
                'employees',
                'files.uploader',
                'tasks' => function ($query) use ($user) {
                    $query
                        ->where('assigned_to', $user->id)
                        ->latest();
                },
            ])
            ->findOrFail($id);

        return response()->json([
            'message' => 'Employee project retrieved successfully.',
            'project' => new ProjectResource($project),
        ]);
    }

    /**
     * Download a file belonging to an assigned project.
     */
    public function downloadFile(
        Request $request,
        int $projectId,
        int $fileId
    ): StreamedResponse {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless(
            $user instanceof User && $user->isEmployee(),
            403
        );

        $project = $user->projects()
            ->findOrFail($projectId);

        $file = $project->files()
            ->findOrFail($fileId);

        $filePath = (string) $file->file_path;

        abort_unless(
            $filePath !== ''
            && Storage::disk('public')->exists($filePath),
            404,
            'File not found.'
        );

        $stream = Storage::disk('public')->readStream(
            $filePath
        );

        abort_unless(
            is_resource($stream),
            404,
            'Unable to read file.'
        );

        $downloadName = basename($filePath);

        return response()->streamDownload(
            function () use ($stream): void {
                fpassthru($stream);

                fclose($stream);
            },
            $downloadName
        );
    }
}