package fr.nnyoussef.server;

import java.nio.channels.Selector;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class EpollSimulation {

    private static final int CONNECTION_COUNT = 1_000_000;
    private static final int EVENT_COUNT = 10_000; // How many will become ready

    // Ready-state tracking
    private final BitSet ready = new BitSet(CONNECTION_COUNT);
    private final ConcurrentLinkedQueue<Integer> readyQueue = new ConcurrentLinkedQueue<>();

    // Simulate marking connections ready (like kernel interrupt)
    public void markReady(int connectionId) {
        if (!ready.get(connectionId)) {
            ready.set(connectionId);
            readyQueue.offer(connectionId);
        }
    }

    // Simulate epoll_wait: returns only ready ones
    public List<Integer> pollReady() {
        List<Integer> readyList = new LinkedList<>();
        Integer id;
        while ((id = readyQueue.poll()) != null) {
            ready.clear(id);
            readyList.add(id);
        }
        return readyList;
    }

    public static void main(String[] args) throws InterruptedException {
        EpollSimulation epoll = new EpollSimulation();

        // Thread simulating readiness events (like network packets)
        ExecutorService producer = Executors.newSingleThreadExecutor();
        producer.submit(() -> {
            Random random = new Random();
            for (int i = 0; i < EVENT_COUNT; i++) {
                int connId = random.nextInt(CONNECTION_COUNT);
                epoll.markReady(connId);
                try {
                    Thread.sleep(50); // simulate random arrival
                } catch (InterruptedException ignored) {
                }
            }
        });
        // Thread simulating epoll_wait() calls
        ExecutorService consumer = Executors.newSingleThreadExecutor();
        consumer.submit(() -> {
            for (int i = 0; i < 50; i++) {
                long start = System.nanoTime();
                List<Integer> readyNow = epoll.pollReady();
                long durationMicros = (System.nanoTime() - start) / 1000;

                if (!readyNow.isEmpty()) {
                    System.out.printf(
                            "Poll %d: Found %d ready connections in %d µs%n",
                            i, readyNow.size(), durationMicros
                    );
                }

                try {
                    Thread.sleep(1); // emulate polling interval
                } catch (InterruptedException ignored) {
                }
            }
        });

        producer.shutdown();
        consumer.shutdown();
        producer.awaitTermination(3, TimeUnit.SECONDS);
        consumer.awaitTermination(3, TimeUnit.SECONDS);
    }
}
