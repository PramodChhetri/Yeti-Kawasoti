<?php

namespace App\Http\Controllers;

use App\Models\ExtraCredit;
use App\Models\Member;
use App\Models\EntryPayment;
use App\Models\Expense;
use App\Models\LockerPayment;
use App\Models\MembershipRenewal;
use App\Models\OfficialTransaction;
use App\Models\Refund;
use App\Models\RegistrationApplication;
use App\Models\RenewalApplication;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Total Number of Members
        $totalMembers = Member::where('is_approved', 1)->count();

        // Total Active Members
        $totalActiveMembers = Member::where('payment_expiry_date', '>', now())->where('is_approved', 1)->count();

        // Total Pending Admission Approvals (entry payments awaiting approval)
        $pendingAdmissionApprovals = RegistrationApplication::count();

        // Total Pending Renewal Approvals (membership renewals awaiting approval)
        $pendingRenewalApprovals = RenewalApplication::count();

        $todaysRevenue = collect([
            EntryPayment::whereDate('payment_date', Carbon::today())
                ->where('is_approved', 1)
                ->sum('paid_amount'),
            MembershipRenewal::whereDate('payment_date', Carbon::today())
                ->where('is_approved', 1)
                ->sum('paid_amount'),
            LockerPayment::whereDate('payment_date', Carbon::today())
                ->where('is_approved', 1)
                ->sum('paid_amount'),
            Transaction::whereDate('payment_date', Carbon::today())
                ->sum('paid_amount'),
        ])->sum() - Refund::whereDate('payment_date', Carbon::today())
            ->sum('refund_amount');

        $currentDate = Carbon::now();
        $startOfMonth = $currentDate->startOfMonth()->toDateString();
        $endOfMonth = $currentDate->endOfMonth()->toDateString();

        $totalExpenseAmount = Expense::whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->sum('expense_amount');

        $totalSalaryAmount = OfficialTransaction::whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $totalExpense = $totalExpenseAmount + $totalSalaryAmount;

        // Today's Registrations (from entry payments)
        $todaysRegistrations = EntryPayment::whereDate('payment_date', now())
            ->where('is_approved', true)
            ->with('member.membershipPackage')
            ->get();

        // Today's Renewals (from membership renewals)
        $todaysRenewals = MembershipRenewal::whereDate('payment_date', now())
            ->where('is_approved', true)
            ->with('member.membershipPackage')
            ->get();


        // Count of Expired Members
        $expiredCount = Member::where('payment_expiry_date', '<=', now()->toDateString())->count();

        // Today's Extra Credits and Payments
        $todaysCredits = ExtraCredit::with('member')->whereDate('created_at', Carbon::today())->get();
        $todaysPayments = EntryPayment::whereDate('created_at', Carbon::today())->where('is_approved', true)->get();

        // Monthly Revenues for the last 12 months (including the current month)
        $monthlyRevenue = [];

        // Loop through the last 12 months
        for ($i = 0; $i < 12; $i++) {
            $startOfMonth = Carbon::now()->subMonthNoOverflow($i)->startOfMonth();
            $endOfMonth = Carbon::now()->subMonthNoOverflow($i)->endOfMonth();
            $monthLabel = $startOfMonth->format('M Y'); // e.g., "Jan 2024"

            // Get daily revenues from each payment type
            $entryPayments = DB::table('entry_payments')
                ->select(
                    DB::raw('DATE(members.start_date) as date'),
                    DB::raw('SUM(paid_amount) as entry_revenue'),
                    DB::raw('COUNT(CASE WHEN members.gender = "male" THEN 1 END) as male_count'),
                    DB::raw('COUNT(CASE WHEN members.gender = "female" THEN 1 END) as female_count')
                )
                ->leftJoin('members', 'entry_payments.member_id', '=', 'members.id')
                ->whereBetween('members.start_date', [$startOfMonth, $endOfMonth])
                ->groupBy(DB::raw('DATE(members.start_date)'))
                ->get();

            $membershipRenewals = DB::table('membership_renewals')
                ->select(
                    DB::raw('DATE(payment_date) as date'),
                    DB::raw('SUM(paid_amount) as renewal_revenue')
                )
                ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
                ->groupBy(DB::raw('DATE(payment_date)'))
                ->get();

            $lockerPayments = DB::table('locker_payments')
                ->select(
                    DB::raw('DATE(payment_date) as date'),
                    DB::raw('SUM(paid_amount) as locker_revenue')
                )
                ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
                ->groupBy(DB::raw('DATE(payment_date)'))
                ->get();

            $miscellaneousPayments = DB::table('transactions')
                ->select(
                    DB::raw('DATE(payment_date) as date'),
                    DB::raw('SUM(paid_amount) as transaction_revenue')
                )
                ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
                ->groupBy(DB::raw('DATE(payment_date)'))
                ->get();

            // Get daily refund data
            $refunds = DB::table('refunds')
                ->select(
                    DB::raw('DATE(payment_date) as date'),
                    DB::raw('SUM(refund_amount) as refund_revenue')
                )
                ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
                ->groupBy(DB::raw('DATE(payment_date)'))
                ->get();

            // Fill missing days with zero revenue
            $dates = collect();
            for ($j = 1; $j <= $endOfMonth->day; $j++) {
                $date = $startOfMonth->copy()->addDays($j - 1)->format('Y-m-d');
                $dates->put($date, [
                    'date' => $date,
                    'revenue' => 0,
                    'source' => [
                        'entry_payments' => 0,
                        'membership_renewals' => 0,
                        'locker_payments' => 0,
                        'miscellaneous_payments' => 0,
                        'refunds' => 0,
                    ],
                    'gender' => [
                        'male' => 0,
                        'female' => 0,
                        'others' => 0,
                    ],
                    'membership_packages' => []
                ]);
            }

            // Add entry payments data
            foreach ($entryPayments as $entry) {
                $packageData = $this->getMembershipPackageDataForDay($entry->date);

                if ($dates->has($entry->date)) {
                    $existing = $dates->get($entry->date);
                    $existing['revenue'] += $entry->entry_revenue;
                    $existing['source']['entry_payments'] = $entry->entry_revenue;
                    $existing['gender']['male'] += $entry->male_count;
                    $existing['gender']['female'] += $entry->female_count;
                    $existing['membership_packages'] = $packageData;
                    $dates->put($entry->date, $existing);
                }
            }

            // Add membership renewals data
            foreach ($membershipRenewals as $renewal) {
                if ($dates->has($renewal->date)) {
                    $existing = $dates->get($renewal->date);
                    $existing['revenue'] += $renewal->renewal_revenue;
                    $existing['source']['membership_renewals'] = $renewal->renewal_revenue;
                    $dates->put($renewal->date, $existing);
                }
            }

            // Add locker payments data
            foreach ($lockerPayments as $locker) {
                if ($dates->has($locker->date)) {
                    $existing = $dates->get($locker->date);
                    $existing['revenue'] += $locker->locker_revenue;
                    $existing['source']['locker_payments'] = $locker->locker_revenue;
                    $dates->put($locker->date, $existing);
                }
            }

            // Add miscellaneous payments data
            foreach ($miscellaneousPayments as $miscellaneous) {
                if ($dates->has($miscellaneous->date)) {
                    $existing = $dates->get($miscellaneous->date);
                    $existing['revenue'] += $miscellaneous->transaction_revenue;
                    $existing['source']['miscellaneous_payments'] = $miscellaneous->transaction_revenue;
                    $dates->put($miscellaneous->date, $existing);
                }
            }

            // Add refund data and subtract it from the revenue
            foreach ($refunds as $refund) {
                if ($dates->has($refund->date)) {
                    $existing = $dates->get($refund->date);
                    $existing['revenue'] -= $refund->refund_revenue; // Subtract refund amount
                    $existing['source']['refunds'] = $refund->refund_revenue; // Store refund data
                    $dates->put($refund->date, $existing);
                }
            }

            // Add formatted monthly data to the array with the month label
            $monthlyRevenue[$monthLabel] = $dates->values();
        }


        // Render view with Inertia and pass the data
        return Inertia::render('Dashboard/Index', [
            'totalMembers' => $totalMembers,
            'totalActiveMembers' => $totalActiveMembers,
            'pendingAdmissionApprovals' => $pendingAdmissionApprovals,
            'pendingRenewalApprovals' => $pendingRenewalApprovals,
            'todaysRevenue' => $todaysRevenue,
            'todaysRegistrations' => $todaysRegistrations,
            'todaysRenewals' => $todaysRenewals,
            'expiredCount' => $expiredCount,
            'todaysCredits' => $todaysCredits,
            'todaysPayments' => $todaysPayments,
            'monthlyRevenue' => $monthlyRevenue, // Return monthly revenues for each day
            'totalExpense' => $totalExpense,
        ]);
    }

    // Helper function to get membership package data for a specific day with count and sum
    protected function getMembershipPackageDataForDay($date)
    {
        $packages = DB::table('entry_payments')
            ->leftJoin('members', 'entry_payments.member_id', '=', 'members.id')
            ->leftJoin('membership_packages', 'members.membership_package_id', '=', 'membership_packages.id')
            ->select(
                'membership_packages.package_name',
                DB::raw('COUNT(entry_payments.id) as total_count'),
                DB::raw('SUM(entry_payments.paid_amount) as total_revenue')
            )
            ->whereDate('members.start_date', $date)
            ->groupBy('membership_packages.package_name')
            ->get();

        // Transform to associative array with package name as the key
        $packageData = [];
        foreach ($packages as $package) {
            $packageData[$package->package_name] = [
                'count' => (int) $package->total_count, // Cast count to integer
                'sum' => (float) $package->total_revenue, // Cast sum to float
            ];
        }

        return $packageData;
    }
}
