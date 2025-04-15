<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();


Schedule::command('app:check-payment-expiry')->dailyAt("06:00")->timezone('Asia/Kathmandu');
//Schedule::command('app:send-birthday-message')->dailyAt("15:02")->timezone('Asia/Kathmandu');
Schedule::command('queue:work --stop-when-empty')->everyMinute();
