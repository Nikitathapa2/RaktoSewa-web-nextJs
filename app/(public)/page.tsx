// app/layout.tsx
'use client';

import UpcomingCamps from "./_components/Camps";
import Footer from "./_components/Footer";
import Header from "./_components/Header";
import Hero from "./_components/Hero";
import HowItWorks from "./_components/HowItWorks";
import Mission from "./_components/Mision";
import Newsletter from "./_components/NewsClient";



export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
     
      <main className="flex-1 flex flex-col items-center w-full">

        <Hero />
        <Mission />
        <HowItWorks />
        <UpcomingCamps />
      
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

// components/Header.tsx


const navItems = [
  { name: 'Home', href: '#' },
  { name: 'About', href: '#' },
  { name: 'Donate', href: '#' },
  { name: 'Camps', href: '#' },
  { name: 'Contact', href: '#' },
];

// export default function Header() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#f4f0f0] dark:border-neutral-800 bg-white/90 dark:bg-[#221010]/90 backdrop-blur-md px-4 sm:px-10 py-3">
//       <div className="flex items-center gap-4">
//         <div className="w-8 h-8 text-[#ec1313] flex items-center justify-center">
//           🩸
//         </div>
//         <h2 className="text-[#181111] dark:text-white text-xl font-bold">Raktosewa</h2>
//       </div>

//       <nav className="hidden lg:flex flex-1 justify-end gap-8 items-center">
//         <div className="flex gap-6">
//           {navItems.map((item) => (
//             <Link
//               key={item.name}
//               href={item.href}
//               className="text-[#181111] dark:text-white text-sm font-medium hover:text-[#ec1313] transition-colors"
//             >
//               {item.name}
//             </Link>
//           ))}
//         </div>
//         <button className="flex items-center justify-center rounded-xl h-10 px-6 bg-[#ec1313] hover:bg-red-700 transition-colors text-white text-sm font-bold shadow-lg shadow-red-200 dark:shadow-none">
//           Login / Register
//         </button>
//       </nav>

//       <button className="lg:hidden text-[#181111] dark:text-white">
//         ☰
//       </button>
//     </header>
//   );
// }

// components/Hero.tsx


// components/Mission.tsx


// components/HowItWorks.tsx


// components/UpcomingCamps.tsx


// components/DonorStories.tsx


// components/Newsletter.tsx


// components/Footer.tsx



// tailwind.config.ts

