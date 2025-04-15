<?php

namespace App\Http\Controllers;

use App\Exports\IncomeExpenseExport;
use App\Http\Requests\StoreMiscellaneousTransactionRequest;
use App\Models\EntryPayment;
use App\Models\Expense;
use App\Models\LockerPayment;
use App\Models\Member;
use App\Models\MembershipRenewal;
use App\Models\Official;
use App\Models\OfficialTransaction;
use App\Models\Refund;
use App\Models\Transaction;
use App\Services\MessageService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $tab = $request->query('tab', 'registrations'); // Default to 'registrations'

        // Determine the base query and relations based on the tab
        switch ($tab) {
            case 'renewals':
                $query = MembershipRenewal::with('member.membershipPackage');
                break;
            case 'lockers':
                $query = LockerPayment::with('member');
                break;
            case 'miscellaneous':
                $query = Transaction::with('invoice')->with('member');
                break;
            case 'refunds':
                $query = Refund::with('member');
                break;
            case 'expenses':
                $query = Expense::query();
                break;
            default:
                $query = EntryPayment::with('member.membershipPackage');
                break;
        }

        $creditedMembers = Member::where('credit', '>', 0)->paginate(50);

        if ($tab == 'credits') {
            $data = $creditedMembers;
        } else {
            // Use QueryBuilder to apply filters for startDate and endDate on the base query
            $data = QueryBuilder::for($query)
                ->allowedFilters([
                    AllowedFilter::callback('startDate', function ($query, $value) {
                        $query->whereDate('payment_date', '>=', $value);
                    }),
                    AllowedFilter::callback('endDate', function ($query, $value) {
                        $query->whereDate('payment_date', '<=', $value);
                    })
                ])
                ->orderBy('payment_date', 'desc')
                ->orderBy('id', 'desc')
                ->paginate(50)
                ->withQueryString();
        }


        return Inertia::render('Transactions/Index', [
            'data' => $data,
            'activeTab' => $tab,
        ]);
    }




    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMiscellaneousTransactionRequest $request)
    {
        $data = $request->validated();

        if ($data['transaction_type'] === 'refund') {
            return DB::transaction(function () use ($data) {

                $totalRefundAmount = $data['refund_amount'];
                $member = Member::findOrFail($data['member_id']);

                $memberBalance = $member->credit; // Positive for credit, negative for advance

                if ($memberBalance < 0) {
                    // Handle refund when the member has an outstanding advance (negative balance)
                    $absAdvanceAmount = abs($memberBalance);

                    if ($totalRefundAmount > $absAdvanceAmount) {
                        // The refund amount exceeds the member's advance balance
                        $amountToBeAddedAsCredit = $totalRefundAmount - $absAdvanceAmount;

                        // Adjust the member's balance to reflect the new credit
                        $member->update(['credit' => $amountToBeAddedAsCredit]);

                        // Record a refund transaction
                        Refund::create([
                            'refund_amount' => $totalRefundAmount,
                            'payment_date' => $data['payment_date'],
                            'payment_mode' => $data['payment_mode'],
                            'description' => $data['description'] ?? null,
                            'member_id' => $member->id,
                            'payment_voucher' => $data['payment_voucher'] ?? null,
                        ]);
                    } else {
                        // The refund amount only reduces the member's advance balance
                        $member->update(['credit' => $memberBalance + $totalRefundAmount]);

                        Refund::create([
                            'refund_amount' => $totalRefundAmount,
                            'payment_date' => $data['payment_date'],
                            'payment_mode' => $data['payment_mode'],
                            'description' => $data['description'] ?? null,
                            'member_id' => $member->id,
                            'payment_voucher' => $data['payment_voucher'] ?? null,
                        ]);
                    }
                } else if ($memberBalance > 0) {
                    // Handle refund when the member has a credit balance (positive balance)
                    $member->update(['credit' => $memberBalance + $totalRefundAmount]);

                    // Record a refund transaction
                    Refund::create([
                        'refund_amount' => $totalRefundAmount,
                        'payment_date' => $data['payment_date'],
                        'payment_mode' => $data['payment_mode'],
                        'description' => $data['description'] ?? null,
                        'member_id' => $member->id,
                        'payment_voucher' => $data['payment_voucher'] ?? null,
                    ]);
                } else {
                    // Record a refund transaction
                    Refund::create([
                        'refund_amount' => $totalRefundAmount,
                        'payment_date' => $data['payment_date'],
                        'payment_mode' => $data['payment_mode'],
                        'description' => $data['description'] ?? null,
                        'member_id' => $member->id,
                        'payment_voucher' => $data['payment_voucher'] ?? null,
                    ]);
                }

                return redirect()->back()->with('success', 'Refund transaction completed successfully.');
            });
        } else if ($data['transaction_type']  === 'expense') {
            return DB::transaction(function () use ($data) {
                $transaction = Expense::create($data);

                return redirect()->back()->with('success', 'Expense transaction created successfully.');
            });
        } else {
            // Handle other transaction types
            return DB::transaction(function () use ($data) {
                $data['remarks'] = $data['description'] ?? '';

                $transaction = Transaction::create($data);
                $credit = $transaction->total_amount - $transaction->paid_amount;

                if ($transaction->member) {
                    $transaction->member->update(['credit' => $transaction->member->credit + $credit]);
                }

                return redirect()->back()->with('success', 'Transaction and invoice created successfully.');
            });
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }


    public function exportTransactions(Request $request)
    {

        $startDate = $request->input('startDate'); // Get start date from request
        $endDate = $request->input('endDate');    // Get end date from request

        // Income Transactions
        $serviceTransactions = Transaction::where('transaction_type', 'service')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $productTransactions = Transaction::where('transaction_type', 'product')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $otherTransactions = Transaction::where('transaction_type', 'others')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $renewalPayments = MembershipRenewal::whereBetween('payment_date', [$startDate, $endDate])->get();
        $entryPayments = EntryPayment::whereBetween('payment_date', [$startDate, $endDate])->get();
        $lockerPayments = LockerPayment::whereBetween('payment_date', [$startDate, $endDate])->get();

        // Net Income Amount
        $netServiceTransaction = $serviceTransactions->sum('total_amount');
        $netProductTransaction = $productTransactions->sum('total_amount');
        $netOtherTransaction = $otherTransactions->sum('total_amount');
        $netMiscellaneousTransaction = $netServiceTransaction + $netProductTransaction + $netOtherTransaction;
        $netRenewalPayments = $renewalPayments->sum('net_amount');
        $netEntryPayments = $entryPayments->sum('net_amount');
        $netLockerPayments = $lockerPayments->sum('net_amount');

        $totalIncome = $netMiscellaneousTransaction + $netEntryPayments + $netLockerPayments + $netRenewalPayments;

        // Expense Transactions
        $officialSalaryTransactions = OfficialTransaction::where('transaction_type', 'salary_payment')->whereBetween('transaction_date', [$startDate, $endDate])->get();
        $officialAdvanceSalaryTransactions = OfficialTransaction::where('transaction_type', 'advance_payment')->whereBetween('transaction_date', [$startDate, $endDate])->get();
        $officialBonusTransactions = OfficialTransaction::where('transaction_type', 'bonus')->whereBetween('transaction_date', [$startDate, $endDate])->get();
        $refunds = Refund::whereBetween('payment_date', [$startDate, $endDate])->get();
        $wageExpenses = Expense::where('expense_type', 'wages')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $rentExpenses = Expense::where('expense_type', 'rent')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $marketingExpenses = Expense::where('expense_type', 'marketing')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $maintenanceExpenses = Expense::where('expense_type', 'maintenance')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $stationaryExpenses = Expense::where('expense_type', 'stationary')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $equipmentExpenses = Expense::where('expense_type', 'equipment')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $utilityExpenses = Expense::where('expense_type', 'utility')->whereBetween('payment_date', [$startDate, $endDate])->get();
        $otherExpenses = Expense::where('expense_type', 'others')->whereBetween('payment_date', [$startDate, $endDate])->get();

        // Net Expense Amount
        $netOfficialSalaryTransactions = $officialSalaryTransactions->sum('amount') + $officialAdvanceSalaryTransactions->sum('amount') + $officialBonusTransactions->sum('amount');
        $netWageExpenses = $wageExpenses->sum('expense_amount');
        $netRentExpenses = $rentExpenses->sum('expense_amount');
        $netMarketingExpenses = $marketingExpenses->sum('expense_amount');
        $netMaintenanceExpenses = $maintenanceExpenses->sum('expense_amount');
        $netStationaryExpenses = $stationaryExpenses->sum('expense_amount');
        $netEquipmentExpenses = $equipmentExpenses->sum('expense_amount');
        $netUtilityExpenses = $utilityExpenses->sum('expense_amount');
        $netOtherExpenses = $otherExpenses->sum('expense_amount');
        $netRefunds = $refunds->sum('refund_amount');

        $totalExpense = $netOfficialSalaryTransactions + $netWageExpenses + $netRentExpenses + $netMarketingExpenses + $netMaintenanceExpenses + $netStationaryExpenses + $netEquipmentExpenses + $netUtilityExpenses + $netOtherExpenses + $netRefunds;

        $data = [
            'netMiscellaneousTransaction' => $netMiscellaneousTransaction,
            'netEntryPayments' => $netEntryPayments,
            'netRenewalPayments' => $netRenewalPayments,
            'netLockerPayments' => $netLockerPayments,
            'netOfficialSalaryTransactions' => $netOfficialSalaryTransactions,
            'netWageExpenses' => $netWageExpenses,
            'netRentExpenses' => $netRentExpenses,
            'netMarketingExpenses' => $netMarketingExpenses,
            'netMaintenanceExpenses' => $netMaintenanceExpenses,
            'netStationaryExpenses' => $netStationaryExpenses,
            'netEquipmentExpenses' => $netEquipmentExpenses,
            'netUtilityExpenses' => $netUtilityExpenses,
            'netOtherExpenses' => $netOtherExpenses,
            'netRefunds' => $netRefunds,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netIncome' => $totalIncome - $totalExpense,
        ];

        $filename = "income-expense-statement-{$startDate}-to-{$endDate}.xlsx";

        $gymName = env('GYM_NAME', 'GYM');

        return Excel::download(new IncomeExpenseExport($data, $gymName, $startDate, $endDate), $filename);
    }


    public function sendCreditMessage(string $memberId)
    {
        $member = Member::find($memberId);

        $messageResponse = MessageService::send_credit_message($member);

        session()->flash('message', "Message sent successfully...");

        // Return API response
        return redirect()->back()->with('response', $messageResponse);
    }
}
