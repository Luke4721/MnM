import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'flat';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
} = ({
  children,
  variant = 'glass',
  hoverable = false,
  className = '',
  ...rest
}) => {
  const variantMap = {
    glass:
      'bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)]',
    solid:
      'bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]',
    flat:
      'bg-white/40 border border-white/40 shadow-none',
  };

  const hoverClass = hoverable
    ? 'hover:bg-white/75 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200'
    : '';

  return (
    <div
      className={`rounded-2xl overflow-hidden ${variantMap[variant]} ${hoverClass} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div
    className={`px-6 py-4 border-b border-white/40 flex items-center justify-between gap-4 ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <h3
    className={`text-base font-bold text-gray-900 tracking-tight flex items-center gap-2 ${className}`}
    {...rest}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <p className={`text-[12px] text-gray-500 font-normal mt-0.5 ${className}`} {...rest}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div className={`p-6 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <div
    className={`px-6 py-4 border-t border-white/40 bg-white/20 flex items-center justify-between gap-3 ${className}`}
    {...rest}
  >
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
