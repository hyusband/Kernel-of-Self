"use client";

import { motion } from "framer-motion";

export const Hero = () => {
    return (
        <div className="h-[40rem] w-full flex md:items-center justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
            <div className="p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
                <motion.h1
                    initial={{ opacity: 0.5, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 font-heading tracking-tight"
                >
                    Synchronize<br /> your Mind & Body.
                </motion.h1>
                <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
                    The Kernel of Self is a digital nervous system designed to optimize your resilience.
                    Log your state. Receiving philosophical patches. Iterate.
                </p>
            </div>
        </div>
    );
};
