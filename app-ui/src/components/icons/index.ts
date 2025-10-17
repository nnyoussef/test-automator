import type { TextOrNumber } from '@/common/types.ts';

export interface IconContainerProps {
    icon: string;
    fill?: string;
    size?: string;
    className?: string | [];
    label?: string;
    role?: string;
    value?: TextOrNumber;
}
