<?php

namespace App\Listeners;

use App\Events\MemberCreated;
use App\Services\AccessControlService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SyncMemberWithDevices
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(MemberCreated $event): void
    {
        $member = $event->member;
        $access_control_service = new AccessControlService();
        $access_control_service->putMember($member->id);
    }
}
