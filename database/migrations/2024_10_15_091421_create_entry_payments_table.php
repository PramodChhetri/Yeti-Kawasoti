<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEntryPaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('entry_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            $table->integer('admission_fees')->nullable();
            $table->integer('monthly_fees')->nullable();
            $table->integer('total_months')->nullable();
            $table->integer('total_monthly_fees')->nullable();
            $table->integer('extra_discount')->nullable();
            $table->integer('locker_months')->nullable();
            $table->integer('locker_charge')->nullable();
            $table->integer('locker_discount')->nullable();
            $table->integer('paid_amount')->nullable();
            $table->integer('net_amount')->nullable();
            $table->integer('package_discount')->nullable();
            $table->date('payment_date')->nullable();
            $table->string('bill_number')->nullable();
            $table->string('payment_mode')->default('cash');
            $table->date('active_till')->nullable();
            $table->string('payment_proof')->nullable();
            $table->boolean('is_approved')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('entry_payments');
    }
}
