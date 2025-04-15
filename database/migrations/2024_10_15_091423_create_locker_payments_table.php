<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLockerPaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('locker_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            $table->integer('total_months');
            $table->integer('locker_charge');
            $table->integer('locker_discount')->nullable();
            $table->string('bill_number')->nullable();
            $table->string('payment_mode')->nullable();
            $table->date('payment_date');
            $table->date('active_till');
            $table->integer('paid_amount');
            $table->integer('net_amount');
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('locker_payments');
    }
}
