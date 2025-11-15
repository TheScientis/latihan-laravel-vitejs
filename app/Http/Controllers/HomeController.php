<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function home(Request $request)
    {
        $auth = Auth::user();

        $search = $request->input('search');
        $status = $request->input('status');

        // Query utama untuk listing (dengan filter)
        $query = Todo::where('user_id', $auth->id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('note', 'like', '%' . $search . '%');
            });
        }

        if ($status && in_array($status, ['pending', 'completed'])) {
            $query->where('status', $status);
        }

        // Pagination 20 data per halaman
        $todos = $query
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Statistik global (tanpa filter)
        $baseStats = Todo::where('user_id', $auth->id);

        $stats = [
            'total'     => (clone $baseStats)->count(),
            'completed' => (clone $baseStats)->where('status', 'completed')->count(),
            'pending'   => (clone $baseStats)->where('status', 'pending')->count(),
        ];

        return Inertia::render('app/HomePage', [
            'auth'    => $auth,
            'todos'   => $todos,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats'   => $stats,
        ]);
    }
}
