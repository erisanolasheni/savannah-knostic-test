import { useState } from 'react';
import { Button } from './Button';

interface ConfirmButtonProps {
  label: string;
  confirmLabel?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}

export function ConfirmButton({
  label,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  disabled,
  className = '',
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (confirming) {
      onConfirm();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setConfirming(false), 200);
  };

  return (
    <Button
      variant={confirming ? 'primary' : variant}
      onClick={handleClick}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
    >
      {confirming ? confirmLabel : label}
    </Button>
  );
}
