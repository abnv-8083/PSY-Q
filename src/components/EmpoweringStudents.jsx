import ResponsiveImage from './ResponsiveImage';

const EmpoweringStudents = () => {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Expert Guidance for Competitive Exam Success"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Personalized Psychological Career Webinars"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Online Counselling for Academic and Personal Growth"
    }
  ];

  return (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
           {/* Right Content - Image */}
           <div className="mt-8 lg:mt-0">
            <div className="rounded-lg h-80 sm:h-96 lg:h-[500px] overflow-hidden">
              <ResponsiveImage 
                src="/images/hero-2.jpg" 
                alt="Empowering students"
                className="w-full h-full object-cover"
                priority={false}
              />
            </div>
          </div>
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Empowering Students to Excel in Competitive Exams with Comprehensive Support.
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Psy-Q specializes in equipping students for competitive exams with expert guidance and resources. Our comprehensive approach ensures you're fully prepared for success.
            </p>
            
            <div className="space-y-4 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white" style={{backgroundColor: '#E91E63'}}>
                    {feature.icon}
                  </div>
                  <p className="text-gray-700 font-medium text-sm sm:text-base">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmpoweringStudents;
