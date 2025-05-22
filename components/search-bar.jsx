"use client"

import { Input } from "@/components/ui/input"
import { SearchIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search notes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-6 w-6" onClick={() => onChange("")}>
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
