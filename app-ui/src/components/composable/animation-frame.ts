import { onUnmounted } from 'vue';

export function useRequestAnimationFrame(callback: FrameRequestCallback): () => void {
    const id = requestAnimationFrame(callback);
    onUnmounted(() => cancelAnimationFrame(id));
    return () => cancelAnimationFrame(id);
}
