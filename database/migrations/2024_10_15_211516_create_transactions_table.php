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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name')->nullable(); // Optional for non-member transactions
            $table->string('transaction_type'); // Type of transaction
            $table->text('description')->nullable();
            $table->integer('total_amount'); // Total transaction amount
            $table->integer('paid_amount'); // Amount paid
            $table->dateTime('payment_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->string('payment_mode'); // Payment mode
            $table->string('bill_number')->nullable(); // Optional bill number
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
