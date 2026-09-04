<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BirthdayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->user?->name,
            'email' => $this->user?->email,
            'designation' => $this->designation,
            'dob' => $this->dob,
            'department' => $this->departments?->first()?->name,
            'user_id' => $this->user_id,
            'days_until' => $this->when($this->days_until ?? false, fn() => $this->days_until),
            'age' => $this->when($this->age ?? false, fn() => $this->age),
        ];
    }
}
