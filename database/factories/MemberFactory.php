<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\MembershipPackage;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Member>
 */
class MemberFactory extends Factory
{

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Member::class;

    public function definition()
    {
        // Fetch membership package IDs, biased towards ID 6
        $membershipPackageIds = MembershipPackage::pluck('id')->all();
        $membershipPackageId = $this->faker->randomElement(
            array_merge(
                array_fill(0, 5, 6), // Bias towards ID 6
                $membershipPackageIds
            )
        );

        $membershipPackage = MembershipPackage::find($membershipPackageId);
        $months = $membershipPackage->months;

        // Random start date within the last year
        $startDate = $this->faker->dateTimeBetween('-1 year', 'now');

        // End date is based on the selected package duration
        $endDate = (clone $startDate)->modify("+$months months");

        return [
            'name' => $this->faker->name,
            'father_name' => $this->faker->name('male'),
            'date_of_birth' => $this->faker->dateTimeBetween('-40 years', '-20 years')->format('Y-m-d'),
            'credit' => $this->faker->randomFloat(2, 0, 1000),
            'phone' => $this->faker->numerify($this->faker->randomElement(['98########', '97########'])),
            'gender' => $this->faker->randomElement(['male', 'female', 'other']),
            'marital_status' => $this->faker->randomElement(['single', 'married']),
            'preferred_time' => $this->faker->time('H:i', $this->faker->dateTimeBetween('05:00:00', '21:00:00')),
            'address' => $this->faker->address,
            'membership_package_id' => $membershipPackageId,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'payment_expiry_date' => $startDate->format('Y-m-d'), // Initially the same as start date
            'total_payment' => 0, // Total payment is set to 0 initially
            'is_approved' => true,
            'remarks' => $this->faker->sentence,
            'on_device' => $this->faker->boolean(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
