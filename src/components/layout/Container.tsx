import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Khung giới hạn chiều rộng chuẩn toàn sàn (max-w-7xl).
 * Chủ sở hữu: TV4 (UI/UX Lead).
 */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}
