import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function EmergencyBanner() {
  const [show, setShow] = useState(true);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-destructive/30 bg-gradient-to-r from-destructive/15 via-destructive/10 to-warning/10"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 lg:px-6">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs sm:text-sm">
              <span className="font-semibold text-destructive">CRITICAL ALERT</span>
              <span className="text-foreground/80"> · Rail fracture detected on Northern Corridor KM 847.2 · Maintenance crew dispatched</span>
            </p>
            <button
              onClick={() => setShow(false)}
              className="ml-auto rounded-md p-1 hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
