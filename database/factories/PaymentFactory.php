<?php

namespace Database\Factories;

use App\Models\Member;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition()
    {
        $monthsPaid = $this->faker->randomElement([1, 3, 6, 12]); // Random months paid
        $amount = $monthsPaid * 1000; // Assuming each month costs 1000, adjust as needed
        $paymentDate = $this->faker->dateTimeBetween('-1 year', 'now');

        return [
            'member_id' => Member::factory(), // Generate a member
            'payment_date' => $paymentDate->format('Y-m-d'),
            'payment_mode' => $this->faker->randomElement(['cash', 'card', 'cheque']),
            'payment_proof' => null, // Can be nullable
            'bill_number' => $this->faker->unique()->randomNumber(),
            'amount' => $amount,
            'months' => $monthsPaid,
            'extra_discount' => $this->faker->randomFloat(2, 0, 500), // Random discount up to 500
            'payment_type' => $this->faker->randomElement(['admission', 'renewal']),
            'paid' => $amount - $this->faker->randomFloat(2, 0, $amount * 0.2), // Paid amount with some discount
            'is_approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
