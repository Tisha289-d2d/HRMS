<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;

class DocumentCategoryController extends Controller
{
    public function index()
    {
        $categories = DocumentCategory::all();
        return response()->json(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:document_categories,name',
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        $category = DocumentCategory::create($validated);
        return response()->json(['message' => 'Category created', 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = DocumentCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:document_categories,name,' . $id,
            'description' => 'nullable|string',
            'status' => 'boolean',
        ]);

        $category->update($validated);
        return response()->json(['message' => 'Category updated', 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = DocumentCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
