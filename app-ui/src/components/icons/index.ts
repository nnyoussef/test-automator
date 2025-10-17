import type { CommonComponentAttribute } from '@/common/types.ts';

export interface IconContainerProps extends CommonComponentAttribute {
    icon: string;
    fill?: string;
    size?: string;
    className?: string | [];
    height?: string;
}
