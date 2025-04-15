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
        Schema::create('official_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('official_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name')->nullable(); // Optional for non-member transactions
            $table->string('transaction_type'); // Type of transaction
            $table->text('description')->nullable();
            $table->integer('amount'); // Total transaction amount
            $table->dateTime('transaction_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->string('voucher_number')->nullable(); // Optional bill number
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('official_transactions');
    }
};
