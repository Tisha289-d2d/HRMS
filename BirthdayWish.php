<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BirthdayWish extends Model
{
    protected $fillable = ['employee_id', 'wished_by', 'message'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function wishers()
    {
        return $this->belongsTo(Employee::class, 'wished_by');
    }
}
