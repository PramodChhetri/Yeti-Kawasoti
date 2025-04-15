import { useState, ReactNode } from 'react';
import { Button } from '@/Components/ui/button';
import clsx from 'clsx';

interface SegmentedControlItem {
    label: string;
    value: string;
    startAdornment?: ReactNode;
}

interface SegmentedControlProps {
    items: SegmentedControlItem[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function SegmentedControl({ items, value, onChange, className }: SegmentedControlProps) {
    return (
        <div className={clsx("inline-flex rounded-md border border-muted bg-muted p-1 overflow-hidden w-full", className)}>
            {items.map((item, index) => (
                <Button
                    key={item.value}
                    variant={value === item.value ? 'default' : 'ghost'}
                    size={'sm'}
                    className={clsx(
                        "px-4 py-2 text-sm font-medium flex items-center space-x-2 grow",
                        value === item.value && "shadow"
                    )}
                    onClick={() => onChange(item.value)}
                >
                    {item.startAdornment && <span className="mr-2">{item.startAdornment}</span>}
                    <span>{item.label}</span>
                </Button>
            ))}
        </div>
    );
}
