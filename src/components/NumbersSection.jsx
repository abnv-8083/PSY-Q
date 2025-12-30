const NumbersSection = () => {
  const stats = [
    {
      number: "1000+",
      label: "Students Helped"
    },
    {
      number: "95%",
      label: "Success Rate"
    },
    {
      number: "50+",
      label: "Expert Counselors"
    },
    {
      number: "10+",
      label: "Years Experience"
    }
  ];

return (
    <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-16 sm:py-20 lg:py-24">
        <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2" style={{color: '#E91E63'}}>
                            {stat.number}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);
};

export default NumbersSection;