"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodSliderProps {
    value: number;
    onChange: (val: number) => void;
}

export const MoodSlider = ({ value, onChange }: MoodSliderProps) => {
    return (
        <div className="w-full relative h-12 bg-neutral-900 rounded-full border border-neutral-800 flex items-center px-1 overflow-hidden">
            {/* Background Segments */}
            <div className="absolute inset-0 flex w-full h-full">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 border-r border-neutral-800/50 last:border-0 h-full"
                        onClick={() => onChange(i + 1)}
                    />
                ))}
            </div>

            {/* Active Indicator */}
            <motion.div
                layout
                className="absolute h-10 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10 flex items-center justify-center font-bold text-black text-lg pointer-events-none"
                initial={false}
                animate={{
                    left: `calc(${((value - 1) / 10) * 100}% + 2px)`,
                    width: `calc(10% - 4px)`
                }}
            >
                {value}
            </motion.div>

            {/* Click Handlers (invisible on top) */}
            <div className="absolute inset-0 flex w-full h-full z-20">
                {Array.from({ length: 10 }).map((_, i) => (
                    <button
                        key={i}
                        className="flex-1 h-full cursor-pointer focus:outline-none"
                        onClick={() => onChange(i + 1)}
                        aria-label={`Set mood to ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
