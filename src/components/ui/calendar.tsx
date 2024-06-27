import * as React from "react"
import {useState} from "react";
import {cn} from "~/lib/utils";
import {Calendar} from "primereact/calendar";
import {type InputProps} from "~/components/ui/input";
import {type Nullable} from "primereact/ts-helpers";

const CalendarInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [date, setDate] = useState<Nullable<Date>>(new Date());
    return (
      <div className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
           ref={ref}>
        <Calendar className="w-full h-full text-white bg-background" value={date} onChange={ e => {setDate(e.value)}} {...props} />
      </div>
    )
  }
)
CalendarInput.displayName = "Calendar"

export {CalendarInput}
