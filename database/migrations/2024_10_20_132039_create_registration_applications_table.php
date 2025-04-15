<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRegistrationApplicationsTable extends Migration
{
    public function up()
    {
        Schema::create('registration_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->unique();
            $table->string('occupation');
            $table->string('gender');
            $table->string('marital_status');
            $table->date('date_of_birth');
            $table->string('address');
            $table->string('preferred_time');
            $table->foreignId('membership_package_id')->constrained()->onDelete('cascade');
            $table->integer('months');
            $table->string('emergency_person_name');
            $table->string('emergency_person_phone');
            $table->string('photo')->nullable();
            $table->boolean('is_approved')->default(false); // For approval status
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('registration_applications');
    }
}
