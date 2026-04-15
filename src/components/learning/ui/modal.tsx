'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LuX as X } from 'react-icons/lu';;
import { htmlToPlainText } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
  showCancelButton?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  className?: string;
}

const sizeClasses = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[500px]',
  lg: 'sm:max-w-[600px]',
  xl: 'sm:max-w-[800px]',
  '2xl': 'sm:max-w-[1000px]',
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  showCancelButton = true,
  cancelText = 'Cancel',
  onCancel,
  className = '',
}: ModalProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl rounded-2xl overflow-hidden ${className}`}>
        <DialogHeader className="text-white p-6 -m-6 mb-6" style={{
          background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
        }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <div className="w-6 h-6 bg-white/30 rounded"></div>
                </div>
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-2 text-base" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {htmlToPlainText(description)}
                </DialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <kbd className="px-2 py-1 bg-white/20 rounded text-xs font-mono">ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </DialogHeader>
        
        <div className="px-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {children}
        </div>

        {(footer || showCancelButton) && (
          <DialogFooter className="pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            {footer ? (
              footer
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-12 transition-all duration-200 font-medium group"
                  style={{
                    color: '#7B2CBF',
                    borderColor: '#7B2CBF',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#A855F7';
                    e.currentTarget.style.color = '#A855F7';
                    e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#7B2CBF';
                    e.currentTarget.style.color = '#7B2CBF';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  {cancelText}
                </Button>
              </div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
