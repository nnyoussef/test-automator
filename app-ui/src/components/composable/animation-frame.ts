import { onUnmounted } from 'vue';

export function useRequestAnimationFrame(callback: FrameRequestCallback): () => void {
    const rafId = requestAnimationFrame(callback);
    onUnmounted(() => cancelAnimationFrame(rafId));
    return () => cancelAnimationFrame(rafId);
}
