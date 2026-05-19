"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const IELTSHero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative pt-20 pb-24 overflow-hidden bg-background">
      {/* Premium Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.15] dark:opacity-[0.07]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8 max-w-2xl flex-1"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next-Gen IELTS Prep
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.85] uppercase"
            >
              Master your <br />
              <span className="text-primary italic">IELTS</span> journey.
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground max-w-lg font-medium leading-relaxed tracking-tight"
            >
              The most advanced simulation platform for serious candidates. Experience the real exam environment before you take it.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start gap-4 pt-4 w-full">
              <div className="flex justify-center lg:justify-start w-full">
                <motion.div
                  animate={{ 
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Link 
                    href="/auth/sign-up" 
                    className="relative group bg-foreground text-background px-10 py-5 rounded-full text-lg font-black hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-3 shadow-2xl shadow-primary/20 overflow-hidden"
                  >
                    {/* Premium Shine Effect */}
                    <motion.span 
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                    />
                    
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:block flex-1 relative"
          >
            {/* Glassmorphic Result Card */}
            <div className="relative z-10 p-12 rounded-[2rem] bg-background/40 backdrop-blur-3xl border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Global Candidate Insights</span>
                  <span className="text-2xl font-black text-foreground">Listening Module Performance</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-black shadow-xl shadow-primary/20">
                  8.5
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: "Accuracy", value: "92%", width: "92%" },
                  { label: "Speed", value: "Fast", width: "85%" },
                  { label: "Confidence", value: "High", width: "95%" },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>{stat.label}</span>
                      <span>{stat.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: stat.width }}
                        transition={{ duration: 1.5, delay: 1 + i * 0.2 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -inset-10 bg-primary/20 blur-[100px] -z-10 rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
