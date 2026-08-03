import { NominatimResult, searchAddress } from "@/lib/nominatim/searchAddress";
import { useEffect, useState } from "react";

export function useAddressSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchAddress(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return { query, setQuery, results, isLoading, setResults };
}
