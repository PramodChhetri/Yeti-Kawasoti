<?php

namespace App\Http\Controllers;

use App\Events\MemberCreated;
use App\Events\MemberDeleted;
use App\Http\Requests\StoreMembershipRequest;
use App\Models\AccessControl;
use App\Models\Locker;
use App\Models\Member;
use App\Models\MembershipPackage;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\AccessControlService;
use App\Services\StoreMemberService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class MemberController extends Controller
{

    protected $storeMemberService;

    public function __construct(StoreMemberService $storeMemberService)
    {
        $this->storeMemberService = $storeMemberService;
    }

    public function resolve_credit(Request $request, Member $member)
    {
        $request->validate([
            'resolveAmount' => ['required', 'numeric', 'min:10'],
            'paymentMode' => ['required', 'in:cash,esewa,khalti,fonepay,cheque'],
            'billNo' => ['required', 'numeric', 'min:0']
        ]);

        $initialCredit = $member->credit;
        $member->credit -= $request->resolveAmount;

        $member->save();

        Payment::create([
            'member_id' => $member->id,
            'payment_mode' => $request->paymentMode,
            'payment_proof' => null,
            'payment_date' => now(),
            'bill_number' => $request->billNo,
            'amount' => $initialCredit,
            'payment_type' => 'credit',
            'paid' => $request->resolveAmount,
            'is_approved' =>  true
        ]);

        return back();
    }

    public function add_credit(Request $request, Member $member)
    {
        $request->validate([
            'creditAmount' => ['required', 'numeric'],
        ]);

        $initialCredit = $member->credit;
        $member->credit -= $request->resolveAmount;

        $member->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Credit of Rs ' . $request->resolveAmount . ' was successfully paid'
        ], 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 50); // Pagination
        $filters = $request->all(); // Capture all the filters sent via the request

        // Use Spatie QueryBuilder to apply filters
        $members = QueryBuilder::for(Member::class)
            ->allowedIncludes(['membershipPackage', 'payments', 'extra_credits'])
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::partial('name'),
                AllowedFilter::partial('phone'),
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
                    // Expecting value as an array ['start' => 'YYYY-MM-DD', 'end' => 'YYYY-MM-DD']
                    if (isset($value['start']) && isset($value['end'])) {
                        $query->whereBetween('start_date', [$value['start'], $value['end']]);
                    } elseif (isset($value['start'])) {
                        $query->where('start_date', '>=', $value['start']);
                    } elseif (isset($value['end'])) {
                        $query->where('start_date', '<=', $value['end']);
                    }
                }),
                AllowedFilter::callback('payment_expiry_date', function ($query, $value) {
                    // Expecting value as an array ['start' => 'YYYY-MM-DD', 'end' => 'YYYY-MM-DD']
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
            ->with(['membershipPackage', 'activeLocker', 'locker'])
            ->allowedSorts(['name', 'payment_expiry_date', 'membership_package_id'])
            ->paginate($perPage)
            ->appends($filters);

        $members->each(function ($member) {
            $member->all_payments = $member->allPayments();
            // $refundTransactions = Transaction::where('member_id', $member->id)
            //     ->where('transaction_type', 'refund')
            //     ->get();
            // $member->refundAmount = $refundTransactions->sum('paid_amount');
        });


        //return response()->json($members);



        // Pass data to the view via Inertia
        return Inertia::render('Members/index', [
            'members' => $members,
            'filters' => $filters,
            'packages' => MembershipPackage::all(),
            'lockers' => Locker::all(),
            'accessControl' => AccessControl::first(),
        ]);
    }

    public function get_members(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filter = $request->input('filter', 'all');

        $members = Member::query()->with('membershipPackage')->latest('id');

        // Expired Filters with Dynamic Days
        if (str_starts_with($filter, 'expired<')) {
            $days = (int) str_replace('expired<', '', $filter);
            $expiryDate = Carbon::today()->subDays($days);
            $members->whereDate('payment_expiry_date', '>=', $expiryDate)->whereDate('payment_expiry_date', '<=', now());
        }

        // Expired Today Filter
        if ($filter === 'expired<1') {
            $members->where('payment_expiry_date', '=', now()->toDateString());
        } else if ($filter === 'active') {
            $members->where('payment_expiry_date', '>', now()->toDateString())
                ->where('is_approved', '1');
        } else if ($filter === 'yearly') {
            $members->where('membership_package_id', '4');
        } else if ($filter === 'lifetime') {
            $members->where('membership_package_id', '6');
        } else if ($filter === 'unapproved') {
            $members->where('is_approved', '0');
        } else if ($filter === '1mnth') {
            $members->where('membership_package_id', 1);
        } else if ($filter === '3mnth') {
            $members->where('membership_package_id', 2);
        } else if ($filter === '6mnth') {
            $members->where('membership_package_id', 3);
        }

        $members->with('payments');
        $members->with('extra_credits');

        if ($search) {
            if ($search === 'expired') {
                $members->where('payment_expiry_date', '<=', now()->toDateString());
            } else {
                $members->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%$search%")
                        ->orWhere('id', 'like', "%$search%")
                        ->orWhere('phone', 'like', "%$search%");
                });
            }
        }

        $paginatedMembers = $members->paginate($perPage, ['*'], 'page', $page);

        return response()->json($paginatedMembers);
    }




    public function all_contacts()
    {
        $members = Member::select(['phone'])->get();
        return response()->json($members, 200);
    }

    public function active_contacts()
    {
        $members = Member::select(['phone'])->where('is_approved', 1)->where('payment_expiry_date', '>', now()->toDateString())->get();
        return response()->json($members, 200);
    }

    public function yearly_members_contacts()
    {
        $members = Member::select(['phone'])->where('membership_package_id', '4')->get();
        return response()->json($members, 200);
    }

    public function lifetime_members_contacts()
    {
        $members = Member::select(['phone'])->where('membership_package_id', '6')->get();
        return response()->json($members, 200);
    }

    public function expired_contacts()
    {
        $members = Member::select(['phone'])->where('payment_expiry_date', '<=', now()->toDateString())->get();
        return response()->json($members, 200);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
        return Inertia::render('Members/Create/index', [
            'packages' => MembershipPackage::all(),
            'lockers' => Locker::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(StoreMembershipRequest $request)
    {
        // Validate the request and pass it to the service
        $validatedData = $request->validated();

        // Store member and related data via the service
        $this->storeMemberService->store($validatedData, $request);

        return back();
    }



    /**
     * Display the specified resource.
     */
    public function show(Member $member)
    {
        //   return Inertia::render('Members/Show/Index', compact('member'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Member $member)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $memberId)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'name' => ['required', 'string'],
            'phone' => [
                'required',
                'string',
                'size:10',
                'regex:/^(98|97)[0-9]{8}$/',
                Rule::unique('registration_applications', 'phone'),
                Rule::unique('members', 'phone')->ignore($memberId),
            ],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'marital_status' => ['required', 'string', 'in:single,married'],
            'date_of_birth' => ['required', 'date'],
            'start_date' => ['required', 'date'],
            'address' => ['required', 'string'],
            'preferred_time' => ['required', 'string'],
            'photo' => ['nullable', 'file', 'max:2048', 'mimes:jpg,jpeg'],
            'payment_expiry_date' => ['required', 'date'],
            'occupation' => ['required', 'string'],
            'remarks' => ['nullable', 'string'],
            'emergency_person_name' => ['nullable', 'string'],  // Added emergency fields
            'emergency_person_phone' => ['nullable', 'string', 'regex:/^(98|97)[0-9]{8}$/'],  // Added emergency phone with validation
        ]);

        // Set default values for optional fields
        $validatedData['remarks'] = $validatedData['remarks'] ?? '';
        $validatedData['emergency_person_name'] = $validatedData['emergency_person_name'] ?? '';
        $validatedData['emergency_person_phone'] = $validatedData['emergency_person_phone'] ?? '';

        // Find the member record
        $member = Member::findOrFail($memberId);

        // Check if the name has changed and update the photo filename if necessary
        if ($member->name !== $validatedData['name'] && $member->photo) {
            $oldPhotoPath = public_path($member->photo);
            $photoExtension = pathinfo($oldPhotoPath, PATHINFO_EXTENSION);
            $newPhotoName = $member->id . '_' . $validatedData['name'] . '.' . $photoExtension;
            $newPhotoPath = 'storage/members/' . $newPhotoName;

            // Rename the photo if it exists
            if (file_exists($oldPhotoPath)) {
                rename($oldPhotoPath, public_path($newPhotoPath));
                $member->photo = $newPhotoPath;
            }
        }

        // Update member details
        $member->update([
            'name' => $validatedData['name'],
            'date_of_birth' => Carbon::parse($validatedData['date_of_birth']),
            'start_date' => Carbon::parse($validatedData['start_date']),
            'phone' => $validatedData['phone'],
            'gender' => $validatedData['gender'],
            'marital_status' => $validatedData['marital_status'],
            'address' => $validatedData['address'],
            'preferred_time' => $validatedData['preferred_time'],
            'occupation' => $validatedData['occupation'],
            'remarks' => $validatedData['remarks'],
            'payment_expiry_date' => Carbon::parse($validatedData['payment_expiry_date']),
            'emergency_person_name' => $validatedData['emergency_person_name'],  // Emergency contact name
            'emergency_person_phone' => $validatedData['emergency_person_phone'], // Emergency contact phone
        ]);

        // Handle photo upload if a new photo is provided
        if ($request->hasFile('photo')) {
            // Upload the new photo
            $photoExtension = $request->file('photo')->getClientOriginalExtension();
            $photoName = $member->id . '_' . $validatedData['name'] . '.' . $photoExtension;
            $photoPath = $request->file('photo')->storeAs('members', $photoName, 'public');

            // Update the photo path in the database
            $member->update(['photo' => 'storage/' . $photoPath]);
        }

        (new AccessControlService())->putMember($member->id);

        return redirect()->back();
    }



    public function approve(Request $request, $memberId)
    {
        $member = Member::with('membershipPackage')->findOrFail($memberId); // Eager load membershipPackage

        $approvedDate = now();
        $membershipPackage = $member->membershipPackage;

        $endDate = $approvedDate->copy()->addMonths($membershipPackage->months);

        $member->update([
            'is_approved' => 1,
            'start_date' => $approvedDate,
            'end_date' => $endDate,
        ]);

        event(new MemberCreated($member));

        return response()->json(['message' => 'Member approved successfully', 'member' => $member], 200);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy($memberId)
    {
        // Find the member record in the database
        $member = Member::findOrFail($memberId);
        // Delete the photo if it exists
        if ($member->photo) {
            $photoPath = public_path($member->photo);
            if (file_exists($photoPath)) {
                unlink($photoPath);
            }
        }

        $id = $member->id;


        // Delete the member record from the database
        $member->delete();

        try {
            (new AccessControlService())->deleteUser('MEM' . $id);
        } catch (Exception $e) {
            Log::error("Failed to delete user $id from device: " . $e->getMessage());
        } finally {
            return to_route("members.index");
        }
    }



    public function update_credit(Request $request, Member $member)
    {
        $request->validate([
            'credit' => ['required', 'numeric', function ($attribute, $value, $fail) use ($member) {
                $memberCredit = DB::table('members')
                    ->where('id', $member->id)
                    ->value('credit');

                if ($value > $memberCredit) {
                    $fail("The {$attribute} cant be more than the member's credit.");
                }
            },]
        ]);
    }


    /**
     * Update package for member and delete user from previous and add to latest device.
     */
    public function update_package(Request $request, Member $member)
    {
        $request->validate([
            'package_id' => 'required|exists:membership_packages,id'
        ]);

        DB::beginTransaction();

        try {
            $member->membership_package_id = $request->package_id;

            $membershipPackage = MembershipPackage::findOrFail($request->package_id);

            $member->end_date = Carbon::parse($member->joining_date)->addMonths($membershipPackage->months);

            $member->save();

            $accessControlService = new AccessControlService();
            $accessControlService->deleteUser('MEM' . $member->id);
            $accessControlService->putMember($member->id);

            DB::commit();

            return back();
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'An error occurred while updating the membership package.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public static function addCard(Request $request, string $id)
    {
        $data = $request->validate([
            'card_number' => 'required|numeric',
        ]);

        $device = AccessControl::first();
        $member = Member::findOrFail($id);  // Ensure the member exists

        // Construct URL with device index and format
        $url = $device->type == 'isup'
            ? "http://{$device->ip_address}:{$device->port}/ISAPI/AccessControl/CardInfo/Record?format=json&devIndex={$device->uuid}"
            : "http://{$device->ip_address}:{$device->port}/ISAPI/AccessControl/CardInfo/Record?format=json";

        // Form the payload with the correct fields
        $payload = json_encode([
            "CardInfo" => [
                "employeeNo" => "" . $member->id,  // Ensure this matches the expected field
                "cardNo" => $data['card_number'],
            ]
        ]);


        try {
            // Make the HTTP request with correct headers for JSON data
            $response = Http::withDigestAuth($device->username, $device->password)
                ->withHeaders(['Content-Type' => 'application/json'])  // Ensure the correct content type
                ->send('POST', $url, ['body' => $payload]);


            if ($response->successful()) {
                $member->update(['card_number' => $data['card_number']]);  // No need to call save()
                Log::info("Card added successfully for member ID {$id}.");
                return redirect()->back()->with('message', 'Card added successfully');
            } else {
                Log::error("Failed to add card for member ID {$id}, Response: " . $response->body());
                return redirect()->back()->with('error', 'Failed to add card')->withStatus($response->status());
            }
        } catch (\Exception $e) {
            Log::error("Failed to add card for member ID {$id}, Error: " . $e->getMessage());
            return redirect()->back()->with('error', 'Unexpected error occurred')->withStatus(500);
        }
    }


    public static function removeCard(string $id)
    {
        $member = Member::findOrFail($id);  // Use findOrFail to ensure the member exists
        $device = AccessControl::first();

        $url = $device->type == 'isup'
            ? "http://{$device->ip_address}:{$device->port}/ISAPI/AccessControl/CardInfo/Delete?format=json&devIndex={$device->uuid}"
            : "http://{$device->ip_address}:{$device->port}/ISAPI/AccessControl/CardInfo/Delete?format=json";

        $payload = json_encode([
            "CardInfoDelCond" => [
                "CardNoList" => [
                    [
                        "cardNo" => $member->card_number,
                    ]
                ]
            ]
        ]);

        try {
            $response = Http::withDigestAuth($device->username, $device->password)
                ->withHeaders(['Content-Type' => 'application/xml'])
                ->send('PUT', $url, ['body' => $payload]);

            if ($response->successful()) {
                $member->update(['card_number' => null]);  // No need to call save()
                Log::info("Card removed successfully for member ID {$id}.");
                return redirect()->back()->with('message', 'Card removed successfully');
            } else {
                Log::error("Failed to remove card for member ID {$id}, Response: " . $response->body());
                return redirect()->back()->with('error', 'Failed to remove card')->withStatus($response->status());
            }
        } catch (\Exception $e) {
            Log::error("Failed to remove card for member ID {$id}, Error: " . $e->getMessage());
            return redirect()->back()->with('error', 'Unexpected error occurred')->withStatus(500);
        }
    }
}
