'use client';

import { ReactNode } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { LuInfo as LuInfo, LuCheck as CheckCircle, LuTriangleAlert as AlertCircle, LuX as XCircle } from 'react-icons/lu';;
import { htmlToPlainText } from '@/lib/utils';

interface LuInfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  children?: ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  showButton?: boolean;
}

const typeConfig = {
  info: {
    icon: LuInfo,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    bgColor: 'bg-yellow-50',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
  },
};

export default function LuInfoModal({
  open,
  onClose,
  title,
  description,
  type = 'info',
  children,
  buttonText = 'Got it',
  onButtonClick,
  showButton = true,
}: LuInfoModalProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  const footer = showButton ? (
    <div className="flex justify-center w-full">
      <Button
        type="button"
        onClick={handleButtonClick}
        className="px-8 h-12 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
          boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
        }}
      >
        {buttonText}
      </Button>
    </div>
  ) : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      size="sm"
      className="text-center"
    >
      <div className="flex flex-col items-center space-y-6 py-4">
        <div className={`p-6 rounded-full ${config.iconBg} ${config.borderColor} border-2`}>
          <Icon className={`w-12 h-12 ${config.iconColor}`} />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 leading-relaxed">
              {htmlToPlainText(description)}
            </p>
          )}
        </div>

        {children && (
          <div className={`w-full p-4 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
            {children}
          </div>
        )}
      </div>
    </Modal>
  );
}
