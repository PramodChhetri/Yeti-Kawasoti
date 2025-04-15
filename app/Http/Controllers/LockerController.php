<?php

namespace App\Http\Controllers;

use App\Models\Locker;
use App\Models\Member;
use App\Models\MemberLocker;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class LockerController extends Controller
{
    public function storeLocker(Request $request, Member $member, Locker $locker)
    {
        // Validate the request input
        $validatedData = $request->validate([
            'bill_number' => ['required', 'numeric'],
            'locker_discount' => ['nullable', 'numeric', 'min:0'],
            'payment_mode' => ['required', 'string'],
            'locker_number' => ['required', 'string', 'unique:member_lockers,locker_number'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
        ]);

        DB::transaction(function () use ($validatedData, $member, $locker) {
            $lockerPrice = $locker->price;
            $discount = $validatedData['locker_discount'] ?? 0;
            $totalAmount = $lockerPrice - $discount;
            $paidAmount = $validatedData['paid_amount'];
            $credit = $totalAmount - $paidAmount;
            $startDate = $validatedData['start_date'];
            $months = $locker->months;
            $endDate = date('Y-m-d', strtotime("+{$months} months", strtotime($startDate)));

            // Insert into locker_payments table
            DB::table('locker_payments')->insert([
                'member_id' => $member->id,
                'total_months' => $locker->months,
                'locker_charge' => $lockerPrice,
                'locker_number' => $validatedData['locker_number'],
                'locker_discount' => $discount,
                'bill_number' => $validatedData['bill_number'],
                'payment_mode' => $validatedData['payment_mode'],
                'payment_date' => Carbon::now(),
                'active_till' => $endDate,
                'paid_amount' => $paidAmount,
                'net_amount' => $totalAmount,
                'updated_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'is_approved' => true
            ]);

            // Insert into member_lockers table
            DB::table('member_lockers')->insert([
                'member_id' => $member->id,
                'locker_id' => $locker->id,
                'locker_number' => $validatedData['locker_number'],
                'start_date' => $startDate,
                'end_date' => $endDate,
                'locker_status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update the member's credit balance
            $member->update(['credit' => $member->credit + $credit]);
        });

        return redirect()->back()->with('success', 'Locker assigned successfully.');
    }


    public function updateLocker(Request $request, Member $member, Locker $locker)
    {
        // Validate the request input
        $validatedData = $request->validate([
            'bill_number' => ['required', 'numeric'],
            'locker_discount' => ['nullable', 'numeric', 'min:0'],
            'payment_mode' => ['required', 'string'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validatedData, $member, $locker) {
            $lockerPrice = $locker->price;
            $discount = $validatedData['locker_discount'] ?? 0;
            $totalAmount = $lockerPrice - $discount;
            $paidAmount = $validatedData['paid_amount'];
            $credit = $totalAmount - $paidAmount;

            // Retrieve the existing start_date and locker_number from the member_lockers table
            $existingLockerData = DB::table('member_lockers')
                ->where('member_id', $member->id)
                ->first(['end_date', 'locker_number']);

            // Calculate the new end_date based on the existing start_date
            $months = $locker->months;
            $endDate = date('Y-m-d', strtotime("+{$months} months", strtotime($existingLockerData->end_date)));

            // Insert into locker_payments table
            DB::table('locker_payments')->insert([
                'member_id' => $member->id,
                'total_months' => $locker->months,
                'locker_charge' => $lockerPrice,
                'locker_number' => $existingLockerData->locker_number, // Use previous locker number
                'locker_discount' => $discount,
                'bill_number' => $validatedData['bill_number'],
                'payment_mode' => $validatedData['payment_mode'],
                'payment_date' => Carbon::now(),
                'active_till' => $endDate,
                'paid_amount' => $paidAmount,
                'updated_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'net_amount' => $totalAmount,
                'is_approved' => true
            ]);

            // Update member_lockers table without changing start_date or locker_number
            DB::table('member_lockers')->where('member_id', $member->id)->update([
                'locker_id' => $locker->id,
                'end_date' => $endDate,
                'locker_status' => true,
                'updated_at' => now(),
            ]);

            // Update the member's credit balance
            $member->update(['credit' => $member->credit + $credit]);
        });

        return redirect()->back()->with('success', 'Locker updated successfully.');
    }




    public function editLocker(Request $request, Member $member)
    {
        // Validate the request input
        $validatedData = $request->validate([
            'locker_number' => ['required', 'string', 'max:255'],
        ]);

        // Check if the member has an active locker
        $memberLocker = MemberLocker::where('member_id', $member->id)
            ->where('locker_status', 1) // Assuming 1 is the active status
            ->first();

        if (!$memberLocker) {
            return redirect()->back()->withErrors('No active locker found for this member.');
        }

        // Update the locker number
        $memberLocker->locker_number = $validatedData['locker_number'];
        $memberLocker->save();

        return redirect()->back()->with('success', 'Locker number updated successfully.');
    }

    public function deleteLocker(Member $member)
    {
        MemberLocker::where('member_id', $member->id)->delete();
        return redirect()->back()->with('success', 'Locker deleted successfully.');
    }
}
