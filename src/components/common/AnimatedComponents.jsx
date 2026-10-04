import { motion } from 'framer-motion';

// Reusable animation variants
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Animated page wrapper
export function PageMotion({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

// Animated item
export function FadeUpItem({ children, delay = 0, className = '', style = {} }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Stagger children
export function StaggerGrid({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

// Animated card
export function AnimCard({ children, className = 'card', delay = 0, onClick }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 12px 48px rgba(47,125,50,0.18)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </motion.div>
  );
}

// Count-up number
import { useEffect, useRef, useState } from 'react';
export function CountUp({ target, duration = 2, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

// Spinner button
export function SpinnerBtn({ loading, success, onClick, children, className = 'btn btn-primary', ...props }) {
  return (
    <button className={className} onClick={onClick} disabled={loading} {...props}>
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
        />
      ) : success ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
          ✓
        </motion.span>
      ) : children}
    </button>
  );
}

// Skeleton loaders
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180, borderRadius: '16px 16px 0 0' }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 18, borderRadius: 8, width: '70%' }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 8, width: '50%' }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 8, width: '80%' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div className="skeleton" style={{ height: 36, flex: 1, borderRadius: 99 }} />
          <div className="skeleton" style={{ height: 36, flex: 1, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}

// Star Rating display
export function StarRating({ rating, size = 16 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`star ${s <= Math.round(rating) ? 'filled' : ''}`} style={{ fontSize: size }}>★</span>
      ))}
    </div>
  );
}

// Progress Steps
export function StepProgress({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
          <motion.div
            className={`step-node ${i < current ? 'done' : i === current ? 'active' : ''}`}
            animate={{ background: i <= current ? 'var(--green-primary)' : 'var(--border)', color: i <= current ? '#fff' : 'var(--text-muted)' }}
            title={step}
          >
            {i < current ? '✓' : i + 1}
          </motion.div>
          {i < steps.length - 1 && (
            <div className={`step-connector ${i < current ? 'done' : ''}`} style={{ transition: 'background 0.5s' }} />
          )}
        </div>
      ))}
    </div>
  );
}
