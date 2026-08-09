import { useEffect, useRef } from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

type PageTransitionProps = {
  pageKey: string;
  children: React.ReactNode;
};

export function PageTransition({ pageKey, children }: PageTransitionProps) {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && !reduceMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px" },
      );
    }

    const observeRevealable = () => {
      const revealable = Array.from(root.querySelectorAll<HTMLElement>("section, [data-reveal]"));
      revealable.forEach((element) => {
        element.classList.add("motion-reveal");
        if (reduceMotion || !observer) element.classList.add("is-visible");
        else if (!element.classList.contains("is-visible")) observer.observe(element);
      });
    };

    observeRevealable();
    const mutationObserver = new MutationObserver(observeRevealable);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, []);

  return <div ref={ref} className="contents">{children}</div>;
}

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: index * 0.08, ease: "easeOut" },
  }),
};

export function RevealMotion({
  children,
  className,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      variants={revealVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}