import type { ReactNode, SVGProps } from "react";

export type ProgressIconName =
  | "flame"
  | "snowflake"
  | "sparkles"
  | "code"
  | "terminal"
  | "calendar"
  | "target"
  | "trophy"
  | "arrow"
  | "clock"
  | "check";

type ProgressIconProps = SVGProps<SVGSVGElement> & {
  name: ProgressIconName;
};

const iconPaths: Record<ProgressIconName, ReactNode> = {
  flame: (
    <>
      <path d="M12 22c4.4 0 7.5-3 7.5-7.2 0-3.2-1.8-5.1-4.4-8.3-.2 2.2-1.3 3.1-2.1 3.6C12.5 6.2 10 3.8 7.2 2c.4 3.8-.5 5.7-2.4 8.1-1.2 1.5-2.3 2.8-2.3 5.1C2.5 19 6.2 22 12 22Z" />
      <path d="M12 19.2c1.8 0 3.1-1.3 3.1-3.2 0-1.3-.7-2.2-1.8-3.5-.2 1.1-.8 1.7-1.4 2-.3-1.4-1.1-2.2-2-2.9 0 1.8-1.1 2.6-1.1 4.2 0 2 1.3 3.4 3.2 3.4Z" />
    </>
  ),
  snowflake: (
    <>
      <path d="M12 2v20M4 7l16 10M20 7 4 17" />
      <path d="m9 4 3 2 3-2M9 20l3-2 3 2M4 10l.5-3.5L8 6M16 18l3.5-.5L20 14M20 10l-.5-3.5L16 6M8 18l-3.5-.5L4 14" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15ZM5 2l.6 1.9L7.5 4.5l-1.9.6L5 7l-.6-1.9-1.9-.6 1.9-.6L5 2Z" />
    </>
  ),
  code: (
    <>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 7H4v2a4 4 0 0 0 4 4M17 7h3v2a4 4 0 0 1-4 4" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
};

export function ProgressIcon({ name, ...props }: ProgressIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}
