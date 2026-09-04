<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use App\Models\Payroll;
use Illuminate\Http\Request;

class PayrollController extends Controller
{
    private function monthNum(string $monthName): int
    {
        $map = [
            'january'=>1,'jan'=>1,'february'=>2,'feb'=>2,'march'=>3,'mar'=>3,
            'april'=>4,'apr'=>4,'may'=>5,'june'=>6,'jun'=>6,'july'=>7,'jul'=>7,
            'august'=>8,'aug'=>8,'september'=>9,'sep'=>9,'sept'=>9,
            'october'=>10,'oct'=>10,'november'=>11,'nov'=>11,'december'=>12,'dec'=>12,
        ];
        return $map[strtolower($monthName)] ?? now()->month;
    }

    private function enrichWithLeaves(Payroll $payroll): array
    {
        $monthNum = $this->monthNum($payroll->month ?? '');
        $year     = $payroll->year ?? now()->year;

        $leaves = \App\Models\Leave::where('employee_id', $payroll->employee_id)
            ->whereIn('status', ['approved', 'Approved'])
            ->whereMonth('from_date', $monthNum)
            ->whereYear('from_date', $year)
            ->get();

        $paid = 0; $sick = 0; $unpaid = 0;
        foreach ($leaves as $leave) {
            $t = strtolower($leave->leave_type);
            if (str_contains($t, 'unpaid'))                                   $unpaid += $leave->days;
            elseif (str_contains($t, 'sick') || str_contains($t, 'medical')) $sick   += $leave->days;
            else                                                               $paid   += $leave->days;
        }

        $basic          = (float) $payroll->basic_salary;
        $bonus          = (float) ($payroll->bonus ?? 0);
        $deduction      = (float) ($payroll->deduction ?? 0);
        $holidayDays = Holiday::countInMonthForEmployee(
            $payroll->employee_id,
            $monthNum,
            $year
        );

        $leaveDeduction = round(($basic / 30) * $unpaid, 2);
        $netSalary      = round($basic + $bonus - $deduction - $leaveDeduction, 2);

        $data = $payroll->toArray();
        $data['paid_leaves_count']   = $paid;
        $data['sick_leaves_count']   = $sick;
        $data['unpaid_leaves_count'] = $unpaid;
        $data['holiday_days']        = $holidayDays;
        $data['leave_deduction']     = $leaveDeduction;
        $data['net_salary']          = $netSalary;
        return $data;
    }

    public function index(Request $request)
    {
        $query = Payroll::with('employee.user');

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('month')) {
            $query->where('month', $request->month);
        }
        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        $enriched = $query->get()->map(fn($p) => $this->enrichWithLeaves($p));
        return response()->json($enriched);
    }

    public function store(Request $request)
{
    $request->validate([
        'employee_id' => 'required|exists:employees,id',
        'basic_salary' => 'required|numeric',
        'bonus' => 'nullable|numeric',
        'deduction' => 'nullable|numeric',

        // MONTH & YEAR OPTIONAL NOW

        'month' => 'nullable|string',
        'year' => 'nullable|integer',

        'bank_name' => 'nullable|string|max:255',
        'account_number' => 'nullable|string|max:255',
        'ifsc_code' => 'nullable|string|max:255',
        'branch_name' => 'nullable|string|max:255',
    ]);

    $employee = \App\Models\Employee::findOrFail($request->employee_id);

    // AUTO ONGOING MONTH

    $currentMonthName = now()->format('F');
    $currentMonthNum  = now()->month;
    $currentYear      = now()->year;

    // USE CURRENT MONTH IF NOT PROVIDED

    $selectedMonth = $request->month ?? $currentMonthName;
    $selectedYear  = $request->year ?? $currentYear;

    // MONTH MAP

    $monthsMap = [
        'january' => 1, 'jan' => 1,
        'february' => 2, 'feb' => 2,
        'march' => 3, 'mar' => 3,
        'april' => 4, 'apr' => 4,
        'may' => 5,
        'june' => 6, 'jun' => 6,
        'july' => 7, 'jul' => 7,
        'august' => 8, 'aug' => 8,
        'september' => 9, 'sep' => 9, 'sept' => 9,
        'october' => 10, 'oct' => 10,
        'november' => 11, 'nov' => 11,
        'december' => 12, 'dec' => 12,
    ];

    $monthNum = $monthsMap[strtolower($selectedMonth)] ?? $currentMonthNum;

    $alreadyExists = Payroll::where('employee_id', $request->employee_id)
        ->where('month', $selectedMonth)
        ->where('year', $selectedYear)
        ->exists();

    if ($alreadyExists) {

        return response()->json([
            'message' => 'Salary slip already generated for ongoing month'
        ], 422);
    }

    // SALARY

    $basic = $request->basic_salary;
    $bonus = $request->bonus ?? 0;
    $deduction = $request->deduction ?? 0;

    // APPROVED LEAVES

    $approvedLeaves = \App\Models\Leave::where('employee_id', $request->employee_id)
        ->whereIn('status', ['approved', 'Approved'])
        ->whereMonth('from_date', $monthNum)
        ->whereYear('from_date', $selectedYear)
        ->get();

    $paidCount = 0;
    $sickCount = 0;
    $unpaidCount = 0;

    foreach ($approvedLeaves as $leave) {

        $typeLower = strtolower($leave->leave_type);

        if (str_contains($typeLower, 'unpaid')) {

            $unpaidCount += $leave->days;

        } elseif (
            str_contains($typeLower, 'sick') ||
            str_contains($typeLower, 'medical')
        ) {

            $sickCount += $leave->days;

        } else {

            $paidCount += $leave->days;
        }
    }

    // LEAVE DEDUCTION

    $leaveDeduction = round(($basic / 30) * $unpaidCount, 2);

    // NET SALARY

    $net_salary = round(
        $basic +
        $bonus -
        $deduction -
        $leaveDeduction,
        2
    );

    // HR NAME

    $hrName = $request->user()
        ? $request->user()->name
        : 'HR Department';

    // CREATE PAYROLL

    $payroll = Payroll::create([

        'employee_id' => $request->employee_id,

        'basic_salary' => $basic,

        'bonus' => $bonus,

        'deduction' => $deduction,

        'leave_deduction' => $leaveDeduction,

        'net_salary' => $net_salary,

        'paid_leaves_count' => $paidCount,

        'unpaid_leaves_count' => $unpaidCount,

        'sick_leaves_count' => $sickCount,

        'hr_signature' => 'Approved by ' . $hrName,

        'admin_signature' => 'Pending',

        // AUTO CURRENT MONTH

        'month' => $selectedMonth,

        'year' => $selectedYear,

        // BANK DETAILS

        'bank_name' => $request->bank_name
            ?? $employee->bank_name,

        'account_number' => $request->account_number
            ?? $employee->account_number,

        'ifsc_code' => $request->ifsc_code
            ?? $employee->ifsc_code,

        'branch_name' => $request->branch_name
            ?? $employee->branch_name,
    ]);

    return response()->json([
        'message' => 'Ongoing month salary slip generated successfully',
        'payroll' => $payroll
    ], 201);
}

    public function show($id)
    {
        $payroll = Payroll::with('employee.user')->findOrFail($id);
        return response()->json($this->enrichWithLeaves($payroll));
    }

    public function mypayrolls(Request $request)
    {
        $employee = $request->user()->employee ?? \App\Models\Employee::where('user_id', $request->user()->id)->first();
        if (!$employee) {
            return response()->json([]);
        }
        $enriched = Payroll::with('employee.user')
            ->where('employee_id', $employee->id)
            ->latest()
            ->get()
            ->map(fn($p) => $this->enrichWithLeaves($p));
        return response()->json($enriched);
    }

    public function showMyPayslip(Request $request, $id)
    {
        $employee = $request->user()->employee ?? \App\Models\Employee::where('user_id', $request->user()->id)->first();
        if (!$employee) {
            return response()->json(['message' => 'Employee profile not found'], 404);
        }

        $payroll = Payroll::with('employee.user')->findOrFail($id);
        if ($payroll->employee_id !== $employee->id) {
            return response()->json(['message' => 'Unauthorized. This payslip does not belong to you.'], 403);
        }

        return response()->json($this->enrichWithLeaves($payroll));
    }

    public function payWithStripe($id, Request $request)
    {
        $payroll = Payroll::with('employee.user')->findOrFail($id);
        $stripeSecret = env('STRIPE_SECRET');
        $isDummyKey = !$stripeSecret || $stripeSecret === 'sk_test_51OpG7BSDRVb7iK4b3G5H7J9K8L7M6N5O4P3Q2R1S0';
        if ($isDummyKey) {
            $mockSessionId = 'mock_session_' . uniqid();
            $successUrl = $request->success_url ?? 'http://localhost:5173/admin/payroll?success=true&payroll_id=' . $payroll->id . '&session_id={CHECKOUT_SESSION_ID}';
            $redirectUrl = str_replace('{CHECKOUT_SESSION_ID}', $mockSessionId, $successUrl);
            return response()->json([
                'checkout_url' => $redirectUrl,
                'session_id' => $mockSessionId,
                'mock' => true,
                'message' => 'Running in mock mode. Add your actual STRIPE_SECRET to .env for real checkout.'
            ]);
        }
        \Stripe\Stripe::setApiKey($stripeSecret);
        try {
            $session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Payroll Payment - ' . $payroll->month . ' ' . $payroll->year,
                            'description' => 'Employee: ' . ($payroll->employee->user->name ?? 'Employee'),
                        ],
                        'unit_amount' => (int) ($payroll->net_salary * 100),
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $request->success_url ?? 'http://localhost:5173/admin/payroll?success=true&payroll_id=' . $payroll->id . '&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $request->cancel_url ?? 'http://localhost:5173/admin/payroll?cancel=true',
                'metadata' => [
                    'payroll_id' => $payroll->id,
                ]
            ]);

            return response()->json([
                'checkout_url' => $session->url,
                'session_id' => $session->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Stripe Setup Error: ' . $e->getMessage() . '. Please verify your STRIPE_SECRET in your backend .env file, or use the "Mark Paid" button to manually mock completion.'
            ], 400);
        }
    }

    public function verifyPayment($id, Request $request)
    {
        $payroll = Payroll::findOrFail($id);
        $session_id = $request->query('session_id');

        if (!$session_id) {
            return response()->json(['message' => 'Session ID is required'], 400);
        }

        if (str_starts_with($session_id, 'mock_session_')) {
            $payroll->status = 'Paid';
            $payroll->stripe_payment_id = $session_id;
            $payroll->admin_signature = 'Approved by Admin';
            $payroll->save();

            return response()->json([
                'message' => 'Mock payment verified successfully',
                'payroll' => $payroll
            ]);
        }

        $stripeSecret = env('STRIPE_SECRET');
        if (!$stripeSecret || $stripeSecret === 'sk_test_51OpG7BSDRVb7iK4b3G5H7J9K8L7M6N5O4P3Q2R1S0') {
            return response()->json(['message' => 'Stripe is not configured.'], 400);
        }

        \Stripe\Stripe::setApiKey($stripeSecret);

        try {
            $session = \Stripe\Checkout\Session::retrieve($session_id);
            if ($session->payment_status === 'paid') {
                $payroll->status = 'Paid';
                $payroll->stripe_payment_id = $session->payment_intent;
                $payroll->admin_signature = 'Approved by Admin';
                $payroll->save();

                return response()->json([
                    'message' => 'Payment verified successfully',
                    'payroll' => $payroll
                ]);
            }
            return response()->json(['message' => 'Payment not paid yet'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error verifying payment: ' . $e->getMessage()], 400);
        }
    }

    public function markPaid($id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->status = 'Paid';
        $payroll->stripe_payment_id = 'manual_' . uniqid();
        $payroll->admin_signature = 'Approved by Admin';
        $payroll->save();

        return response()->json([
            'message' => 'Payroll marked as paid successfully',
            'payroll' => $payroll
        ]);
    }

    public function generateMonthly(Request $request)
    {
        $request->validate([
            'month' => 'required|string',
            'year' => 'required|integer',
        ]);

        $month = $request->month;
        $year = $request->year;

        $employees = \App\Models\Employee::all();
        $created = 0;
        $updated = 0;

        $monthsMap = [
            'january' => 1, 'jan' => 1,
            'february' => 2, 'feb' => 2,
            'march' => 3, 'mar' => 3,
            'april' => 4, 'apr' => 4,
            'may' => 5,
            'june' => 6, 'jun' => 6,
            'july' => 7, 'jul' => 7,
            'august' => 8, 'aug' => 8,
            'september' => 9, 'sep' => 9, 'sept' => 9,
            'october' => 10, 'oct' => 10,
            'november' => 11, 'nov' => 11,
            'december' => 12, 'dec' => 12,
        ];
        $monthNum = $monthsMap[strtolower($month)] ?? now()->month;

        $hrName = $request->user() ? $request->user()->name : 'HR Department';

        foreach ($employees as $employee) {
            // Check approved leaves for calculations
            $approvedLeaves = \App\Models\Leave::where('employee_id', $employee->id)
                ->whereIn('status', ['approved', 'Approved'])
                ->whereMonth('from_date', $monthNum)
                ->whereYear('from_date', $year)
                ->get();

            $paidCount = 0;
            $sickCount = 0;
            $unpaidCount = 0;

            foreach ($approvedLeaves as $leave) {
                $typeLower = strtolower($leave->leave_type);
                if (str_contains($typeLower, 'unpaid')) {
                    $unpaidCount += $leave->days;
                } elseif (str_contains($typeLower, 'sick') || str_contains($typeLower, 'medical')) {
                    $sickCount += $leave->days;
                } else {
                    $paidCount += $leave->days;
                }
            }

            $basic = (float) $employee->salary;
            $bonus = 0;
            $deduction = 0;

            $leaveDeduction = round(($basic / 30) * $unpaidCount, 2);
            $net_salary = round($basic + $bonus - $deduction - $leaveDeduction, 2);

            $payrollData = [
                'basic_salary' => $basic,
                'bonus' => $bonus,
                'deduction' => $deduction,
                'leave_deduction' => $leaveDeduction,
                'net_salary' => $net_salary,
                'paid_leaves_count' => $paidCount,
                'unpaid_leaves_count' => $unpaidCount,
                'sick_leaves_count' => $sickCount,
                'hr_signature' => 'Approved by ' . $hrName,
                'admin_signature' => 'Pending',
                'bank_name' => $employee->bank_name,
                'account_number' => $employee->account_number,
                'ifsc_code' => $employee->ifsc_code,
                'branch_name' => $employee->branch_name,
            ];

            $payroll = Payroll::where('employee_id', $employee->id)
                ->where('month', $month)
                ->where('year', $year)
                ->first();

            if ($payroll) {
                $payroll->update($payrollData);
                $updated++;
            } else {
                Payroll::create(array_merge($payrollData, [
                    'employee_id' => $employee->id,
                    'month' => $month,
                    'year' => $year,
                ]));
                $created++;
            }
        }

        return response()->json([
            'message' => 'Monthly payroll processed successfully',
            'created' => $created,
            'updated' => $updated
        ], 200);
    }
}