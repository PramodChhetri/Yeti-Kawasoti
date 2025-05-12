<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Official;
use App\Models\MembershipPackage;
use App\Services\MessageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Show the messaging interface.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        try {
            // Get SMS balance and membership packages for display
            $balance = MessageService::getBalance();
            $packages = MembershipPackage::all();
            $recipientType = $request->get('recipient_type', 'none');
            $contacts = [];

            // Fetch contacts based on recipient type
            if ($recipientType !== 'none') {
                $contacts = $this->getFilteredContacts($request, $recipientType);
            }

            // Return the Inertia view with data
            return Inertia::render('Messenging/index', array_merge([
                'sms_balance' => $balance['balance']['current'],
                'packages' => $packages,
                'contacts' => $contacts,
                'recipientType' => $recipientType,
            ], $request->only([
                'membership_package_id',
                'member_gender',
                'member_status',
                'member_joining_date_start',
                'member_joining_date_end',
                'member_expiry_date_start',
                'member_expiry_date_end',
                'position',
                'official_gender',
                'official_status',
                'official_joining_date_start',
                'official_joining_date_end',
            ])));
        } catch (\Exception $e) {
            // Log any errors
            Log::error('Error in message controller: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            // Return error view
            return Inertia::render('Messenging/index', [
                'sms_balance' => 0,
                'packages' => [],
                'contacts' => [],
                'recipientType' => $recipientType ?? 'members',
                'error' => 'An error occurred: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get filtered contacts based on recipient type and filters
     * 
     * @param Request $request
     * @param string $recipientType
     * @return array
     */
    private function getFilteredContacts(Request $request, string $recipientType): array
    {
        $contacts = [];

        // Get member contacts if needed
        if ($recipientType === 'members' || $recipientType === 'both') {
            $memberQuery = Member::query()->whereNotNull('phone');

            // Apply member filters
            if ($request->has('membership_package_id') && $request->membership_package_id !== 'all') {
                $memberQuery->where('membership_package_id', $request->membership_package_id);
            }

            if ($request->has('member_gender') && $request->member_gender !== 'all') {
                $memberQuery->where('gender', $request->member_gender);
            }

            if ($request->has('member_status') && $request->member_status !== 'all') {
                $status = strtolower($request->member_status);
                if ($status === 'active') {
                    $memberQuery->where(function ($q) {
                        $q->where('is_approved', true)
                            ->where('payment_expiry_date', '>', now());
                    });
                } elseif ($status === 'expired') {
                    $memberQuery->where(function ($q) {
                        $q->where('end_date', '<', now())
                            ->orWhere('payment_expiry_date', '<=', now());
                    });
                } elseif ($status === 'unapproved') {
                    $memberQuery->where('is_approved', false);
                }
            }

            if ($request->has('member_joining_date_start')) {
                $memberQuery->whereDate('start_date', '>=', $request->member_joining_date_start);
            }

            if ($request->has('member_joining_date_end')) {
                $memberQuery->whereDate('start_date', '<=', $request->member_joining_date_end);
            }

            if ($request->has('member_expiry_date_start')) {
                $memberQuery->whereDate('payment_expiry_date', '>=', $request->member_expiry_date_start);
            }

            if ($request->has('member_expiry_date_end')) {
                $memberQuery->whereDate('payment_expiry_date', '<=', $request->member_expiry_date_end);
            }

            // Get member phone numbers and ensure they're not null or empty
            $memberContacts = $memberQuery->pluck('phone')
                ->filter(function ($phone) {
                    return !empty($phone) && trim($phone) !== '';
                })
                ->map(function ($phone) {
                    return trim($phone);
                })
                ->values()
                ->toArray();

            Log::info('Member contacts found:', ['count' => count($memberContacts), 'contacts' => $memberContacts]);
            $contacts = array_merge($contacts, $memberContacts);
        }

        // Get official contacts if needed
        if ($recipientType === 'officials' || $recipientType === 'both') {
            $officialQuery = Official::query()->whereNotNull('phone');

            // Apply official filters
            if ($request->has('position') && $request->position !== 'all') {
                $officialQuery->where('position', $request->position);
            }

            if ($request->has('official_gender') && $request->official_gender !== 'all') {
                $officialQuery->where('gender', $request->official_gender);
            }

            if ($request->has('official_status') && $request->official_status !== 'all') {
                $status = $request->official_status;
                if ($status === 'inactive') {
                    $officialQuery->where('status', 'disabled');
                } else {
                    $officialQuery->where('status', $status);
                }
            }

            // Get official phone numbers and ensure they're not null or empty
            $officialContacts = $officialQuery->pluck('phone')
                ->filter(function ($phone) {
                    return !empty($phone) && trim($phone) !== '';
                })
                ->map(function ($phone) {
                    return trim($phone);
                })
                ->values()
                ->toArray();

            Log::info('Official contacts found:', ['count' => count($officialContacts), 'contacts' => $officialContacts]);
            $contacts = array_merge($contacts, $officialContacts);
        }

        // Remove duplicates and empty values, and ensure proper format
        $uniqueContacts = array_values(array_unique(array_filter($contacts)));
        Log::info('Final filtered contacts:', ['count' => count($uniqueContacts), 'contacts' => $uniqueContacts]);

        return $uniqueContacts;
    }

    /**
     * Send a message to the selected contacts.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function message(Request $request)
    {
        // Validate the request
        $request->validate([
            'contacts' => 'required|array|min:1',
            'message' => 'required|string|min:5',
            'recipient_type' => 'nullable|string|in:members,officials,both,none'
        ]);

        try {
            // Log message request
            Log::info('Sending message', [
                'contacts_count' => count($request->contacts),
                'message_length' => strlen($request->message)
            ]);

            // Send the message
            $messageResponse = MessageService::sendMessage($request->contacts, $request->message);

            // Log success
            Log::info('Message sent successfully', [
                'response' => $messageResponse
            ]);

            // Flash success message
            session()->flash('message', "Message sent successfully...");

            // Return response
            return redirect()->back()->with('response', $messageResponse);
        } catch (\Exception $e) {
            // Log error
            Log::error('Error sending message: ' . $e->getMessage());

            // Flash error message
            session()->flash('error', "Failed to send message: " . $e->getMessage());

            // Return error response
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
