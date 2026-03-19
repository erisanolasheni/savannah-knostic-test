let requestCount = 0;
let requestDurationsMs: number[] = [];
const MAX_DURATIONS = 1000;

export function incrementRequestCount(): void {
    requestCount++;
}

export function recordRequestDurationMs(ms: number): void {
    requestDurationsMs.push(ms);
    if (requestDurationsMs.length > MAX_DURATIONS) {
        requestDurationsMs.shift();
    }
}

export function getRequestCount(): number {
    return requestCount;
}

export function getRequestDurationsMs(): number[] {
    return [...requestDurationsMs];
}

export function getMetricsSnapshot(): { requestCount: number; recentDurationsMs: number[] } {
    return {
        requestCount,
        recentDurationsMs: getRequestDurationsMs(),
    };
}

export function formatPrometheus(): string {
    const avg =
        requestDurationsMs.length > 0
            ? requestDurationsMs.reduce((a, b) => a + b, 0) / requestDurationsMs.length
            : 0;
    const lines = [
        '# HELP http_requests_total Total HTTP requests.',
        '# TYPE http_requests_total counter',
        `http_requests_total ${requestCount}`,
        '# HELP http_request_duration_seconds_avg Average request duration in seconds.',
        '# TYPE http_request_duration_seconds_avg gauge',
        `http_request_duration_seconds_avg ${(avg / 1000).toFixed(6)}`,
    ];
    return lines.join('\n') + '\n';
}
