import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
      <div className="max-w-7xl px-4  mx-auto flex flex-col lg:flex-row items-center sm:px-6 gap-12 lg:px-8">
                {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}

        {/* Left Content */}
        <div className="flex flex-col gap-8 flex-1 text-center lg:text-left items-center lg:items-start">
          <div className="flex flex-col gap-4">
            <span className="text-[#ec1313] font-bold tracking-wider uppercase text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full w-fit mx-auto lg:mx-0 border border-red-100 dark:border-red-900">
              Be a Hero
            </span>
            <h1 className="text-[#181111] dark:text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1]">
              Donate Blood, <br />
              <span className="text-[#ec1313]">Save Lives.</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg sm:text-xl font-normal leading-relaxed max-w-[600px]">
              Your contribution can mean the world to someone in need. Join the Raktosewa community and help us ensure that no one suffers due to a lack of blood.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="flex items-center justify-center rounded-xl h-14 px-8 bg-[#ec1313] hover:bg-red-700 transition-all transform hover:scale-105 text-white text-base font-bold shadow-lg shadow-red-200 dark:shadow-none">
              Register as Donor
            </button>
            <button className="flex items-center justify-center rounded-xl h-14 px-8 bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 text-[#181111] dark:text-white text-base font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
              Upcoming Camps
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-700 mt-4">
            <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-full text-[#ec1313]">
              💧
            </div>
            <div className="text-left">
              <p className="text-xs text-neutral-500 font-medium uppercase">Total Units Donated</p>
              <p className="text-lg font-black">15,420+</p>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition pointer-events-none"></div>
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-neutral-100 dark:bg-neutral-800">
            <div
              className="w-full h-full bg-cover bg-right"
              style={{
                backgroundImage: "url('/images/homebg.png')",
              }}
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-neutral-900/95 backdrop-blur rounded-xl p-4 shadow-lg border border-neutral-100 dark:border-neutral-700 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-800 bg-gray-300" />
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-800 bg-gray-400" />
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-neutral-800 bg-neutral-100 text-neutral-600 text-xs font-bold flex items-center justify-center">
                  +2k
                </div>
              </div>
              <div>
                <p className="font-bold text-sm">Join our donors</p>
                <p className="text-xs text-neutral-500">Make an impact today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
