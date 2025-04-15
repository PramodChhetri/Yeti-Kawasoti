<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\ApplicationRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventsController;
use App\Http\Controllers\ExtraCreditController;
use App\Http\Controllers\LockerController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipRenewalController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\OfficialController;
use App\Http\Controllers\OfficialTransactionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegistrationApplicationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TransactionController;
use App\Models\AccessControl;
use App\Models\Member;
use App\Models\MembershipPackage;
use App\Services\AccessControlService;
use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $packages = MembershipPackage::all();
    return Inertia::render('HomePage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'packages' => $packages,
    ]);
})->name('homepage');


Route::post('/check-membership-credentials', [MemberController::class, 'check_membership_credentials']);
Route::post('/check-reg-payment-credentials', [MemberController::class, 'check_reg_payment_credentials']);
Route::post('/member/store/apply', [RegistrationApplicationController::class, 'store'])->name('registration.apply');

Route::post('/renewal/public/store/{member}', [MembershipRenewalController::class, 'publicStore'])->name('renewal.public.store');


Route::post('/create-renewal/{member}', [MembershipRenewalController::class, 'store'])->name('renewal.store');

Route::get('/test', [SettingsController::class, 'test']);;

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/members', [MemberController::class, 'index'])->name('members.index');

    Route::get('/get-members', [MemberController::class, 'get_members']);

    //message
    Route::get('/messenging', [MessageController::class, 'index'])->name('messenging');
    Route::post('/send-message', [MessageController::class, 'message']);

    //membership renewal
    //Route::get('/renewal', [MembershipRenewalController::class, 'index'])->name('renewal');

    //credit
    Route::put('/resolve-credit/{member}', [MemberController::class, 'resolve_credit']);
    Route::put('/add-credit/{member}', [MemberController::class, 'add_credit']);

    //extra credit
    Route::get('/extra-credits', [ExtraCreditController::class, 'index'])->name('extra_credits.index');
    Route::post('/extra-credits', [ExtraCreditController::class, 'store'])->name('extra_credits.store');
    Route::delete('/extra-credits/{extraCredit}', [ExtraCreditController::class, 'destroy'])->name('extra_credits.destroy');

    //getting contacts
    Route::get('/all-contacts', [MemberController::class, 'all_contacts']);
    Route::get('/active-contacts', [MemberController::class, 'active_contacts']);
    Route::get('/yearly-members-contacts', [MemberController::class, 'yearly_members_contacts']);
    Route::get('/lifetime-members-contacts', [MemberController::class, 'lifetime_members_contacts']);
    Route::get('/expired-contacts', [MemberController::class, 'expired_contacts']);

    Route::get('members/create', [MemberController::class, 'create']);
    Route::post('member/store', [MemberController::class, 'store']);
    Route::post("/member/{member}", [MemberController::class, 'update']);
    Route::post("/members/{member}/delete", [MemberController::class, 'destroy']);
    Route::post("/members/{member}/approve", [MemberController::class, 'approve']);

    // Card
    Route::post("/members/{id}/add-card", [MemberController::class, 'addCard']);
    Route::post("/members/{id}/remove-card", [MemberController::class, 'removeCard']);

    Route::get('/application-requests', [ApplicationRequestController::class, 'index'])->name('applications.index');
    Route::post('/public-renewal/confirm/{renewalApplication}', [ApplicationRequestController::class, 'confirmPublicRenewal'])
        ->name('public-renewal.confirm');
    Route::post('/public-registration/confirm/{registrationApplication}', [ApplicationRequestController::class, 'confirmPublicRegistration'])
        ->name('public-registration.confirm');
    Route::get('/reject/{rejectionType}/{application}', [ApplicationRequestController::class, 'reject']);

    Route::get("/staffs", [OfficialController::class, 'index'])->name("officials.index");
    Route::get('/staffs/all', [OfficialController::class, 'get_all']);
    Route::get('/staffs/active', [OfficialController::class, 'get_active_staffs']);
    Route::post('/staffs', [OfficialController::class, 'store']);
    Route::post('/staffs/{official}', [OfficialController::class, 'update']);
    Route::delete('/staffs/{official}', [OfficialController::class, 'destroy']);
    Route::put('/disable-staff/{official}', [OfficialController::class, 'disableStaff']);
    Route::put('/enable-staff/{officialId}', [OfficialController::class, 'enableStaff']);

    // Transaction for Official
    Route::get('/official-transactions', [OfficialTransactionController::class, 'index'])->name('official-transactions.index');
    Route::post('/official-transactions/store', [OfficialTransactionController::class, 'store'])->name('official-transactions.store');

    // Transaction for Member
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions/store', [TransactionController::class, 'store'])->name('transactions.store');
    // Exporting transaction statement
    Route::post('/export-transactions', [TransactionController::class, 'exportTransactions']);
    Route::post('/transactions/send-credit-message/{memberId}', [TransactionController::class, 'sendCreditMessage'])->name('transactions.send-credit-message');


    Route::post('/member/{member}/locker/{locker}', [LockerController::class, 'storeLocker'])->name('locker.store');
    Route::put('/member/{member}/locker/{locker}', [LockerController::class, 'updateLocker'])->name('locker.update');
    Route::put('/member/{member}/locker/edit', [LockerController::class, 'editLocker'])->name('locker.edit');
    Route::delete('/member/{member}/locker', [LockerController::class, 'deleteLocker'])->name('locker.delete');


    Route::get("/accounts", [AccountController::class, 'index']);

    Route::get('/events', [EventsController::class, 'index'])->name('events.index');



    // Get all devices
    Route::get("/get-all-devices", function () {
        $devices = AccessControl::all();

        if (!$devices) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        return response()->json($devices);
    })->name('get-all-devices');



    // Open door for device
    Route::get("/open-door/{accessControlId}", function ($accessControlId) {
        $device = AccessControl::find($accessControlId);

        if (!$device) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        return AccessControlService::openDoor($device);
    })->name('open-door');


    Route::controller(SettingsController::class)->name('settings.')->group(function () {
        Route::get('/settings', 'index')->name('settings.index');
        Route::post('/settings/access-control', 'storeAccessControl')->name('storeAccessControl');
        Route::put('/settings/access-control/{control}', 'updateAccessControl')->name('updateAccessControl');
        Route::post('/settings/package', 'storePackage')->name('storePackage');
        Route::put('/settings/package/{package}', 'updatePackage')->name('updatePackage');
    });


    Route::put('/update-package/{member}', [MemberController::class, 'update_package'])->name('updatePackageForMember');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::get('/get-renewal-form/{phone}', function ($phone) {
    $member = Member::where('phone', $phone)->with('membershipPackage')->first();
    return response()->json(['member' => $member]);
});

require __DIR__ . '/auth.php';
