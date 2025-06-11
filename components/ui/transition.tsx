'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/lib/navigation-context';
import { Loading } from './loading';

interface TransitionProps {
  children: React.ReactNode;
}

export function Transition({ children }: TransitionProps) {
  const { isLoading, error } = useNavigation();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <Loading size="lg" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50"
            >
              {error}
            </motion.div>
          )}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 