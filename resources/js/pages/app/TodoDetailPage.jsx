import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { usePage, Link, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export default function TodoDetailPage() {
    const { auth, todo } = usePage().props;

    const handleDelete = () => {
        Swal.fire({
            title: "Hapus todo ini?",
            text: "Data yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/todos/${todo.id}`, {
                    onSuccess: () => {
                        Swal.fire("Berhasil", "Todo berhasil dihapus", "success");
                        router.visit("/");
                    },
                    onError: () => {
                        Swal.fire("Gagal", "Todo gagal dihapus", "error");
                    },
                });
            }
        });
    };

    const statusBadgeClass =
        todo.status === "completed"
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-amber-50 text-amber-700 border-amber-100";

    const statusText =
        todo.status === "completed" ? "Selesai" : "Belum selesai";

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-100/70">
                <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-500 mb-2">
                                Detail Todo
                            </p>
                            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                                {todo.title}
                            </h1>
                            <p className="mt-1 text-xs text-slate-500">
                                Dibuat oleh {auth?.name}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <Link
                                href="/"
                                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-900 hover:text-white transition-colors"
                            >
                                &larr; Kembali
                            </Link>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="text-xs"
                                onClick={handleDelete}
                            >
                                Hapus
                            </Button>
                        </div>
                    </div>

                    <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-slate-800">
                                Ringkasan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Cover */}
                            {todo.cover && (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <img
                                        src={`/storage/${todo.cover}`}
                                        alt={todo.title}
                                        className="w-full max-h-[320px] object-cover"
                                    />
                                </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Status
                                    </p>
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-medium border ${statusBadgeClass} shadow-sm`}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                                        {statusText}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                                        Waktu
                                    </p>
                                    <div className="text-xs text-slate-700 space-y-1">
                                        <p>
                                            <span className="font-medium">
                                                Dibuat:
                                            </span>{" "}
                                            {formatDateTime(todo.created_at)}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Diubah:
                                            </span>{" "}
                                            {formatDateTime(todo.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                                    Catatan
                                </p>
                                {todo.note ? (
                                    <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                                        {todo.note}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">
                                        Tidak ada catatan.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
