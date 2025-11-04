

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DailySummary, SavingType } from '../../types';
import { DepositIcon, TransactionIcon, PrintIcon } from '../../components/Icons';
import FormButton from '../../components/FormButton';

const DailyDeposit: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: summary, isLoading, error } = useQuery<DailySummary>({
        queryKey: ['dailySummary'],
        queryFn: api.getGuruDailySummary,
    });

    const mutation = useMutation({
        mutationFn: api.submitDailyDeposit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
            toast.success('Setoran harian berhasil diajukan!');
        },
        onError: (err) => {
            toast.error((err as Error).message || 'Gagal mengajukan setoran.');
        },
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <p className="text-rose-500">Gagal memuat ringkasan harian.</p>;
    
    const totalDeposit = summary?.transactions
        .filter(tx => tx.type === SavingType.DEPOSIT)
        .reduce((acc, tx) => acc + tx.amount, 0) || 0;
        
    const totalWithdrawal = summary?.transactions
        .filter(tx => tx.type === SavingType.WITHDRAWAL)
        .reduce((acc, tx) => acc + tx.amount, 0) || 0;

    const netAmount = totalDeposit - totalWithdrawal;

    const renderStatus = () => {
        if (summary?.submissionStatus) {
            return (
                <div className="bg-emerald-100 text-emerald-800 p-4 rounded-lg">
                    <p className="font-semibold">Setoran hari ini sudah diajukan dan menunggu konfirmasi dari bendahara.</p>
                </div>
            );
        }
        return (
             <div className="bg-blue-100 text-blue-800 p-4 rounded-lg">
                <p className="font-semibold">Anda belum mengajukan setoran untuk hari ini.</p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 print:hidden">
                <h1 className="text-3xl font-bold text-slate-800">Setoran Harian</h1>
                <FormButton variant="secondary" onClick={handlePrint} disabled={!summary || summary.transactions.length === 0}>
                    <PrintIcon />
                    Cetak Laporan
                </FormButton>
            </div>

            {/* Print-only Header */}
            <div className="hidden print:block mb-6 text-center border-b-2 border-black pb-4">
                <h1 className="text-xl font-bold">LAPORAN SETORAN HARIAN</h1>
                <h2 className="text-lg">SI-TAKU</h2>
            </div>
            <div className="hidden print:block mb-6 text-sm">
                <p><strong>Nama Guru:</strong> {user?.username}</p>
                <p><strong>Kelas:</strong> {user?.classManaged}</p>
                <p><strong>Tanggal:</strong> {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6 print:shadow-none print:p-0">
                <div className="print:hidden">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Status Pengajuan</h2>
                    {renderStatus()}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Ringkasan Transaksi Hari Ini</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 p-4 rounded-md print:border print:border-slate-300">
                            <p className="text-sm text-emerald-700">Total Setoran</p>
                            <p className="text-2xl font-bold text-emerald-800">Rp {totalDeposit.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-md print:border print:border-slate-300">
                            <p className="text-sm text-amber-700">Total Penarikan</p>
                            <p className="text-2xl font-bold text-amber-800">Rp {totalWithdrawal.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-md print:border print:border-slate-300">
                            <p className="text-sm text-slate-700">Total Dana Disetor</p>
                            <p className="text-2xl font-bold text-slate-800">Rp {netAmount.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
                
                {!summary?.submissionStatus && netAmount > 0 && (
                     <div className="print:hidden">
                        <button 
                            onClick={() => mutation.mutate()} 
                            disabled={mutation.isPending}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm"
                        >
                            {mutation.isPending ? 'Mengajukan...' : 'Setor ke Bendahara'}
                        </button>
                    </div>
                )}
                
                <div className="pt-4">
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Detail Transaksi</h3>
                     <ul className="divide-y divide-slate-200 max-h-60 overflow-y-auto print:max-h-full">
                        {summary?.transactions.length === 0 ? <p className="text-slate-500 py-4">Tidak ada transaksi hari ini.</p> : summary?.transactions.map(tx => (
                            <li key={tx.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className={`font-semibold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600 print:text-black' : 'text-amber-600 print:text-black'}`}>
                                        <span className="print:hidden">
                                            {tx.type === SavingType.DEPOSIT ? <DepositIcon className="inline mr-2"/> : <TransactionIcon className="inline mr-2"/>}
                                        </span>
                                        {tx.studentName} - {tx.notes || (tx.type === SavingType.DEPOSIT ? 'Setoran' : 'Penarikan')}
                                    </p>
                                    <p className="text-sm text-slate-500 pl-8 print:pl-0">{new Date(tx.createdAt).toLocaleTimeString('id-ID')}</p>
                                </div>
                                <p className={`font-bold ${tx.type === SavingType.DEPOSIT ? 'text-emerald-600 print:text-black' : 'text-amber-600 print:text-black'}`}>
                                   {tx.type === SavingType.DEPOSIT ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                 {/* Print-only Signature section */}
                <div className="hidden print:block mt-24 text-sm">
                    <div className="flex justify-around">
                        <div className="text-center">
                            <p className="mb-16">Guru Wali Kelas,</p>
                            <p>({user?.username})</p>
                        </div>
                        <div className="text-center">
                            <p className="mb-16">Bendahara,</p>
                            <p>(.........................)</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DailyDeposit;