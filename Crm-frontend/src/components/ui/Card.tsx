import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = false,
  hover = false
}) => {
  const getPaddingClass = (padding: string) => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'p-4';
      case 'md': return 'p-6';
      case 'lg': return 'p-8';
      default: return 'p-6';
    }
  };

  const getShadowClass = (shadow: string) => {
    switch (shadow) {
      case 'none': return '';
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      default: return 'shadow-md';
    }
  };

  const getRoundedClass = (rounded: string) => {
    switch (rounded) {
      case 'none': return '';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      default: return 'rounded-lg';
    }
  };

  const classes = [
    'bg-white',
    getPaddingClass(padding),
    getShadowClass(shadow),
    getRoundedClass(rounded),
    border ? 'border border-gray-200' : '',
    hover ? 'transition-shadow duration-200 hover:shadow-lg' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;
