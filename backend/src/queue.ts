type PrintJobFn = () => Promise<unknown> | unknown;

type QueueItem = {
  jobFn: PrintJobFn;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

const queue: QueueItem[] = [];
let printing = false;

export function getPrintStatus(): { queueLength: number; isPrinting: boolean } {
  return { queueLength: queue.length, isPrinting: printing };
}

export function enqueuePrintJob(jobFn: PrintJobFn): Promise<unknown> {
  return new Promise((resolve, reject) => {
    queue.push({ jobFn, resolve, reject });
    void processQueue();
  });
}

async function processQueue(): Promise<void> {
  if (printing) return;
  const item = queue.shift();
  if (!item) return;

  printing = true;
  try {
    const result = await item.jobFn();
    item.resolve(result);
  } catch (e) {
    item.reject(e);
  } finally {
    printing = false;
    setTimeout(processQueue, 50); // tiny delay before next job
  }
}
