<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MembershipPackage;
use App\Services\MessageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Initialize contacts as an empty array by default
            $contacts = [];

            $referer = $request->headers->get('referer');

            if ($referer) {
                $parsedUrl = parse_url($referer);

                // Get the path and check if it matches "/messenging"
                if (isset($parsedUrl['path']) && $parsedUrl['path'] === '/messenging') {
                    // Fetch contacts if the condition is met
                    $contacts = QueryBuilder::for(Member::class)
                        ->allowedIncludes(['membershipPackage', 'payments', 'extra_credits'])
                        ->allowedFilters([
                            AllowedFilter::exact('membership_package_id'),
                            AllowedFilter::exact('gender'),
                            AllowedFilter::callback('status', function ($query, $value) {
                                $value = strtolower($value);
                                if ($value === 'active') {
                                    $query->where(function ($q) {
                                        $q->where('is_approved', true)
                                            ->where('payment_expiry_date', '>', now());
                                    });
                                } elseif ($value === 'expired') {
                                    $query->where(function ($q) {
                                        $q->where('end_date', '<', now())
                                            ->orWhere('payment_expiry_date', '<=', now());
                                    });
                                } elseif ($value === 'unapproved') {
                                    $query->where('is_approved', false);
                                }
                            }),
                            AllowedFilter::callback('start_date', function ($query, $value) {
                                if (isset($value['start']) && isset($value['end'])) {
                                    $query->whereBetween('start_date', [$value['start'], $value['end']]);
                                } elseif (isset($value['start'])) {
                                    $query->where('start_date', '>=', $value['start']);
                                } elseif (isset($value['end'])) {
                                    $query->where('start_date', '<=', $value['end']);
                                }
                            }),
                            AllowedFilter::callback('payment_expiry_date', function ($query, $value) {
                                if (isset($value['start']) && isset($value['end'])) {
                                    $query->whereBetween('payment_expiry_date', [$value['start'], $value['end']]);
                                } elseif (isset($value['start'])) {
                                    $query->where('payment_expiry_date', '>=', $value['start']);
                                } elseif (isset($value['end'])) {
                                    $query->where('payment_expiry_date', '<=', $value['end']);
                                }
                            }),
                            AllowedFilter::callback('search', function ($query, $value) {
                                $query->where('name', 'like', '%' . $value . '%')
                                    ->orWhere('phone', 'like', '%' . $value . '%');
                            }),
                        ])
                        ->defaultSort('-id')
                        ->allowedSorts(['name', 'payment_expiry_date', 'membership_package_id'])
                        ->pluck('phone')
                        ->toArray();
                }
            }

            // Fetch SMS balance and membership packages
            $balance = MessageService::getBalance();
            $packages = MembershipPackage::all();

            // Return the view with the data
            return Inertia::render('Messenging/index', [
                'sms_balance' => $balance['balance']['current'],
                'packages' => $packages,
                'contacts' => $contacts,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching contacts: ' . $e->getMessage());

            return Inertia::render('Messenging/index', [
                'sms_balance' => 0,
                'packages' => [],
                'contacts' => [],
                'error' => 'An error occurred while fetching the data. Please try again later.',
            ]);
        }
    }



    public function message(Request $request)
    {
        // Validate the request
        $request->validate([
            'contacts' => 'required|array|min:1',
            'message' => 'required|string|min:5',
        ]);

        $messageResponse = MessageService::sendMessage($request->contacts, $request->message);

        session()->flash('message', "Message sent successfully...");

        // Return API response
        return redirect()->back()->with('response', $messageResponse);
    }
}
