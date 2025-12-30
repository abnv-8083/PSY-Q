const FeatureCard = ({ icon, title, description, image }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 card-hover h-full overflow-hidden">
      {/* Image Section */}
    <div className="h-48 flex items-center justify-center p-12">
    {image && (
      <img
        src={image}
        alt={title}
        style={{ 
          width: '200px', 
          height: '200px',
          display: 'block'
        }}
        className="object-contain"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    )}
  </div>

      {/* Content Section */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col text-center space-y-4">
          <h3 className="text-xl sm:text-xl font-bold" style={{ color: 'rgb(233, 30, 99)' }}>{title}</h3>
          <p className="text-sm sm:text-base text-black leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
