import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`flex items-start gap-3 p-4 rounded-2xl shadow-float border backdrop-blur-md ${
            isSuccess
              ? 'bg-teal-50/95 dark:bg-teal-950/90 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-100'
              : isError
              ? 'bg-coral-50/95 dark:bg-coral-950/90 border-coral-200 dark:border-coral-800 text-coral-900 dark:text-coral-100'
              : 'bg-navy-50/95 dark:bg-navy-900/90 border-navy-200 dark:border-navy-700 text-navy-900 dark:text-navy-100'
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
            {isError && <AlertCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-navy-600 dark:text-navy-400" />}
          </div>
          <div className="flex-1 text-xs font-bold leading-relaxed">
            {toast.message}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
