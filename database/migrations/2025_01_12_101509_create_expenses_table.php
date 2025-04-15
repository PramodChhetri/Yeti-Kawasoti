<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('expense_type');
            $table->text('description')->nullable();
            $table->integer('expense_amount'); // Total expense amount
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
        Schema::dropIfExists('expenses');
    }
};
