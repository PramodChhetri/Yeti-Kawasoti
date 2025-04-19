<?php

namespace App\Services;



use Illuminate\Support\Facades\Http;

use App\Models\Member;

use Carbon\Carbon;

use Illuminate\Support\Facades\Log;



class MessageService

{

    public static function sendMessage($contacts = [], $message = "")

    {

        Log::info('Sending message');

        // API endpoint

        $url = 'https://api.easyservice.com.np/api/v1/sms/send';



        // Construct payload

        $payload = [

            'apikey' => config('app.sms_api_key'),

            'contacts' => $contacts,

            'message_type' => 'plain',

            'message' => $message,

            'sender_id' => [

                'nt' => 'MD_Alert',

                'ncell' => 'MD_Alert',

                'smart' => 'MD_Alert',

            ],

            'billing_type' => 'alert',

            'tag' => 'TAG1',

        ];



        // Forward request to API

        Log::info(['contacts' => $contacts, 'message' => $message]);

        return Http::post($url, $payload);
    }



    public static function getBalance()

    {

        $balance = Http::post('https://api.easyservice.com.np/api/v1/sms/check_balance', [

            'apikey' => config('app.sms_api_key')

        ]);

        return $balance;
    }



    public static function send_creation_mail(Member $member)

    {

        $name = $member->name;

        $phone = $member->phone;

        $expiry = Carbon::parse($member->payment_expiry_date)->format('D, F j, Y');

        $message = "Hi $name, we're happy to create your membership. Enjoy the journey of fitness - Thank You, " . config('app.gym_name');



        return self::sendMessage([$phone], $message);
    }



    public static function send_renewal_mail(Member $member)

    {

        $name = $member->name;

        $phone = $member->phone;

        $expiry = Carbon::parse($member->payment_expiry_date)->format('D, F j, Y');

        $message = "Hi $name, we're happy to renew your membership till $expiry. Enjoy the journey of fitness! - " . config('app.gym_name');

        return self::sendMessage([$phone], $message);
    }


    public static function send_credit_message(Member $member)
    {
        $name = $member->name;
        $phone = $member->phone;
        $credit = $member->credit;

        $message = "Dear $name,\n\nThis is a reminder that your credit of Rs $credit is due. Kindly clear it at your earliest convenience to continue using our services.\n\nFor any questions, feel free to contact us.\n\nThank you for being a valued member of " . config('app.gym_name') . ".\n\nBest regards,\nThe " . config('app.gym_name') . " Team";

        return self::sendMessage([$phone], $message);
    }


    public static function send_bulk_credit_message(array $members)
    {
        // Prepare a list of phone numbers and messages
        $phoneNumbers = [];
        $messages = [];

        foreach ($members as $member) {
            $name = $member->name;
            $phone = $member->phone;
            $credit = $member->credit;

            $message = "Dear $name,\n\nWe hope you're enjoying your fitness journey with us. This is a friendly reminder that your current outstanding balance of Rs $credit is due for payment. We kindly request you to clear your credit balance at your earliest convenience to continue enjoying uninterrupted access to our services.\n\nIf you have any questions or need assistance, please don't hesitate to contact us.\n\nThank you for being a valued member of " . config('app.gym_name') . ".\n\nBest regards,\nThe " . config('app.gym_name') . " Team";

            // Add the phone number and message to the arrays
            $phoneNumbers[] = $phone;
            $messages[] = $message;
        }

        // Send messages in bulk
        return self::sendMessage($phoneNumbers, $messages);
    }
}
