"use client";

import { motion } from "framer-motion";
import Markdown from "react-markdown";

export default function MuseumAbout({
  description,
}: {
  description?: string | null;
}) {
  if (!description) return null;

  const paragraphs = description.split(/\r?\n/).filter(Boolean);

  return (
    <section className="bg-background py-20 px-4 md:px-8 lg:px-20">
      <div className="max-w-3xl mx-auto space-y-4">
        {paragraphs.map((text, i) => (
          <motion.div
            key={i}
            className="relative pl-4 border-l-4 border-gradient-to-b from-pink-400 via-purple-400 to-indigo-400"
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.2 * i, duration: 0.6, type: "spring" }}
            viewport={{ once: true }}
          >
            <div className="prose prose-sm md:prose-base text-muted-foreground leading-relaxed">
              <Markdown>{text}</Markdown>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
