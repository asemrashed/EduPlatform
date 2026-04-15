'use client';

import { ReactNode, FormEvent } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { LuSave as Save, LuX as X } from 'react-icons/lu';;

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  title: string;
  description?: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  submitVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  showCancelButton?: boolean;
  formId?: string;
  className?: string;
}

const submitVariantClasses = {
  default: 'text-white',
  primary: 'text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
};

export default function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  size = 'md',
  submitVariant = 'default',
  showCancelButton = true,
  formId,
  className = '',
}: FormModalProps) {
  // Debug FormModal props
  console.log('FormModal render - open:', open, 'title:', title);
  const footer = (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      {showCancelButton && (
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1 h-12 transition-all duration-200 font-medium group"
          style={{
            color: '#7B2CBF',
            borderColor: '#7B2CBF',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = '#A855F7';
              e.currentTarget.style.color = '#A855F7';
              e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
            }
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
      )}
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('FormModal button clicked');
          onSubmit(e as any);
        }}
        disabled={loading}
        className={`flex-1 h-12 ${submitVariantClasses[submitVariant]} font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]`}
        style={
          submitVariant === 'default' || submitVariant === 'primary'
            ? {
                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
              }
            : undefined
        }
        onMouseEnter={
          submitVariant === 'default' || submitVariant === 'primary'
            ? (e) => {
                if (!loading) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                }
              }
            : undefined
        }
        onMouseLeave={
          submitVariant === 'default' || submitVariant === 'primary'
            ? (e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
              }
            : undefined
        }
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{submitText}...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            <span>{submitText}</span>
          </div>
        )}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      size={size}
      className={className}
    >
      <form 
        id={formId} 
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }} 
        className="space-y-6 pb-6"
      >
        {children}
      </form>
    </Modal>
  );
}
