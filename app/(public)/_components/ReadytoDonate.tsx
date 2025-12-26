import React from 'react';

const ReadyToDonate = () => {
  const eligibilityRequirements = [
    "Age between 18-65 years",
    "Weight at least 50 kg (110 lbs)",
    "Good overall health",
    "No recent illness or infection",
    "At least 3 months since last donation"
  ];

  const donationProcess = [
    "Register on our secure platform",
    "Receive emergency alert on your phone",
    "Accept request and visit the hospital",
    "Quick health screening at hospital",
    "Donate blood (takes only 10-15 minutes)"
  ];

  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat py-20"
      style={{
    backgroundImage: "url('/images/ReadytoDonate.png')"
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Ready to Donate?</h2>
          <p className="text-lg text-white drop-shadow-md">Learn about the donation process and requirements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Who Can Donate?</h3>
            <ul className="space-y-3">
              {eligibilityRequirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/90 p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Donation Process</h3>
            <ul className="space-y-3">
              {donationProcess.map((step, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md text-lg font-medium">
            Register Now & Save Lives
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReadyToDonate;
