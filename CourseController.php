<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\TrainingCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function categories(Request $request)
    {
        $query = TrainingCategory::withCount('courses');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $query->orderBy($request->sort_by ?? 'name', $request->sort_order ?? 'asc');

        $perPage = $request->per_page ?? 10;
        $categories = $query->paginate($perPage);

        return response()->json([
            'data' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'total' => $categories->total(),
                'per_page' => $categories->perPage(),
            ],
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category = TrainingCategory::create($validated);

        return response()->json(['message' => 'Category created successfully', 'data' => $category], 201);
    }

    public function showCategory($id)
    {
        $category = TrainingCategory::withCount('courses')->findOrFail($id);
        return response()->json(['data' => $category]);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = TrainingCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return response()->json(['message' => 'Category updated successfully', 'data' => $category]);
    }

    public function destroyCategory($id)
    {
        $category = TrainingCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }

    public function index(Request $request)
    {
        $query = Course::with(['category', 'creator'])->withCount('trainings');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $allowedSorts = ['title', 'status', 'duration', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->per_page ?? 10;
        $courses = $query->paginate($perPage);

        return response()->json([
            'data' => $courses->items(),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'total' => $courses->total(),
                'per_page' => $courses->perPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:training_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'nullable|string|max:100',
            'material_file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,mp4|max:51200',
            'status' => 'nullable|in:Active,Inactive',
        ]);

        $validated['created_by'] = Auth::id();

        if ($request->hasFile('material_file')) {
            $validated['material_file'] = $request->file('material_file')->store('training/materials', 'public');
        }

        $course = Course::create($validated);
        $course->load(['category', 'creator']);

        return response()->json(['message' => 'Course created successfully', 'data' => $course], 201);
    }

    public function show($id)
    {
        $course = Course::with(['category', 'creator', 'trainings'])->withCount('trainings')->findOrFail($id);
        return response()->json(['data' => $course]);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'nullable|exists:training_categories,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'nullable|string|max:100',
            'material_file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,mp4|max:51200',
            'status' => 'sometimes|in:Active,Inactive',
        ]);

        if ($request->hasFile('material_file')) {
            if ($course->material_file) {
                Storage::disk('public')->delete($course->material_file);
            }
            $validated['material_file'] = $request->file('material_file')->store('training/materials', 'public');
        }

        $course->update($validated);
        $course->load(['category', 'creator']);

        return response()->json(['message' => 'Course updated successfully', 'data' => $course]);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        if ($course->material_file) {
            Storage::disk('public')->delete($course->material_file);
        }
        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }

    public function allCategories()
    {
        $categories = TrainingCategory::where('is_active', true)->orderBy('name')->get();
        return response()->json(['data' => $categories]);
    }
}
