import { CheckIcon, CloudOffIcon, CloudIcon as CloudSyncIcon, AlertCircleIcon } from "lucide-react"

// Simplified version without Tooltip to avoid infinite update loops
export default function SyncStatusIndicator({ status, showLabel = false }) {
  let icon
  let label
  let color

  switch (status) {
    case "synced":
      icon = <CheckIcon size={16} />
      label = "Synced"
      color = "text-green-500"
      break
    case "unsynced":
      icon = <CloudOffIcon size={16} />
      label = "Not synced"
      color = "text-amber-500"
      break
    case "syncing":
      icon = <CloudSyncIcon size={16} className="animate-pulse" />
      label = "Syncing..."
      color = "text-blue-500"
      break
    case "error":
      icon = <AlertCircleIcon size={16} />
      label = "Sync error"
      color = "text-red-500"
      break
    default:
      icon = <CheckIcon size={16} />
      label = "Synced"
      color = "text-green-500"
  }

  return (
    <div className={`flex items-center gap-1 ${color}`} title={label}>
      {icon}
      {showLabel && <span className="text-xs">{label}</span>}
    </div>
  )
}
