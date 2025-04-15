<?php

namespace App\Console\Commands;

use App\Jobs\SendExpiryNotification;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckPaymentExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-payment-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send SMS notifications to members with upcoming payment expiries';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        Log::info("Checking payment expiry...");
        //$tomorrow = Carbon::tomorrow();
        $threeDaysLater = Carbon::today()->addDays(3);

        $members = Member::whereIn('payment_expiry_date', [$threeDaysLater])->get();

        Log::info(count($members));

        foreach ($members as $member) {
            $message = "Hi " . $member->name . ", " . $this->getMessage($member->payment_expiry_date);
            Log::info($message);
            dispatch(new SendExpiryNotification($member->phone, $message));
        }

        return Command::SUCCESS;
    }

    /**
     * Get the notification message based on the expiry date.
     *
     * @param \Carbon\Carbon $expiryDate
     * @return string
     */
    protected function getMessage($expiryDate)
    {
        $today = Carbon::today();
        $expiryDate = Carbon::parse($expiryDate);
        if ($expiryDate->isSameDay($today->addDay())) {
            Log::info("Expiry date tomorrow");
            return 'your gym subscription will expire tomorrow, please renew - ' . config('app.gym_name') . '. Thank You!';
        } elseif (Carbon::today()->addDays(3)) {
            return 'your gym subscription will expire in 3 days. Please renew - ' . config('app.gym_name') . '. Thank You!';
        } else {
            Log::info("Different Day");
        }
        return '';
    }
}
