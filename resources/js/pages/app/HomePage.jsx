import React, { useState, useRef } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import Swal from "sweetalert2";
import ReactApexChart from "react-apexcharts";

const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export default function HomePage() {
    const { auth, todos, filters, stats } = usePage().props;

    const [search, setSearch] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");

    // FORM TAMBAH
    const { data, setData, reset, post, processing, errors } = useForm({
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
            cover: null,
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
        dataLabels: { enabled: false },
        stroke: { width: 0 },
    };

    const chartSeries = [stats?.completed || 0, stats?.pending || 0];

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-100/70">
                <div className="max-w-6xl mx-auto px-4 py-10udem space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-500 mb-2">
                                Daily Planner
                            </p>
                            <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                                Todo List Dashboard
                            </h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Hai, <span className="font-medium">{auth?.name}</span>.{" "}
                                Atur dan pantau pekerjaanmu dengan lebih rapi di satu tempat.
                            </p>
                        </div>
                    </div>

                    {/* Statistik + Chart */}
                    <div className="grid lg:grid-cols-[1.1fr,1fr] gap-4">
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Total Todo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <div className="text-3xl font-semibold text-slate-900">
                                        {stats?.total || 0}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Semua tugas yang kamu catat.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                                        Selesai
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <div className="text-3xl font-semibold text-emerald-700">
                                        {stats?.completed || 0}
                                    </div>
                                    <p className="mt-1 text-xs text-emerald-700/70">
                                        Good job, terus pertahankan!
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl shadow-sm border border-amber-100 bg-gradient-to-br from-amber-50 to-white">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-xs font-medium uppercase tracking-wide text-amber-700">
                                        Belum Selesai
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <div className="text-3xl font-semibold text-amber-700">
                                        {stats?.pending || 0}
                                    </div>
                                    <p className="mt-1 text-xs text-amber-700/70">
                                        Prioritaskan tugas penting hari ini.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-sm font-semibold text-slate-800">
                                    Statistik Todo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ReactApexChart
                                    options={chartOptions}
                                    series={chartSeries}
                                    type="donut"
                                    height={260}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pencarian & Filter */}
                    <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold text-slate-800">
                                Pencarian & Filter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleFilter}
                                className="grid md:grid-cols-[1.5fr,1fr,auto] gap-3"
                            >
                                <div>
                                    <Label
                                        htmlFor="search"
                                        className="text-xs font-medium text-slate-600"
                                    >
                                        Cari Judul / Catatan
                                    </Label>
                                    <Input
                                        id="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Contoh: Belajar Laravel, Meeting, dsb."
                                        className="mt-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <Label
                                        htmlFor="status"
                                        className="text-xs font-medium text-slate-600"
                                    >
                                        Status
                                    </Label>
                                    <select
                                        id="status"
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="mt-1 border border-slate-300 rounded-md px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                    >
                                        <option value="">Semua</option>
                                        <option value="pending">
                                            Belum selesai
                                        </option>
                                        <option value="completed">Selesai</option>
                                    </select>
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button
                                        type="submit"
                                        className="w-full md:w-auto text-sm"
                                    >
                                        Terapkan
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full md:w-auto text-sm"
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

                    {/* Form Tambah + Daftar */}
                    <div className="grid lg:grid-cols-[0.95fr,1.05fr] gap-4 items-start">
                        {/* Form Tambah */}
                        <Card className="rounded-2xl shadow-sm border border-slate-200 bg-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-800">
                                    Tambah Todo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmitCreate}
                                    className="grid gap-4"
                                    encType="multipart/form-data"
                                >
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="title"
                                            className="text-xs font-medium text-slate-600"
                                        >
                                            Judul
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData("title", e.target.value)
                                            }
                                            placeholder="Contoh: Belajar Laravel"
                                            className="text-sm"
                                        />
                                        {errors.title && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="status-form"
                                                className="text-xs font-medium text-slate-600"
                                            >
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
                                                className="border border-slate-300 rounded-md px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
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

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="cover"
                                                className="text-xs font-medium text-slate-600"
                                            >
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
                                                className="text-sm"
                                            />
                                            <p className="text-[11px] text-slate-500">
                                                Boleh dikosongkan jika tidak
                                                pakai cover.
                                            </p>
                                            {errors.cover && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    {errors.cover}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">
                                            Catatan
                                        </Label>
                                        <textarea
                                            className="border border-slate-300 rounded-md px-3 py-2 w-full min-h-[140px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                            value={data.note}
                                            onChange={(e) =>
                                                setData("note", e.target.value)
                                            }
                                            placeholder="Detail tugas, langkah-langkah, dll."
                                        />
                                        <p className="text-[11px] text-slate-500">
                                            *Opsional: bisa diganti dengan Trix
                                            Editor dari{" "}
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

                                    <div className="flex gap-2 justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="text-sm"
                                        >
                                            Simpan
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Daftar Todo + Form Edit */}
                        <Card
                            ref={daftarTodoRef}
                            className="rounded-2xl shadow-sm border border-slate-200 bg-white"
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-800">
                                    Daftar Todo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* FORM EDIT */}
                                {editMode && (
                                    <div className="mb-6 border border-slate-200 rounded-xl p-4 bg-slate-50/80">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-sm text-slate-800">
                                                Ubah Todo
                                            </h3>
                                            <span className="text-[11px] uppercase tracking-wide text-slate-500">
                                                Mode Edit
                                            </span>
                                        </div>
                                        <form
                                            onSubmit={handleUpdateSubmit}
                                            className="grid md:grid-cols-2 gap-4"
                                            encType="multipart/form-data"
                                        >
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="edit-title"
                                                        className="text-xs font-medium text-slate-600"
                                                    >
                                                        Judul
                                                    </Label>
                                                    <Input
                                                        id="edit-title"
                                                        value={editData.title}
                                                        onChange={(e) =>
                                                            setEditData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    title: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            )
                                                        }
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="edit-status"
                                                        className="text-xs font-medium text-slate-600"
                                                    >
                                                        Status
                                                    </Label>
                                                    <select
                                                        id="edit-status"
                                                        value={editData.status}
                                                        onChange={(e) =>
                                                            setEditData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    status:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                        className="border border-slate-300 rounded-md px-3 py-2 w-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                    >
                                                        <option value="pending">
                                                            Belum selesai
                                                        </option>
                                                        <option value="completed">
                                                            Selesai
                                                        </option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="edit-cover"
                                                        className="text-xs font-medium text-slate-600"
                                                    >
                                                        Cover (ganti jika perlu)
                                                    </Label>
                                                    <Input
                                                        id="edit-cover"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            setEditData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    cover:
                                                                        e.target
                                                                            .files[0] ||
                                                                        null,
                                                                })
                                                            )
                                                        }
                                                        className="text-sm"
                                                    />
                                                    <p className="text-[11px] text-slate-500">
                                                        Kosongkan jika tidak
                                                        ingin mengubah cover.
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="submit"
                                                        className="text-sm"
                                                    >
                                                        Simpan Perubahan
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="text-sm"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        Batal
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium text-slate-600">
                                                    Catatan
                                                </Label>
                                                <textarea
                                                    className="border border-slate-300 rounded-md px-3 py-2 w-full min-h-[140px] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                                                    value={editData.note}
                                                    onChange={(e) =>
                                                        setEditData((prev) => ({
                                                            ...prev,
                                                            note: e.target
                                                                .value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {todos?.data?.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Belum ada data. Tambah todo baru di
                                        sebelah kiri.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="overflow-hidden border border-slate-200 rounded-xl">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-left">
                                                        <th className="py-2.5 pl-4 pr-2 text-xs font-semibold text-slate-500">
                                                            Cover
                                                        </th>
                                                        <th className="py-2.5 pr-2 text-xs font-semibold text-slate-500">
                                                            Judul
                                                        </th>
                                                        <th className="py-2.5 pr-2 text-xs font-semibold text-slate-500">
                                                            Status
                                                        </th>
                                                        <th className="py-2.5 pr-2 text-xs font-semibold text-slate-500">
                                                            Catatan
                                                        </th>
                                                        <th className="py-2.5 pr-4 text-xs font-semibold text-slate-500">
                                                            Aksi
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {todos.data.map((todo, i) => (
                                                        <tr
                                                            key={todo.id}
                                                            className={`border-b border-slate-100 last:border-0 ${
                                                                i % 2 === 0
                                                                    ? "bg-white"
                                                                    : "bg-slate-50/40"
                                                            } hover:bg-slate-50 transition-colors`}
                                                        >
                                                            <td className="py-2.5 pl-4 pr-2 align-top">
                                                                {todo.cover ? (
                                                                    <img
                                                                        src={`/storage/${todo.cover}`}
                                                                        alt={
                                                                            todo.title
                                                                        }
                                                                        className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 bg-slate-50">
                                                                        Tidak ada
                                                                        cover
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-2.5 pr-2 align-top">
                                                                <div className="font-medium text-slate-800">
                                                                    {todo.title}
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                                    {formatDateTime(
                                                                        todo.created_at
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 pr-2 align-top">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm ${
                                                                        todo.status ===
                                                                        "completed"
                                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                                            : "bg-amber-50 text-amber-700 border border-amber-100"
                                                                    }`}
                                                                >
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                                                                    {todo.status ===
                                                                    "completed"
                                                                        ? "Selesai"
                                                                        : "Belum selesai"}
                                                                </span>
                                                            </td>
                                                            <td className="py-2.5 pr-2 align-top max-w-xs">
                                                                <div className="line-clamp-4 whitespace-pre-line text-xs text-slate-700">
                                                                    {todo.note}
                                                                </div>
                                                            </td>
                                                            <td className="py-2.5 pr-4 align-top">
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Link
                                                                        href={`/todos/${todo.id}`}
                                                                        className="h-7 px-3 inline-flex items-center justify-center rounded-md border border-slate-200 text-xs text-slate-700 bg-white hover:bg-slate-900 hover:text-white transition-colors"
                                                                    >
                                                                        Detail
                                                                    </Link>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 px-3 text-xs"
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
                                                                        className="h-7 px-3 text-xs"
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
                                            <div className="flex flex-wrap gap-2 justify-end">
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
                                                                        preserveState:
                                                                            true,
                                                                        preserveScroll:
                                                                            true,
                                                                    }
                                                                );
                                                            }}
                                                            className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                                                                link.active
                                                                    ? "bg-slate-900 text-white border-slate-900"
                                                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
                                                            } ${
                                                                !link.url
                                                                    ? "opacity-50 cursor-not-allowed hover:bg-white hover:text-slate-700 hover:border-slate-200"
                                                                    : ""
                                                            }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html:
                                                                    link.label,
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
            </div>
        </AppLayout>
    );
}
