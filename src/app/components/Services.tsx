"use client";

import { useEffect, useState } from "react";
import { LuMonitor, LuChevronDown } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";

import type { BatchLevelItem, ServicesContent } from "@/constants/servicesContent";
import { defaultServicesContent } from "@/constants/servicesContent";

interface ServicesProps {
  initialContent?: ServicesContent;
}

export default function Services({ initialContent }: ServicesProps = {}) {
  const [servicesContent, setServicesContent] = useState<ServicesContent>(
    initialContent || defaultServicesContent
  );

  const [activeBatch, setActiveBatch] = useState<"online" | "offline">(
    initialContent?.batchSection?.defaultActiveTab || defaultServicesContent.batchSection?.defaultActiveTab || "online"
  );

  useEffect(() => {
    if (!initialContent) {
      fetch("/api/website-content")
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.services) {
            setServicesContent(data.data.services);
          }
        });
    }
  }, [initialContent]);

  const batchSection = servicesContent.batchSection || defaultServicesContent.batchSection!;
  const onlineLevels = batchSection.onlineLevels?.length
    ? batchSection.onlineLevels
    : defaultServicesContent.batchSection?.onlineLevels || [];
  const offlineLevels = batchSection.offlineLevels?.length
    ? batchSection.offlineLevels
    : defaultServicesContent.batchSection?.offlineLevels || [];

  useEffect(() => {
    setActiveBatch(batchSection.defaultActiveTab || "online");
  }, [batchSection.defaultActiveTab]);

  return (
    <section className="bg-white py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {servicesContent.title.part1} {servicesContent.title.part2}
          </h2>
        </div>

        <div className="mt-20 space-y-8">
          {/* ================= ONLINE BATCH ================= */}
          <div>
            <button
              onClick={() => setActiveBatch("online")} // সরাসরি সেট করা হচ্ছে
              className="relative mb-4 w-full group transition-all"
            >
              <div className="h-px w-full bg-gray-300" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold shadow-md border transition-all duration-300 ${
                  activeBatch === "online" 
                  ? "bg-[#0B4B6A] text-white border-[#0B4B6A]" 
                  : "bg-white text-[#0B4B6A] border-gray-100 hover:bg-gray-50"
                }`}>
                  {batchSection.onlineButtonLabel}
                  <motion.div
                    animate={{ rotate: activeBatch === "online" ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LuChevronDown size={18} />
                  </motion.div>
                </span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {activeBatch === "online" && (
                <motion.div
                  key="online-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-2xl bg-gradient-to-r px-6 py-12 my-6"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${batchSection.onlineBackground.from}, ${batchSection.onlineBackground.via}, ${batchSection.onlineBackground.to})`,
                    }}
                  >
                    <div className="flex flex-wrap justify-center gap-6">
                      {onlineLevels.map((item) => (
                        <BatchCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ================= OFFLINE BATCH ================= */}
          <div>
            <button
              onClick={() => setActiveBatch("offline")} // সরাসরি সেট করা হচ্ছে
              className="relative mb-4 w-full group transition-all"
            >
              <div className="h-px w-full bg-gray-300" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className={`inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold shadow-md border transition-all duration-300 ${
                  activeBatch === "offline" 
                  ? "bg-[#0B4B6A] text-white border-[#0B4B6A]" 
                  : "bg-white text-[#0B4B6A] border-gray-100 hover:bg-gray-50"
                }`}>
                  {batchSection.offlineButtonLabel}
                  <motion.div
                    animate={{ rotate: activeBatch === "offline" ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LuChevronDown size={18} />
                  </motion.div>
                </span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {activeBatch === "offline" && (
                <motion.div
                  key="offline-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-2xl bg-gradient-to-r px-6 py-12 my-6"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${batchSection.offlineBackground.from}, ${batchSection.offlineBackground.via}, ${batchSection.offlineBackground.to})`,
                    }}
                  >
                    <div className="flex flex-wrap justify-center gap-6">
                      {offlineLevels.map((item) => (
                        <BatchCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function BatchCard({ item }: { item: BatchLevelItem }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="w-[130px] rounded-xl bg-white p-5 text-center shadow-lg border border-transparent"
    >
      <div
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md border-2"
        style={{ borderColor: item.color }}
      >
        <LuMonitor size={22} style={{ color: item.color }} />
      </div>
      <h4 className="text-xl font-extrabold" style={{ color: item.color }}>
        {item.label}
      </h4>
      <p className="mt-1 text-[10px] leading-tight font-semibold" style={{ color: item.color }}>
        {item.subtitle}
      </p>
    </motion.div>
  );
}
