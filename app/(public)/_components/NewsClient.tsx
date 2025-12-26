'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <section className="w-full bg-[#ec1313] py-16 px-4">
      <div className="max-w-[1280px] mx-auto bg-white/10 backdrop-blur-sm rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/20">
        <div className="flex flex-col gap-4 text-center lg:text-left max-w-xl">
          <h2 className="text-white text-3xl font-bold">Stay Updated on Camps</h2>
          <p className="text-red-100 text-lg">
            Get notified about urgent blood needs and upcoming donation camps in your area. No spam, we promise.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 min-w-[300px] lg:min-w-[450px]"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 bg-white border-none rounded-xl px-5 py-4 text-base focus:ring-2 focus:ring-red-900 text-[#181111] placeholder-neutral-500 shadow-lg"
            required
          />
          <button
            type="submit"
            className="bg-neutral-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-neutral-800 transition-colors shadow-lg whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}