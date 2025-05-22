"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { AlertCircleIcon, ClockIcon, WifiOffIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ApiTestControls({ onSimulateError, onSimulateDelay, onToggleOffline }) {
  const [isOpen, setIsOpen] = useState(false)
  const [errorRate, setErrorRate] = useState(20) // 20% error rate by default
  const [delayMs, setDelayMs] = useState(1000) // 1000ms delay by default
  const [forceOffline, setForceOffline] = useState(false)

  const handleErrorRateChange = (value) => {
    setErrorRate(value[0])
  }

  const handleDelayChange = (value) => {
    setDelayMs(value[0])
  }

  const handleToggleOffline = (checked) => {
    setForceOffline(checked)
    onToggleOffline(checked)
  }

  const handleSimulateError = () => {
    onSimulateError(errorRate)
    setIsOpen(false)
  }

  const handleSimulateDelay = () => {
    onSimulateDelay(delayMs)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <AlertCircleIcon size={16} />
                API Test Controls
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Simulate API errors and delays</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Test Controls</DialogTitle>
          <DialogDescription>Simulate different API behaviors to test your app's resilience.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <AlertCircleIcon size={16} className="text-red-500" />
              Error Simulation
            </h3>
            <div className="grid grid-cols-[1fr_80px] items-center gap-4">
              <div>
                <Slider value={[errorRate]} min={0} max={100} step={5} onValueChange={handleErrorRateChange} />
              </div>
              <div className="text-right">{errorRate}% errors</div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleSimulateError}>
              Simulate Errors
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium flex items-center gap-2">
              <ClockIcon size={16} className="text-amber-500" />
              Network Delay
            </h3>
            <div className="grid grid-cols-[1fr_80px] items-center gap-4">
              <div>
                <Slider value={[delayMs]} min={0} max={5000} step={100} onValueChange={handleDelayChange} />
              </div>
              <div className="text-right">{delayMs}ms</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSimulateDelay}>
              Simulate Delay
            </Button>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <div className="flex-1">
              <h3 className="font-medium flex items-center gap-2">
                <WifiOffIcon size={16} className="text-blue-500" />
                Force Offline Mode
              </h3>
              <p className="text-sm text-muted-foreground">Simulate offline behavior regardless of actual connection</p>
            </div>
            <Switch id="force-offline" checked={forceOffline} onCheckedChange={handleToggleOffline} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
