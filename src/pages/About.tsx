import { FC } from 'react';

const About: FC = () => {
  return (
    <div className="min-h-screen bg-background py-12 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
            About Diagnosely
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-8">
            Revolutionizing healthcare through innovative diagnostic solutions
          </p>
        </div>

        <div className="mt-16 lg:mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Meet Our CEO
              </h2>
              <p className="text-lg text-muted-foreground">
                Jeel Mangukiya leads Diagnosely with over many years of experience in healthcare technology. 
                His vision is to make advanced diagnostic tools accessible to healthcare providers worldwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="ml-3 text-gray-700">Years Of Experience</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="ml-3 text-gray-700">B-Tech from Pandit Deendayal Energy University</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="ml-3 text-gray-700">Board Member at Digital Health Alliance</span>
                </div>
              </div>
            </div>
            
            <div className="relative w-full md:w-96 h-auto mx-auto rounded-lg overflow-hidden shadow-xl">
              <img
                className="w-full h-auto object-cover"
                src="/jeel.jpg"
                alt="Jeel Mangukiya"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 lg:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To empower healthcare providers with cutting-edge diagnostic tools and solutions.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become the global leader in AI-powered diagnostic solutions.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600">
                Innovation, Integrity, and Patient-Centered Care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 