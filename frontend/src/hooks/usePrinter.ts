import { useQuery } from "@tanstack/react-query";
interface PrinterStatus {
  queueLength: number;
  isPrinting: boolean;
}
export default function usePrinter() {
  const { data, isLoading, error } = useQuery<PrinterStatus>({
    queryKey: ["printStatus"],
    queryFn: async () => {
      const response = await fetch("/api/queue");
      return response.json();
    },
    refetchInterval: 1000,
  });

  return { printStatus: data, isLoading, error };
}
