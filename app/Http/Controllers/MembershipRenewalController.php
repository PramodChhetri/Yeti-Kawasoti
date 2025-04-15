<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicRenewalRequest;
use App\Http\Requests\RenewPackageRequest;
use App\Models\Member;
use App\Models\RenewalApplication;
use App\Services\RenewalMemberService;
use Illuminate\Support\Facades\DB;

class MembershipRenewalController extends Controller
{
    protected $renewalMemberService;

    public function __construct(RenewalMemberService $renewalMemberService)
    {
        $this->renewalMemberService = $renewalMemberService;
    }


    public function store(RenewPackageRequest $request, Member $member)
    {
        $validatedData = $request->validated();
        //dd($validatedData);
        $this->renewalMemberService->renew($validatedData, $request, $member);
        return redirect()->route('members.index', $member)->with('success', 'Membership renewed successfully.');
    }

    public function publicStore(PublicRenewalRequest $request, Member $member)
    {
        DB::transaction(function () use ($request, $member) {
            RenewalApplication::create([
                'member_id' => $member->id,
                'months' => $request->input('months'),
                'payment_proof' => $this->storePaymentProof($request),
                'is_approved' => false, // Public renewals are pending approval
            ]);
        });

        return redirect()->back()->with('success', 'Membership renewal submitted, pending admin approval.');
    }


    private function storePaymentProof($request)
    {
        if ($request->hasFile('payment_proof')) {
            return $request->file('payment_proof')->store('renewal_payments', 'public');
        }
        return null;
    }




    public function approveRenewalApplication(RenewalApplication $renewalApplication)
    {
        DB::transaction(function () use ($renewalApplication) {
            // Prepare the payload for the renew method, mimicking frontend request
            $validatedData = [
                'member_id' => $renewalApplication->member_id,
                'membership_package_id' => $renewalApplication->member->membership_package_id,
                'monthly_fees' => $renewalApplication->member->membershipPackage->monthly_amount,
                'selected_months' => $renewalApplication->months,
                'paid_amount' => 0, // You can adjust this if needed
                'package_discount' => 0, // Adjust discount if needed
                'payment_mode' => 'public', // Defaulting to public for now
                'payment_proof' => $renewalApplication->payment_proof,
                'net_amount' => $renewalApplication->months * $renewalApplication->member->membershipPackage->monthly_amount, // Adjust the calculation if needed
            ];

            // Call the same service to handle the renewal logic
            $this->renewalMemberService->renew($validatedData, request(), $renewalApplication->member, true);

            // Remove the RenewalApplication now that it's processed
            $renewalApplication->delete();
        });

        return redirect()->back()->with('success', 'Renewal Application approved and processed successfully.');
    }
}
