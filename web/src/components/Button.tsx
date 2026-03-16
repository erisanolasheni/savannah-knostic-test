interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'border-transparent bg-red-600 text-white hover:bg-red-700',
};

export function Button({
  variant = 'secondary',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
