export default function HowItWorks() {
  const steps = [
    { icon: '📝', title: '1. Register', description: 'Sign up on our platform and fill in your basic health details.' },
    { icon: '📍', title: '2. Find Camps', description: 'Locate nearby blood donation camps or drives on our map.' },
    { icon: '🩸', title: '3. Donate', description: 'Visit the camp at the scheduled time and donate blood safely.' },
    { icon: '❤️', title: '4. Save Lives', description: 'Your blood is processed and sent to patients in need.' },
  ];

  return (
    <section className="w-full max-w-[1280px] px-4 sm:px-10 py-20">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
          <span className="text-[#ec1313] font-bold tracking-wider uppercase text-sm">Simple Process</span>
          <h2 className="text-[#181111] dark:text-white text-3xl sm:text-4xl font-black">How It Works</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Becoming a life-saver is easier than you think. Just follow these simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-10" />
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-4 group">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-neutral-900 border-4 border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform z-10">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-[#181111] dark:text-white">{step.title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed px-4">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}