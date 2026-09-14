import { formatEnum } from "../lib/helpers";

// Coloured pill for any status enum (PENDING, APPROVED, ACTIVE, ...).
// The colour for each value is defined in App.css as .badge-<VALUE>.
function StatusBadge({ value }) {
  return <span className={`badge badge-${value}`}>{formatEnum(value)}</span>;
}

export default StatusBadge;
