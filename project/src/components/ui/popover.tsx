import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'center';
}

const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}>({
  open: false,
  setOpen: () => {},
  triggerRef: React.createRef(),
});

export function Popover({ children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const { setOpen, triggerRef } = React.useContext(PopoverContext);

  const child = asChild ? React.Children.only(children) : 
    <button type="button">{children}</button>;

  return React.cloneElement(child as React.ReactElement, {
    ref: triggerRef,
    onClick: () => setOpen(prev => !prev),
  });
}

export function PopoverContent({ 
  children, 
  className = '',
  align = 'center'
}: PopoverContentProps) {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && 
          !contentRef.current.contains(event.target as Node) &&
          !triggerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);

  if (!open) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }[align];

  return (
    <div 
      ref={contentRef}
      className={`absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ${alignmentClasses} ${className}`}
    >
      {children}
    </div>
  );
}