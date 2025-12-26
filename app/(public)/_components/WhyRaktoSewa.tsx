import React from 'react'

const WhyRaktosewa = () => {
  const features = [
    {
      title: "Rapid Donors",
      description: "Quick response from verified blood donors in your area"
    },
    {
      title: "Instant Emergency Alerts",
      description: "Real-time notifications for urgent blood requirements"
    },
    {
      title: "Location Based Matching",
      description: "Connect with nearby donors for faster response times"
    },
    {
      title: "Secure Profile Information",
      description: "Your personal and medical information is kept secure"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Raktosewa?</h2>
          <p className="text-lg text-gray-600">Trusted by donors and hospitals across the country</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyRaktosewa
