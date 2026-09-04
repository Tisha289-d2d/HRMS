<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;

class DocumentReportController extends Controller
{
    public function employeeReport()
    {
        $documents = Document::with(['employee.user', 'category'])
            ->whereNotNull('employee_id')
            ->orderBy('employee_id')
            ->get();
        return response()->json(['data' => $documents]);
    }

    public function expiredReport()
    {
        $documents = Document::with(['employee.user', 'category'])
            ->where('status', 'Expired')
            ->orderBy('expiry_date', 'asc')
            ->get();
        return response()->json(['data' => $documents]);
    }

    public function verificationReport()
    {
        $documents = Document::with(['employee.user', 'category', 'verifiedBy'])
            ->whereIn('status', ['Approved', 'Rejected'])
            ->orderBy('verified_at', 'desc')
            ->get();
        return response()->json(['data' => $documents]);
    }

    public function categoryReport()
    {
        $documents = Document::with(['category', 'employee.user'])
            ->orderBy('category_id')
            ->get();
        return response()->json(['data' => $documents]);
    }
}
