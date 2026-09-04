<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BirthdayWishResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'created_at' => $this->created_at,
            'employee' => [
                'id' => $this->employee?->id,
                'name' => $this->employee?->user?->name,
                'designation' => $this->employee?->designation,
            ],
            'wished_by' => [
                'id' => $this->wishers?->id,
                'name' => $this->wishers?->user?->name,
                'designation' => $this->wishers?->designation,
            ],
        ];
    }
}
