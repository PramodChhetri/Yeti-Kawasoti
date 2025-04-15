<?php

use Database\Seeders\MembersSeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('occupation');
            $table->date('date_of_birth');
            $table->integer('credit')->default(0);
            $table->string('phone');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('marital_status', ['single', 'married']);
            $table->string('preferred_time');
            $table->string('address');
            $table->string('photo')->nullable();
            $table->foreignId('membership_package_id')->constrained()->onDelete('cascade');
            $table->date('start_date')->default(now());
            $table->date('end_date')->nullable();
            $table->date('payment_expiry_date');
            $table->integer('total_payment')->default(0);
            $table->boolean('is_approved')->default(true);
            $table->text("remarks")->nullable();
            $table->string('emergency_person_name')->nullable();
            $table->string('emergency_person_phone')->nullable();
            $table->string('card_number')->nullable();
            $table->integer('balance')->default(0);
            $table->timestamps();
            $table->boolean("on_device")->default(false);
        });

        /* (new MembersSeeder())->run(); */
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
