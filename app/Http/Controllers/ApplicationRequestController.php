<?php

namespace App\Http\Controllers;

use App\Models\MembershipPackage;
use App\Models\RegistrationApplication;
use App\Models\RenewalApplication;
use App\Services\RenewalMemberService;
use App\Services\StoreMemberService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicationRequestController extends Controller
{
    public function index(Request $request)
    {
        // Fetch active tab
        $tab = $request->input('tab', 'registration_applications');

        // Fetch registration or renewal applications based on tab
        if ($tab === 'registration_applications') {
            $applications = RegistrationApplication::with('membershipPackage')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        } else {
            $applications = RenewalApplication::with('member.membershipPackage')
                ->orderBy('created_at', 'desc')
                ->paginate(10);
        }



        // Pass data to the view
        return Inertia::render('Applications/index', [
            'applications' => $applications,
            'activeTab' => $tab,
        ]);
    }

    public function confirmPublicRenewal(Request $request, RenewalApplication $renewalApplication)
    {
        $validatedData = $request->validate([
            'extra_discount' => 'nullable|numeric|min:0',
            'paid_amount' => 'required|numeric|min:1', //
            'bill_number' => 'required|string|max:255',
            'payment_mode' => 'required|string',
        ]);



        $member = $renewalApplication->member;

        $monthlyFees = $member->membershipPackage->monthly_amount;
        $months = $renewalApplication->months;
        $totalMonthlyFees = $monthlyFees * $months;
        $package_discount = $this->calculatePackageDiscount($member->membershipPackage, $months);

        $grossAmount = $totalMonthlyFees - $package_discount;
        $extraDiscount = $validatedData['extra_discount'];
        $netAmount = $grossAmount - $extraDiscount;

        $validatedData = array_merge($validatedData, [
            'selected_months' => $months,
            'monthly_fees' => $monthlyFees,
            'total_monthly_fees' => $totalMonthlyFees,
            'gross_amount' => $grossAmount,
            'package_discount' => $package_discount,
            'net_amount' => $netAmount,
        ]);

        //return response()->json($validatedData);
        (new RenewalMemberService())->renew($validatedData, $request, $member);

        $renewalApplication->delete();

        return redirect()->back();
    }


    public function confirmPublicRegistration(Request $request, RegistrationApplication $registrationApplication)
    {
        $validatedData = $request->validate([
            'payment_mode' => 'required|string',
            'bill_number' => 'required|string|max:255',
            'paid' => 'required|numeric|min:1',
            'extra_discount' => 'required|numeric',
        ]);

        $admissionAmount = $registrationApplication->membershipPackage->admission_amount;
        $monthlyFees = $registrationApplication->membershipPackage->monthly_amount;
        $totalMonthlyFees = $monthlyFees * $registrationApplication->months;
        $packageDiscount = $this->calculatePackageDiscount($registrationApplication->membershipPackage, $registrationApplication->months);
        $grossPackageAmount = $admissionAmount + $totalMonthlyFees - $packageDiscount;
        $extraDiscount = $request->input('extra_discount', 0);
        $netPackageAmount = $grossPackageAmount - $extraDiscount;
        $lockerAccess = false;
        $lockerDiscount = 0;
        $lockerNumber = '';
        $lockerId = null;
        $lockerCharge = 0;
        $amount = $netPackageAmount;

        $validatedData = array_merge($validatedData, [
            'name' => $registrationApplication->name,
            'phone' => $registrationApplication->phone,
            'occupation' => $registrationApplication->occupation,
            'gender' => $registrationApplication->gender,
            'marital_status' => $registrationApplication->marital_status,
            'date_of_birth' => $registrationApplication->date_of_birth,
            'address' => $registrationApplication->address,
            'preferred_time' => $registrationApplication->preferred_time,
            'photo' => $registrationApplication->photo,
            'emergency_person_name' => $registrationApplication->emergency_person_name,
            'emergency_person_phone' => $registrationApplication->emergency_person_phone,
            'membership_package' => $registrationApplication->membership_package_id,
            'months' => $registrationApplication->months,
            'payment_proof' => $registrationApplication->payment_proof,
            'admission_fees' => $admissionAmount,
            'monthly_fees' => $monthlyFees,
            'total_monthly_fees' => $totalMonthlyFees,
            'gross_package_amount' => $grossPackageAmount,
            'package_discount' => $packageDiscount,
            'amount' => $amount,
            'locker_access' => $lockerAccess,
            'locker_id' => $lockerId,
            'locker_charge' => $lockerCharge,
            'locker_discount' => $lockerDiscount,
            'locker_number' => $lockerNumber
        ]);

        (new StoreMemberService())->store($validatedData, $request);

        $registrationApplication->delete();

        return redirect()->back();
    }


    private function calculatePackageDiscount(MembershipPackage $package, int $months)
    {
        switch ($months) {
            case 3:
                return (int) $package->discount_quarterly;
            case 6:
                return (int) $package->discount_half_yearly;
            case 12:
                return (int) $package->discount_yearly;
            default:
                return 0;
        }
    }


    public function reject($rejectionType, $applicationId)
    {
        $application = null;

        if (strtolower($rejectionType) === 'renewal') {
            $application = RenewalApplication::find($applicationId);
        } else if (strtolower($rejectionType) === 'admission') {
            $application = RegistrationApplication::find($applicationId);
        } else {
            return back()->withErrors(['Unsupported Request'], 'rejection');
        }

        if ($application) {
            $application->delete();
            return redirect()->back()->with('status', 'Application rejected successfully.');
        } else {
            return back()->withErrors(['Application not found'], 'rejection');
        }
    }
}
