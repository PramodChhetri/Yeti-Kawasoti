<?php

namespace App\Services;

use App\Models\Member;
use App\Models\MembershipRenewal;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RenewalMemberService
{
    /**
     * Handle the renewal of a member's membership.
     *
     * @param array $validatedData
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Member $member
     * @param bool $isPublic  // New flag to distinguish between admin and public renewal
     * @return \App\Models\Member
     */
    public function renew(array $validatedData, $request, Member $member, bool $isPublic = false)
    {
        return DB::transaction(function () use ($validatedData, $request, $member, $isPublic) {
            // Calculate new expiry date
            $newExpiryDate = now();

            if (array_key_exists('new_payment_expiry', $validatedData)) {
                $newExpiryDate = Carbon::parse($validatedData['new_payment_expiry']);
            } else {
                $newExpiryDate = Carbon::parse($member->payment_expiry_date)->addMonths((int) $validatedData['selected_months']);
            }

            // Update member's payment expiry date
            $member->update(['payment_expiry_date' => $newExpiryDate]);

            // Create a new membership renewal record
            $renewal = $this->createMembershipRenewal($member, $validatedData, $newExpiryDate, $isPublic);

            //update credit in members table
            $this->updateCredit($renewal);

            // Create a new invoice for the renewal payment
            $this->createInvoice($renewal, $member);

            // Store any files related to the renewal if available
            $this->storeFiles($request, $renewal);

            // Only approve automatically if it's an admin-side renewal
            if (!$isPublic) {
                $this->approveRenewalIfAuthenticated($member, $newExpiryDate);
            }

            (new AccessControlService())->putMember($member->id);

            MessageService::send_renewal_mail($member);

            return $member;
        });
    }

    /**
     * Create a new membership renewal record.
     *
     * @param \App\Models\Member $member
     * @param array $validatedData
     * @param \Carbon\Carbon $newExpiryDate
     * @param bool $isPublic
     * @return \App\Models\MembershipRenewal
     */
    private function createMembershipRenewal(Member $member, array $validatedData, Carbon $newExpiryDate, bool $isPublic)
    {
        return MembershipRenewal::create([
            'member_id' => $member->id,
            'membership_package_id' => $member->membership_package_id,
            'monthly_fees' => $validatedData['monthly_fees'] | 0,
            'total_months' => $validatedData['selected_months'],
            'paid_amount' => $validatedData['paid_amount'] | 0,
            'extra_discount' => $validatedData['extra_discount'] ?? 0,
            'package_discount' => $validatedData['package_discount'] | 0,
            'bill_number' => $validatedData['bill_number'] ?? null,
            'payment_date' => now(),
            'payment_mode' => $validatedData['payment_mode'] ?? 'cash',
            'payment_proof' => $validatedData['payment_proof'] ?? null,
            'active_till' => $newExpiryDate,
            'net_amount' => $validatedData['net_amount'] | 0,
            'is_approved' => $isPublic ? false : Auth::check(),  // Set is_approved to false for public renewals
        ]);
    }


    private function updateCredit($membershipRenewal)
    {
        $credit = $membershipRenewal->net_amount - $membershipRenewal->paid_amount;
        $member = $membershipRenewal->member;
        $member->credit += $credit;
        $member->save();
        return $member;
    }

    /**
     * Create a new invoice for the membership renewal.
     *
     * @param \App\Models\MembershipRenewal $renewal
     * @param \App\Models\Member $member
     * @return \App\Models\Invoice
     */
    private function createInvoice(MembershipRenewal $renewal, Member $member)
    {
        return Invoice::create([
            'member_id' => $member->id,
            'paymentable_id' => $renewal->id,
            'paymentable_type' => get_class($renewal),
        ]);
    }

    /**
     * Store files related to the membership renewal.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\MembershipRenewal $renewal
     * @return void
     */
    private function storeFiles($request, MembershipRenewal $renewal)
    {
        // Store payment proof if provided and the payment method is not cash
        if ($request->payment_mode !== 'cash' && $request->hasFile('payment_proof')) {
            $proofPath = $request->file('payment_proof')->store('payments', 'public');
            $renewal->update(['payment_proof' => 'storage/' . $proofPath]);
        }
    }

    /**
     * Approve the membership renewal if the user is authenticated.
     *
     * @param \App\Models\Member $member
     * @param \Carbon\Carbon $newExpiryDate
     * @return void
     */
    private function approveRenewalIfAuthenticated(Member $member, Carbon $newExpiryDate)
    {
        if (Auth::check()) {
            $member->update([
                'is_approved' => true,
                'payment_expiry_date' => $newExpiryDate,
            ]);
        }
    }
}
