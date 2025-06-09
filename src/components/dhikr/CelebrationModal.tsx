import { useEffect } from 'react';

interface CelebrationModalProps {
  isVisible: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const CelebrationModal = ({
  isVisible,
  onClose,
  autoCloseDelay = 3000,
}: CelebrationModalProps) => {
  useEffect(() => {
    if (!isVisible) return undefined;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [isVisible, onClose, autoCloseDelay]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-label="Target completed celebration"
      aria-modal="true"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4 border border-white/20">
        <div className="text-6xl mb-4 animate-bounce" aria-hidden="true">
          🎉
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 font-arabic">
          مبارك!
        </h2>
        <p className="text-xl font-semibold text-gray-800 mb-2">
          Target Completed!
        </p>
        <p className="text-gray-600">بارك الله فيك - May Allah bless you</p>
      </div>
    </div>
  );
};
