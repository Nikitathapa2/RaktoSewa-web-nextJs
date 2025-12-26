import React from 'react'

const AboutRaktosewa = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Raktosewa</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Raktosewa is a revolutionary digital platform bridging the gap between 
                blood donors and hospitals during critical emergencies. Founded in 2024, 
                we've become Nepal's most trusted blood donation network.
              </p>
              <p>
                Our mission is simple: save lives by connecting willing donors with those 
                in need. Faster than ever before. With our location-based matching system 
                and real-time alerts, we ensure that help reaches patients when every 
                second counts.
              </p>
              <p>
                Every day, our community of verified donors makes a real difference. Join 
                us in our mission to ensure that no life is lost due to blood shortage.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">30+</div>
                <div className="text-sm text-gray-600">Partner Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">50K+</div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/4226923/pexels-photo-4226923.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Close-up of blood test tubes and lab equipment in a sterile setting."
              className="rounded-lg shadow-lg w-full h-auto"
              width={433}
              height={650}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutRaktosewa