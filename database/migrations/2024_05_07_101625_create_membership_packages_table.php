<?php

use Database\Seeders\MembershipPackagesTableSeeder;
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
        Schema::create('membership_packages', function (Blueprint $table) {
            $table->id();
            $table->string('package_name');
            $table->integer('admission_amount');
            $table->integer('monthly_amount');
            $table->integer('discount_quarterly')->default(0);
            $table->integer('discount_half_yearly')->default(0);
            $table->integer('discount_yearly')->default(0);
            $table->integer('months')->default(0);
        });
    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_packages');
    }
};
