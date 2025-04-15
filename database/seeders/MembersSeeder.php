<?php
// database/seeders/CsvSeeder.php

namespace Database\Seeders;

use App\Models\Member;
use App\Models\MembershipPackage;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembersSeeder extends Seeder
{
    public function run()
    {
        // Create 5000 members
        $members = Member::factory()->count(5000)->create();

        // For each member, create multiple payments
        $members->each(function ($member) {
            $totalMonthsPaid = 0;
            $startDate = Carbon::parse($member->start_date);

            // Create 3 payments per member
            Payment::factory()->count(3)->create([
                'member_id' => $member->id,
            ])->each(function ($payment) use ($member, &$totalMonthsPaid, $startDate) {
                // Add the payment months to the total months paid
                $totalMonthsPaid += $payment->months;

                // Calculate the new payment expiry date
                $newExpiryDate = $startDate->copy()->addMonths($totalMonthsPaid);

                // Ensure the expiry date doesn't exceed the end date
                if ($newExpiryDate > $member->end_date) {
                    $newExpiryDate = $member->end_date;
                }

                // Update the member's payment expiry date
                $member->payment_expiry_date = $newExpiryDate;
                $member->save();
            });
        });
    }
}
