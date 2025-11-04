import React from 'react';

type TableSkeletonProps = {
  rows?: number;
  cols?: number;
};

const TableSkeleton = ({ rows = 5, cols = 4 }: TableSkeletonProps) => {
    return (
        <div className="w-full animate-pulse p-2">
            <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4">
                     {Array.from({ length: cols }).map((_, j) => (
                        <div key={j} className="h-5 bg-slate-200 rounded col-span-1"></div>
                     ))}
                </div>
                 {/* Body */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4 pt-2">
                         {Array.from({ length: cols }).map((_, j) => (
                            <div key={j} className="h-5 bg-slate-200 rounded col-span-1"></div>
                         ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;
