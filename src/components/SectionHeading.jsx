import { motion } from 'framer-motion';

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="mb-10 max-w-2xl"
    >
      <p className="theme-accent mb-3 text-sm font-semibold uppercase tracking-[0.28em]">{eyebrow}</p>
      <h2 className="heading-gradient font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {description ? <p className="theme-muted mt-4 text-base leading-7">{description}</p> : null}
    </motion.div>
  );
}
