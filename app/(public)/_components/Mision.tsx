export default function Mission() {
  const stats = [
    { icon: '💧', label: 'Units Donated', value: '12,500+' },
    { icon: '👥', label: 'Donors Registered', value: '5,000+' },
    { icon: '❤️', label: 'Lives Saved', value: '37,500+' },
  ];

  return (
    <section className="w-full bg-white dark:bg-neutral-900 border-y border-neutral-100 dark:border-neutral-800 py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3 flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-[#181111] dark:text-white">Our Mission</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              At Raktosewa, we bridge the gap between donors and patients. Our goal is to create a seamless network where finding blood is never a struggle. We believe that every drop counts and together we can build a healthier, safer community.
            </p>
            <a
              href="#"
              className="text-[#ec1313] font-bold flex items-center gap-1 hover:underline mt-2 w-fit"
            >
              Learn more about us →
            </a>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6 flex flex-col items-center text-center gap-2 border border-neutral-100 dark:border-neutral-700"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <p className="text-3xl font-black text-[#181111] dark:text-white">{stat.value}</p>
                <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}