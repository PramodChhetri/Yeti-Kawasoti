<?php

namespace App\Services;

use App\Events\MemberCreated;
use App\Models\Member;
use App\Models\EntryPayment;
use App\Models\Invoice;
use App\Models\Locker;
use App\Models\MemberLocker;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StoreMemberService
{
    public function store(array $validatedData, $request)
    {
        return DB::transaction(function () use ($validatedData, $request) {
            $credit = $this->calculateCredit($validatedData);
            $member = $this->createMember($validatedData, $credit);
            $entryPayment = $this->createEntryPayment($member, $validatedData, $credit);
            $this->assignLocker($member, $validatedData);
            $this->createInvoice($entryPayment, $member);
            $this->storeFiles($request, $member, $validatedData);
            $this->approveMemberIfAuthenticated($member, $validatedData);

            event(new MemberCreated($member));

            MessageService::send_creation_mail($member);

            return $member;
        });
    }

    private function calculateCredit(array $validatedData)
    {
        return  $validatedData['amount'] - $validatedData['paid'];
    }

    private function createMember(array $validatedData, float $credit)
    {
        $data = [
            'name' => $validatedData['name'],
            'occupation' => $validatedData['occupation'],
            'date_of_birth' => Carbon::parse($validatedData['date_of_birth']),
            'phone' => $validatedData['phone'],
            'gender' => $validatedData['gender'],
            'marital_status' => $validatedData['marital_status'],
            'address' => $validatedData['address'],
            'preferred_time' => $validatedData['preferred_time'],
            'membership_package_id' => (int) $validatedData['membership_package'] ?? 2,
            'credit' => $credit,
            'start_date' => now(),
            'emergency_person_name' => $validatedData['emergency_person_name'],
            'emergency_person_phone' => $validatedData['emergency_person_phone'],
            'payment_expiry_date' => (int) $validatedData['months'] > 0 ? now()->addMonths((int) $validatedData['months']) : now()->addDays((int) $validatedData['days_count']),
            'total_payment' => 0,
            'is_approved' => 1,
        ];
        if (isset($validatedData['id']))
            $data['id'] = $validatedData['id'];
        return Member::create($data);
    }

    private function createEntryPayment(Member $member, array $validatedData, float $credit)
    {
        $validatedData['payment_date'] = Carbon::parse($member->start_date)->setTime(now()->hour, now()->minute, now()->second);
        return EntryPayment::create([
            'member_id' => $member->id,
            'admission_fees' => $validatedData['admission_fees'],
            'monthly_fees' => $validatedData['monthly_fees'],
            'total_months' => (int) $validatedData['months'],
            'total_monthly_fees' => $validatedData['total_monthly_fees'],
            'extra_discount' => $validatedData['extra_discount'],
            'locker_months' => $validatedData['locker_access'] ? (int) $validatedData['locker_months'] : 0,
            'locker_charge' => $validatedData['locker_charge'],
            'locker_discount' => $validatedData['locker_discount'],
            'paid_amount' => $validatedData['paid'],
            'net_amount' => $validatedData['amount'],
            'package_discount' => $validatedData['package_discount'],
            'payment_date' => $validatedData['payment_date'],
            'bill_number' => $validatedData['bill_number'],
            'active_till' => Carbon::parse($member->start_date)->addMonths((int) $validatedData['months'])->format('Y-m-d'),
            'payment_proof' => $validatedData['payment_proof'] ?? null,
            'payment_mode' => $validatedData['payment_mode']
        ]);
    }

    private function assignLocker(Member $member, array $validatedData)
    {
        if (!$validatedData['locker_access'])
            return;
        $locker = Locker::find($validatedData['locker_id']);
        if (!$locker)
            return;
        MemberLocker::create([
            'member_id' => $member->id,
            'locker_id' => $locker->id,
            'start_date' => $member->start_date,
            'end_date' => Carbon::parse($member->start_date)->addMonths($locker->months)->format('Y-m-d'),
            'locker_number' => $validatedData['locker_number'],
            'locker_status' => 1
        ]);
    }


    private function createInvoice(EntryPayment $payment, Member $member)
    {
        return Invoice::create([
            'member_id' => $member->id,
            'paymentable_id' => $payment->id,
            'paymentable_type' => get_class($payment),
        ]);
    }

    private function storeFiles($request, Member $member, $validatedData)
    {
        if ($request->hasFile('photo')) {
            $photoName = $member->id . '_' . $member->name . '.' . $request->file('photo')->getClientOriginalExtension();
            $photoPath = $request->file('photo')->storeAs('members', $photoName, 'public');
            $member->update(['photo' => 'storage/' . $photoPath . '?v=' . time()]);
        } else if (array_key_exists('photo', $validatedData)) {
            $member->update(['photo' => $validatedData['photo']]);
        }

        if ($request->payment_mode !== 'cash' && $request->hasFile('payment_proof')) {
            $proofPath = $request->file('payment_proof')->store('payments', 'public');
            EntryPayment::where('member_id', $member->id)->update(['payment_proof' => 'storage/' . $proofPath . '?v=' . time()]);
        }
    }

    private function approveMemberIfAuthenticated($member, $validatedData)
    {
        if (Auth::check()) {
            $approvedDate = now();
            $endDate = $approvedDate->copy()->addMonths((int) $validatedData['months']);

            $member->update([
                'is_approved' => true,
                'start_date' => $approvedDate,
                'end_date' => $endDate,
            ]);
        }
    }
}
