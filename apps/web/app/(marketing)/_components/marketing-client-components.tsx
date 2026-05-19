'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Globe, Shield } from 'lucide-react';

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  }
};

export const FeaturesSection = () => {
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInScale}
      className="py-24 bg-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-16 rounded-[3rem] border border-border bg-gradient-to-b from-muted/30 to-background flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '60px 100%' }} />
          
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-16 relative z-10 tracking-tighter uppercase max-w-2xl">
            Trusted by candidates <span className="text-primary">Worldwide</span>
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700 relative z-10">
            {[Zap, Globe, Shield, CheckCircle2].map((Icon, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.1, opacity: 1, grayscale: 0 }}
                className="flex items-center gap-3"
              >
                <Icon className="w-8 h-8 text-primary" />
                <span className="text-2xl font-black tracking-tighter uppercase italic">
                  {["SPEEDPREP", "GLOBALPATH", "SECURECORE", "EXAMTRUST"][idx]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export const StatsSection = () => {
  const stats = [
    { label: "Active Students", value: "50,000+" },
    { label: "Success Rate", value: "94%" },
    { label: "Practice Tests", value: "1,200+" },
    { label: "Expert Tutors", value: "150+" },
  ];

  return (
    <section className="py-32 bg-foreground text-background relative overflow-hidden">
      {/* Decorative slant */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 text-center">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <span className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">{stat.value}</span>
              <span className="opacity-50 font-black uppercase tracking-[0.2em] text-[10px]">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TestimonialsSection = () => {
  const reviews = [
    {
      name: "Sarah Jenkins",
      role: "Band 8.5 Student",
      quote: "The simulation tests are incredibly accurate. I felt so much more confident on my actual exam day."
    },
    {
      name: "Ahmed Raza",
      role: "Band 7.5 Student",
      quote: "Best platform for IELTS prep. The writing feedback was exactly what I needed to improve."
    },
    {
      name: "Lin Wei",
      role: "Band 8.0 Student",
      quote: "Clean, fast, and very professional. The interface makes studying feel less like a chore."
    }
  ];

  return (
    <section className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">Success Stories</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase">
            Loved by students <br /> globally.
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {reviews.map((review, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              whileHover={{ y: -15 }}
              className="p-10 rounded-[2.5rem] bg-muted/20 border border-border/50 backdrop-blur-sm transition-all hover:bg-muted/40 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
            >
              <div className="mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-primary text-lg">★</span>
                ))}
              </div>
              <p className="text-xl text-muted-foreground font-medium italic mb-10 leading-relaxed tracking-tight">
                "{review.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-foreground tracking-tight uppercase text-sm">{review.name}</h4>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
