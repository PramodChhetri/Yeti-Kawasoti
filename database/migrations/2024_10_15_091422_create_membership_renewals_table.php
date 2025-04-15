<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMembershipRenewalsTable extends Migration
{
    public function up()
    {
        Schema::create('membership_renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            $table->foreignId('membership_package_id')->constrained()->onDelete('cascade');
            $table->integer('monthly_fees');
            $table->integer('total_months');
            $table->integer('paid_amount');
            $table->integer('extra_discount')->nullable();
            $table->integer('package_discount')->nullable();
            $table->string('bill_number')->nullable();
            $table->date('payment_date');
            $table->string('payment_mode');
            $table->string('payment_proof')->nullable();
            $table->date('active_till');
            $table->integer('net_amount');
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('membership_renewals');
    }
}
