declare module '*.vue' {
    import type { ComponentOptions } from 'vue';
    const Component: ComponentOptions;
    export default Component;
}

declare module '*.md' {
    import type { ComponentOptions } from 'vue';
    const Component: ComponentOptions;
    export default Component;
}

type FlowVisOptions = {
    enabled?: boolean; // Enable/disable monitoring (default: true)
    logger?: 'console' | 'ui' | 'none'; // Logger type (default: 'ui')
    excludeComponents?: string[]; // Components to exclude from monitoring
    includeComponents?: string[]; // Only monitor these components (overrides exclude)
    logToTable?: boolean; // Use console.table for output (default: false)
    batchLogs?: boolean; // Group console logs by component (default: true)
    batchWindow?: number; // Delay in ms before flushing batched logs (default: 500)
    onRenderTracked?: (data: RenderEventData) => void; // Custom callback for tracked events
    onRenderTriggered?: (data: RenderEventData) => void; // Custom callback for triggered events
    customLogger?: Logger; // Custom logger implementation (overrides logger option)
};
