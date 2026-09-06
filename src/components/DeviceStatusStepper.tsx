import { Check } from "lucide-react";
import { DEVICE_STATUSES, DEVICE_STATUS_LABELS, type DeviceStatus } from "@/lib/devices";

export default function DeviceStatusStepper({ status }: { status: DeviceStatus }) {
  const currentIndex = DEVICE_STATUSES.indexOf(status);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
      {DEVICE_STATUSES.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === DEVICE_STATUSES.length - 1;

        return (
          <li key={step} className="flex flex-1 sm:flex-col">
            <div className="flex flex-col items-center sm:w-full">
              <div className="flex w-full items-center sm:flex-col">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    isDone
                      ? "border-blue-800 bg-blue-800 text-white"
                      : isCurrent
                        ? "border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-400/40"
                        : "border-slate-200 bg-white text-slate-300"
                  }`}
                >
                  {isDone ? <Check className="h-4.5 w-4.5" /> : index + 1}
                </span>
                {!isLast && (
                  <span
                    className={`mx-2 h-0.5 flex-1 sm:mx-0 sm:mt-4 sm:mb-4 sm:h-0.5 sm:w-full ${
                      isDone ? "bg-blue-800" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
              <p
                className={`mt-2 text-center text-xs font-semibold sm:mt-0 ${
                  isCurrent ? "text-amber-600" : isDone ? "text-blue-800" : "text-slate-400"
                }`}
              >
                {DEVICE_STATUS_LABELS[step]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
