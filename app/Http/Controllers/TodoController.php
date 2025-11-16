<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TodoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'  => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'in:pending,completed'],
            'note'   => ['nullable', 'string'],
            'cover'  => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:2048'],
        ]);

        $todo = new Todo();
        $todo->user_id = Auth::id();
        $todo->title   = $validated['title'];
        $todo->status  = $validated['status'] ?? 'pending';
        $todo->note    = $validated['note'] ?? null;

        if ($request->hasFile('cover')) {
            $todo->cover = $request->file('cover')->store('covers', 'public');
        }

        $todo->save();

        return back();
    }

    public function show(Todo $todo)
    {
        $this->ensureOwner($todo);

        return Inertia::render('app/TodoDetailPage', [
            'auth' => Auth::user(),
            'todo' => $todo,
        ]);
    }

    public function update(Request $request, Todo $todo)
    {
        $this->ensureOwner($todo);

        $validated = $request->validate([
            'title'  => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'in:pending,completed'],
            'note'   => ['nullable', 'string'],
            'cover'  => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:2048'],
        ]);

        $todo->title  = $validated['title'];
        $todo->status = $validated['status'] ?? 'pending';
        $todo->note   = $validated['note'] ?? null;

        if ($request->hasFile('cover')) {
            if ($todo->cover) {
                Storage::disk('public')->delete($todo->cover);
            }

            $todo->cover = $request->file('cover')->store('covers', 'public');
        }

        $todo->save();

        return back();
    }

    public function destroy(Todo $todo)
    {
        $this->ensureOwner($todo);

        if ($todo->cover) {
            Storage::disk('public')->delete($todo->cover);
        }

        $todo->delete();

        // setelah hapus, selalu balik ke halaman utama
        return redirect()->route('home');
    }

    protected function ensureOwner(Todo $todo): void
    {
        if ($todo->user_id !== Auth::id()) {
            abort(403);
        }
    }
}
