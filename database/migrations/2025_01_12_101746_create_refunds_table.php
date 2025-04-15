<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained();
            $table->text('description')->nullable();
            $table->integer('refund_amount'); // Total expense amount
            $table->dateTime('payment_date')->default(DB::raw('CURRENT_TIMESTAMP(0)'));
            $table->string('payment_mode'); // Payment mode
            $table->string('payment_voucher')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
