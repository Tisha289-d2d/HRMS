<?php
namespace App\Http\Controllers\API;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
class EmployeeController extends Controller
{
    public function index()
    {
        return response()->json(
            Employee::with(['user', 'departments'])
                ->whereHas('user', function ($query) {
                    $query->where('role', '!=', 'admin');
                })
                ->get()
        );
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|string|in:admin,hr,employee',
            'department_ids' => 'nullable|array',
            'department_ids.*' => 'exists:departments,id',
            'designation' => 'required|string',
            'joining_date' => 'required|date',
            'salary' => 'required|numeric',
            'gender' => 'nullable|string|in:Male,Female,Other,male,female,other',
            'dob' => 'nullable|date',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'ifsc_code' => 'nullable|string|max:255',
            'branch_name' => 'nullable|string|max:255',
        ]);
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password ?? 'password123'),
                'role' => $request->role ?? 'employee',
                'phone' => $request->phone,
                'address' => $request->address,
            ]);
            $employee = Employee::create([
                'user_id' => $user->id,
                'designation' => $request->designation,
                'joining_date' => $request->joining_date,
                'salary' => $request->salary,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'ifsc_code' => $request->ifsc_code,
                'branch_name' => $request->branch_name,
            ]);
            if ($request->has('department_ids')) {
                $employee->departments()->sync($request->department_ids);
            }
            return response()->json($employee->load(['user', 'departments']), 201);
        });
    }
    public function show($id)
    {
        $employee = Employee::with(['user', 'departments'])->findOrFail($id);
        return response()->json($employee);
    }
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $user = $employee->user;
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'department_ids' => 'nullable|array',
            'department_ids.*' => 'exists:departments,id',
            'designation' => 'required|string',
            'joining_date' => 'required|date',
            'salary' => 'required|numeric',
            'gender' => 'nullable|string|in:Male,Female,Other,male,female,other',
            'dob' => 'nullable|date',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'ifsc_code' => 'nullable|string|max:255',
            'branch_name' => 'nullable|string|max:255',
        ]);
        DB::transaction(function () use ($request, $employee, $user) {
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
            ]);
            $employee->update([
                'designation' => $request->designation,
                'joining_date' => $request->joining_date,
                'salary' => $request->salary,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'bank_name' => $request->bank_name,
                'account_number' => $request->account_number,
                'ifsc_code' => $request->ifsc_code,
                'branch_name' => $request->branch_name,
            ]);
            if ($request->has('department_ids')) {
                $employee->departments()->sync($request->department_ids);
            }
        });
        return response()->json($employee->load(['user', 'departments']));
    }
    public function me(Request $request)
    {
        $user = $request->user();
        $employee = Employee::with(['user', 'departments'])
            ->where('user_id', $user->id)
            ->first();

        if (! $employee) {
            $employee = Employee::create([
                'user_id' => $user->id,
                'designation' => 'N/A',
                'joining_date' => now(),
                'salary' => 0,
                'gender' => null,
                'dob' => null,
            ]);
            
            $employee = Employee::with(['user', 'departments'])
                ->where('id', $employee->id)
                ->first();
        }
        return response()->json($employee);
    }
    public function updateMe(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:20',
            'dob' => 'nullable|date',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'ifsc_code' => 'nullable|string|max:255',
            'branch_name' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $user, &$employee) {
            $user->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
            ]);

            if ($employee) {
                $employee->update([
                    'gender' => $request->gender,
                    'dob' => $request->dob,
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'ifsc_code' => $request->ifsc_code,
                    'branch_name' => $request->branch_name,
                ]);
            } else {
                $employee = Employee::create([
                    'user_id' => $user->id,
                    'gender' => $request->gender,
                    'dob' => $request->dob,
                    'designation' => 'N/A',
                    'salary' => 0,
                    'joining_date' => now(),
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'ifsc_code' => $request->ifsc_code,
                    'branch_name' => $request->branch_name,
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $employee->load('user', 'departments')
        ]);
    }
    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $user = $employee->user;
        DB::transaction(function () use ($employee, $user) {
            $employee->delete();
            $user->delete();
        });
        return response()->json(null, 204);
    }
}
