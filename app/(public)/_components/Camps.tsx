export default function UpcomingCamps() {
  const camps = [
    {
      name: 'Community Drive',
      location: 'Nepal Youth Foundation',
      distance: '2.5 km away',
      date: { month: 'OCT', day: '24' },
      time: '10:00 AM - 4:00 PM',
      address: 'Kathmandu, Nepal',
      image: '/images/nepalyouthfoundation.png',
    },
    {
      name: 'Blood Donation Camp',
      location: 'Red Cross Society Nepal',
      distance: '5.0 km away',
      date: { month: 'NOV', day: '02' },
      time: '09:00 AM - 3:00 PM',
      address: 'Kathmandu, Nepal',
      image: '/images/redcross.png',
    },
    {
      name: 'Hamro Life Bank Camp',
      location: 'Hamro Life Bank',
      distance: '8.2 km away',
      date: { month: 'NOV', day: '15' },
      time: '11:00 AM - 5:00 PM',
      address: 'Kupondole, Lalitpur',
      image: '/images/hmarolife.jpg',
    },
  ];

  return (
    <section className="w-full bg-neutral-50 dark:bg-neutral-900/50 py-20 border-y border-neutral-100 dark:border-neutral-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-[#181111] dark:text-white text-3xl font-bold">Upcoming Blood Donation Camps</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Join a camp near you and make a difference.</p>
          </div>
          <a className="hidden sm:flex text-[#ec1313] font-bold items-center gap-1 hover:underline">
            See All Camps →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-200 dark:border-neutral-700 group flex flex-col"
            >
              <div
                className="h-48 bg-cover bg-center relative"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${camp.image}')`,
                }}
              >
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <span className="bg-white/90 text-black text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    📍 {camp.distance}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-[#181111] dark:text-white group-hover:text-[#ec1313]">
                      {camp.name}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{camp.location}</p>
                  </div>
                  <div className="text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-2 min-w-[60px]">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">{camp.date.month}</p>
                    <p className="text-xl font-bold text-[#181111] dark:text-white">{camp.date.day}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <span>🕐</span>
                    <span>{camp.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <span>📍</span>
                    <span>{camp.address}</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2.5 rounded-lg bg-[#ec1313] text-white font-bold hover:bg-red-700 transition-colors shadow-sm">
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
