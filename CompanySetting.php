<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name', 'company_code', 'company_email', 'company_phone',
        'company_website', 'company_address', 'company_city', 'company_state',
        'company_country', 'company_zipcode', 'company_logo', 'company_favicon',
        'tax_number', 'registration_number', 'created_by', 'updated_by',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
