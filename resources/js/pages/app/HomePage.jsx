import React, { useState, useRef } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, usePage, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import ReactApexChart from "react-apexcharts";

export default function HomePage() {
    const { auth, todos, filters, stats } = usePage().props;

    const [search, setSearch] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");

    // FORM TAMBAH
    const {
        data,
        setData,
        reset,
        post,
        processing,
        errors,
    } = useForm({
        title: "",
        status: "pending",
        note: "",
        cover: null,
    });

    // MODE EDIT
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        id: null,
        title: "",
        status: "pending",
        note: "",
        cover: null,
    });

    const daftarTodoRef = useRef(null);

    const handleSubmitCreate = (e) => {
        e.preventDefault();

        post("/todos", {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire("Berhasil", "Todo berhasil ditambahkan", "success");
                reset();
            },
            onError: () => {
                Swal.fire("Gagal", "Todo gagal ditambahkan", "error");
            },
        });
    };

    // === EDIT ===
    const handleEditClick = (todo) => {
        setEditMode(true);
        setEditData({
            id: todo.id,
            title: todo.title || "",
            status: todo.status || "pending",
            note: todo.note || "",
            cover: null, // cover baru nanti diinput kalau mau ganti
        });

        if (daftarTodoRef.current) {
            daftarTodoRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (!editData.id) return;

        router.post(
            `/todos/${editData.id}`,
            {
                _method: "put",
                title: editData.title,
                status: editData.status,
                note: editData.note,
                cover: editData.cover,
            },
            {
                forceFormData: true,
                onSuccess: () => {
                    Swal.fire("Berhasil", "Todo berhasil diperbarui", "success");
                    setEditMode(false);
                    setEditData({
                        id: null,
                        title: "",
                        status: "pending",
                        note: "",
                        cover: null,
                    });
                },
                onError: () => {
                    Swal.fire("Gagal", "Todo gagal diperbarui", "error");
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditData({
            id: null,
            title: "",
            status: "pending",
            note: "",
            cover: null,
        });
    };

    // HAPUS
    const handleDelete = (todo) => {
        Swal.fire({
            title: "Hapus data?",
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
                    },
                    onError: () => {
                        Swal.fire("Gagal", "Todo gagal dihapus", "error");
                    },
                });
            }
        });
    };

    // FILTER
    const handleFilter = (e) => {
        e.preventDefault();

        router.get(
            "/",
            {
                search: search || "",
                status: statusFilter || "",
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const chartOptions = {
        labels: ["Selesai", "Belum Selesai"],
        legend: { position: "bottom" },
    };

    const chartSeries = [stats?.completed || 0, stats?.pending || 0];

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold">Todo List</h1>
                            <p className="text-muted-foreground">
                                Hai, {auth?.name}. Kelola tugas harianmu di sini.
                            </p>
                        </div>
                    </div>

                    {/* Statistik kartu */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm text-muted-foreground">
                                    Total Todo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="text-2xl font-bold">
                                    {stats?.total || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm text-muted-foreground">
                                    Selesai
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {stats?.completed || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm text-muted-foreground">
                                    Belum Selesai
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="text-2xl font-bold text-amber-600">
                                    {stats?.pending || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Statistik */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Statistik Todo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="donut"
                                height={300}
                            />
                        </CardContent>
                    </Card>

                    {/* Pencarian & Filter */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Pencarian & Filter</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleFilter}
                                className="grid md:grid-cols-[1.5fr,1fr,auto] gap-3"
                            >
                                <div>
                                    <Label htmlFor="search">
                                        Cari Judul / Catatan
                                    </Label>
                                    <Input
                                        id="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Ketik kata kunci..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="border rounded-md px-3 py-2 w-full text-sm bg-background"
                                    >
                                        <option value="">Semua</option>
                                        <option value="pending">
                                            Belum selesai
                                        </option>
                                        <option value="completed">
                                            Selesai
                                        </option>
                                    </select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button type="submit">Terapkan</Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSearch("");
                                            setStatusFilter("");
                                            router.get(
                                                "/",
                                                {},
                                                {
                                                    preserveState: false,
                                                    preserveScroll: true,
                                                }
                                            );
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Form Tambah */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Tambah Todo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmitCreate}
                                className="grid md:grid-cols-2 gap-4"
                                encType="multipart/form-data"
                            >
                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="title">Judul</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            placeholder="Contoh: Belajar Laravel"
                                        />
                                        {errors.title && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status-form">
                                            Status
                                        </Label>
                                        <select
                                            id="status-form"
                                            value={data.status}
                                            onChange={(e) =>
                                                setData(
                                                    "status",
                                                    e.target.value
                                                )
                                            }
                                            className="border rounded-md px-3 py-2 w-full text-sm bg-background"
                                        >
                                            <option value="pending">
                                                Belum selesai
                                            </option>
                                            <option value="completed">
                                                Selesai
                                            </option>
                                        </select>
                                        {errors.status && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="cover">
                                            Cover (gambar)
                                        </Label>
                                        <Input
                                            id="cover"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setData(
                                                    "cover",
                                                    e.target.files[0] || null
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Boleh dikosongkan jika tidak pakai
                                            cover.
                                        </p>
                                        {errors.cover && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.cover}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={processing}>
                                            Simpan
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Catatan</Label>
                                    <textarea
                                        className="border rounded-md px-3 py-2 w-full min-h-[150px] text-sm bg-background"
                                        value={data.note}
                                        onChange={(e) =>
                                            setData("note", e.target.value)
                                        }
                                        placeholder="Detail tugas, langkah-langkah, dll."
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        *Opsional: kalau mau pakai Trix Editor,
                                        ganti textarea ini dengan komponen Trix
                                        dari{" "}
                                        <a
                                            href="https://trix-editor.org/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline"
                                        >
                                            https://trix-editor.org/
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* List Todo + FORM EDIT DI SINI */}
                    <Card ref={daftarTodoRef}>
                        <CardHeader className="pb-2">
                            <CardTitle>Daftar Todo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* FORM EDIT */}
                            {editMode && (
                                <div className="mb-6 border rounded-md p-4 bg-slate-50">
                                    <h3 className="font-semibold mb-3 text-sm">
                                        Ubah Todo
                                    </h3>
                                    <form
                                        onSubmit={handleUpdateSubmit}
                                        className="grid md:grid-cols-2 gap-4"
                                        encType="multipart/form-data"
                                    >
                                        <div className="space-y-3">
                                            <div>
                                                <Label htmlFor="edit-title">
                                                    Judul
                                                </Label>
                                                <Input
                                                    id="edit-title"
                                                    value={editData.title}
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            title: e.target
                                                                .value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="edit-status">
                                                    Status
                                                </Label>
                                                <select
                                                    id="edit-status"
                                                    value={editData.status}
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            status:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    className="border rounded-md px-3 py-2 w-full text-sm bg-background"
                                                >
                                                    <option value="pending">
                                                        Belum selesai
                                                    </option>
                                                    <option value="completed">
                                                        Selesai
                                                    </option>
                                                </select>
                                            </div>
                                            <div>
                                                <Label htmlFor="edit-cover">
                                                    Cover (ganti jika perlu)
                                                </Label>
                                                <Input
                                                    id="edit-cover"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            cover:
                                                                e.target
                                                                    .files[0] ||
                                                                null,
                                                        }))
                                                    }
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Kosongkan jika tidak ingin
                                                    mengubah cover.
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="submit">
                                                    Simpan Perubahan
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Catatan</Label>
                                            <textarea
                                                className="border rounded-md px-3 py-2 w-full min-h-[150px] text-sm bg-background"
                                                value={editData.note}
                                                onChange={(e) =>
                                                    setEditData((prev) => ({
                                                        ...prev,
                                                        note: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </form>
                                </div>
                            )}

                            {todos?.data?.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada data. Tambah todo baru di atas.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-left">
                                                    <th className="py-2 pr-2">
                                                        Cover
                                                    </th>
                                                    <th className="py-2 pr-2">
                                                        Judul
                                                    </th>
                                                    <th className="py-2 pr-2">
                                                        Status
                                                    </th>
                                                    <th className="py-2 pr-2">
                                                        Catatan
                                                    </th>
                                                    <th className="py-2">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {todos.data.map((todo) => (
                                                    <tr
                                                        key={todo.id}
                                                        className="border-b align-top"
                                                    >
                                                        <td className="py-2 pr-2">
                                                            {todo.cover ? (
                                                                <img
                                                                    src={`/storage/${todo.cover}`}
                                                                    alt={
                                                                        todo.title
                                                                    }
                                                                    className="w-16 h-16 object-cover rounded-md border"
                                                                />
                                                            ) : (
                                                                <div className="w-16 h-16 rounded-md border flex items-center justify-center text-[10px] text-muted-foreground">
                                                                    Tidak ada
                                                                    cover
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <div className="font-medium">
                                                                {todo.title}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    todo.created_at
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="py-2 pr-2">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${
                                                                    todo.status ===
                                                                    "completed"
                                                                        ? "bg-emerald-100 text-emerald-700"
                                                                        : "bg-amber-100 text-amber-700"
                                                                }`}
                                                            >
                                                                {todo.status ===
                                                                "completed"
                                                                    ? "Selesai"
                                                                    : "Belum selesai"}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 pr-2 max-w-xs">
                                                            <div className="line-clamp-4 whitespace-pre-line">
                                                                {todo.note}
                                                            </div>
                                                        </td>
                                                        <td className="py-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleEditClick(
                                                                            todo
                                                                        )
                                                                    }
                                                                >
                                                                    Ubah
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            todo
                                                                        )
                                                                    }
                                                                >
                                                                    Hapus
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {todos.links && (
                                        <div className="flex flex-wrap gap-2">
                                            {todos.links.map(
                                                (link, index) => (
                                                    <button
                                                        key={index}
                                                        disabled={!link.url}
                                                        onClick={() => {
                                                            if (
                                                                !link.url ||
                                                                link.active
                                                            )
                                                                return;
                                                            router.get(
                                                                link.url,
                                                                {},
                                                                {
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                }
                                                            );
                                                        }}
                                                        className={`px-3 py-1 rounded border text-xs ${
                                                            link.active
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : "bg-background text-foreground"
                                                        } ${
                                                            !link.url
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : ""
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
