// PK Battle Modal Component
import { Swords, Clock, LogOut } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatDuration } from '../../utils/dateUtils';

const PKBattleModal = ({
    isOpen,
    onClose,
    actualMinutes,
    targetMinutes,
    onPKBattle,
    onEarlyLeave,
    isLoading = false
}) => {
    const deficitMinutes = targetMinutes - actualMinutes;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Konfirmasi Pulang"
            size="md"
        >
            <div className="text-center space-y-6">
                {/* Warning Icon */}
                <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>

                {/* Message */}
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Jam Kerja Belum Tercapai
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        Durasi kerja Anda baru <span className="font-semibold text-primary-600">{formatDuration(actualMinutes)}</span>,
                        masih kurang <span className="font-semibold text-red-600">{formatDuration(deficitMinutes)}</span> dari target.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sudah Bekerja</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{formatDuration(actualMinutes)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Target</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{formatDuration(targetMinutes)}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700" />

                {/* Options */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Pilih opsi pulang:
                    </p>

                    {/* PK Battle Option */}
                    <Button
                        onClick={onPKBattle}
                        fullWidth
                        size="lg"
                        variant="primary"
                        isLoading={isLoading}
                        leftIcon={<Swords className="w-5 h-5" />}
                    >
                        <div className="text-left">
                            <p className="font-semibold">Lanjut PK Battle</p>
                            <p className="text-xs text-primary-200">Jam kerja dihitung penuh, tidak ada defisit</p>
                        </div>
                    </Button>

                    {/* Early Leave Option */}
                    <Button
                        onClick={onEarlyLeave}
                        fullWidth
                        size="lg"
                        variant="secondary"
                        isLoading={isLoading}
                        leftIcon={<LogOut className="w-5 h-5" />}
                    >
                        <div className="text-left">
                            <p className="font-semibold">Pulang Cepat</p>
                            <p className="text-xs text-slate-500">Defisit {formatDuration(deficitMinutes)} akan dicatat</p>
                        </div>
                    </Button>
                </div>

                {/* Cancel */}
                <button
                    onClick={onClose}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    Batal, lanjut bekerja
                </button>
            </div>
        </Modal>
    );
};

export default PKBattleModal;
