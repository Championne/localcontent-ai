
"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Keyword {
  value: string;
  label: string;
  searchVolume?: number; 
}

interface KeywordSelectorProps {
  initialKeywords?: Keyword[];
  onKeywordsChange?: (keywords: Keyword[]) => void;
}

export function KeywordSelector({
  initialKeywords = [],
  onKeywordsChange,
}: KeywordSelectorProps) {
  const LOCAL_STORAGE_KEY = "localcontent_ai_keywords";
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  // Effect to load keywords from localStorage on mount
  React.useEffect(() => {
    try {
      const savedKeywords = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedKeywords) {
        setKeywords(JSON.parse(savedKeywords));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else if (initialKeywords.length > 0) {
        // If nothing in localStorage, use initialKeywords if provided
        setKeywords(initialKeywords);
        setSaveStatus("saved"); // Consider initial load as saved
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (e) {
      console.error("Failed to load keywords from localStorage:", e);
      setSaveStatus("error");
    }
  }, []); // Run only on mount

  // Effect to save keywords to localStorage whenever they change, and handle beforeunload
  React.useEffect(() => {
    if (keywords.length === 0 && initialKeywords.length === 0) return; // Don't save empty if nothing was ever there

    let saveTimeout: NodeJS.Timeout;

    const saveKeywordsToLocalStorage = (currentKeywords: Keyword[]) => {
      setSaveStatus("saving");
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentKeywords));
        setSaveStatus("saved");
        saveTimeout = setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        console.error("Failed to save keywords to localStorage:", e);
        setSaveStatus("error");
      }
    };

    saveKeywordsToLocalStorage(keywords); // Save on keyword change

    // Handle beforeunload for navigation persistence
    const handleBeforeUnload = () => {
      // Ensure the latest keywords are saved right before unload
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keywords));
      } catch (e) {
        console.error("Failed to save keywords on beforeunload:", e);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(saveTimeout);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [keywords, initialKeywords]);
  const LOCAL_STORAGE_KEY = "localcontent_ai_keywords";
  const [keywords, setKeywords] = React.useState<Keyword[]>([]);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  // Effect to load keywords from localStorage on mount
  React.useEffect(() => {
    try {
      const savedKeywords = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedKeywords) {
        setKeywords(JSON.parse(savedKeywords));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else if (initialKeywords.length > 0) {
        // If nothing in localStorage, use initialKeywords if provided
        setKeywords(initialKeywords);
        setSaveStatus("saved"); // Consider initial load as saved
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch (e) {
      console.error("Failed to load keywords from localStorage:", e);
      setSaveStatus("error");
    }
  }, []); // Run only on mount

  // Effect to save keywords to localStorage whenever they change, and handle beforeunload
  React.useEffect(() => {
    if (keywords.length === 0 && initialKeywords.length === 0) return; // Don't save empty if nothing was ever there

    let saveTimeout: NodeJS.Timeout;

    const saveKeywordsToLocalStorage = (currentKeywords: Keyword[]) => {
      setSaveStatus("saving");
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentKeywords));
        setSaveStatus("saved");
        saveTimeout = setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        console.error("Failed to save keywords to localStorage:", e);
        setSaveStatus("error");
      }
    };

    saveKeywordsToLocalStorage(keywords); // Save on keyword change

    // Handle beforeunload for navigation persistence
    const handleBeforeUnload = () => {
      // Ensure the latest keywords are saved right before unload
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(keywords));
      } catch (e) {
        console.error("Failed to save keywords on beforeunload:", e);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(saveTimeout);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [keywords, initialKeywords]);
  const [inputValue, setInputValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Keyword[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filterText, setFilterText] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("alphabetical-asc");

  React.useEffect(() => {
    if (inputValue.length > 2) { // Fetch suggestions after 2 characters
      setLoading(true);
      setError(null);
      const fetchSuggestions = async () => {
        try {
          const response = await fetch("/api/keyword-suggestions");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: Keyword[] = await response.json();
          // Simulate search volume for demonstration
          const suggestionsWithVolume = data.map(item => ({
            ...item,
            searchVolume: Math.floor(Math.random() * 10000)
          }))
          setSuggestions(suggestionsWithVolume.filter(
            (s) =>
              s.label.toLowerCase().includes(inputValue.toLowerCase()) &&
              !keywords.some((k) => k.value === s.value)
          ));
        } catch (err) {
            setError("Failed to fetch suggestions.");
            console.error(err);
        } finally {
            setLoading(false);
        }
      };
      const debounceTimer = setTimeout(fetchSuggestions, 300); // Debounce API calls
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, keywords]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      const newKeyword: Keyword = {
        value: inputValue.trim().toLowerCase(),
        label: inputValue.trim(),
      };
      if (!keywords.some((k) => k.value === newKeyword.value)) {
        setKeywords((prev) => {
          const updatedKeywords = [...prev, newKeyword];
          onKeywordsChange?.(updatedKeywords);
          return updatedKeywords;
        });
      }
      setInputValue("");
      setSuggestions([]);
    }
  };

  const handleRemoveKeyword = (keywordToRemove: Keyword) => {
    setKeywords((prev) => {
      const updatedKeywords = prev.filter(
        (keyword) => keyword.value !== keywordToRemove.value
      );
      onKeywordsChange?.(updatedKeywords);
      return updatedKeywords;
    });
  };

  const handleSelectSuggestion = (suggestion: Keyword) => {
    if (!keywords.some((k) => k.value === suggestion.value)) {
      setKeywords((prev) => {
        const updatedKeywords = [...prev, suggestion];
        onKeywordsChange?.(updatedKeywords);
        return updatedKeywords;
      });
    }
    setInputValue("");
    setSuggestions([]);
  };

  const filteredAndSortedSuggestions = React.useMemo(() => {
    let currentSuggestions = suggestions;

    // Apply filter
    if (filterText) {
      currentSuggestions = currentSuggestions.filter((s) =>
        s.label.toLowerCase().includes(filterText.toLowerCase())
      );
    }

    // Apply sort
    // The sort method modifies the array in place, so we should create a copy if we don't
    // want to mutate the original `suggestions` array.
    const sortableSuggestions = [...currentSuggestions]; 
    sortableSuggestions.sort((a, b) => {
      switch (sortOrder) {
        case "alphabetical-asc":
          return a.label.localeCompare(b.label);
        case "alphabetical-desc":
          return b.label.localeCompare(a.label);
        case "searchVolume-asc":
          return (a.searchVolume === undefined ? -Infinity : a.searchVolume) - (b.searchVolume === undefined ? -Infinity : b.searchVolume);
        case "searchVolume-desc":
          return (b.searchVolume === undefined ? -Infinity : b.searchVolume) - (a.searchVolume === undefined ? -Infinity : a.searchVolume);
        default:
          return 0;
      }
    });

    return sortableSuggestions;
  }, [suggestions, filterText, sortOrder]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 bg-muted p-3 rounded-lg">
        <div className="flex-1">
          <Label htmlFor="keyword-filter" className="text-xs text-muted-foreground">Filter suggestions</Label>
          <Input
            id="keyword-filter"
            type="text"
            placeholder="Filter suggestions..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full text-sm h-9"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Label htmlFor="sort-order" className="text-xs text-muted-foreground">Sort by</Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger id="sort-order" className="h-9 text-sm">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical-asc">Alphabetical (A-Z)</SelectItem>
              <SelectItem value="alphabetical-desc">Alphabetical (Z-A)</SelectItem>
              <SelectItem value="searchVolume-desc">Search Volume (High to Low)</SelectItem>
              <SelectItem value="searchVolume-asc">Search Volume (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background p-2 min-h-[40px]">
        {keywords.map((keyword) => (
          <Badge key={keyword.value} variant="secondary">
            {keyword.label}
            <button
              type="button"
              className="ml-1 shrink-0 rounded-full bg-primary/20 p-0.5 text-primary-foreground hover:bg-primary/30"
              onClick={() => handleRemoveKeyword(keyword)}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          placeholder="Add keywords..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="flex-grow border-none focus-visible:ring-0 shadow-none p-0 h-auto"
        />
        {saveStatus === "saving" && (
          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">Saving...</Badge>
        )}
        {saveStatus === "saved" && (
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Saved!</Badge>
        )}
        {saveStatus === "error" && (
          <Badge variant="destructive" className="ml-2">Save Error!</Badge>
        )}
        {saveStatus === "saving" && (
          <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">Saving...</Badge>
        )}
        {saveStatus === "saved" && (
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Saved!</Badge>
        )}
        {saveStatus === "error" && (
          <Badge variant="destructive" className="ml-2">Save Error!</Badge>
        )}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading suggestions...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {filteredAndSortedSuggestions.length > 0 && !loading && (
        <div className="border rounded-md p-2 max-h-[150px] overflow-y-auto">
          {filteredAndSortedSuggestions.map((suggestion) => (
            <Button
              key={suggestion.value}
              variant="ghost"
              className="w-full justify-start flex justify-between items-center h-9 px-3 text-sm"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <span>{suggestion.label}</span>
              {suggestion.searchVolume !== undefined && (
                <span className="text-muted-foreground text-xs">Vol: {suggestion.searchVolume.toLocaleString()}</span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
