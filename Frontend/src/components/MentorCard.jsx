const MentorCard = ({ mentor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <img
          src={mentor.image}
          alt={mentor.name}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
          <span className="text-yellow-600 text-sm">⭐</span>
          <span className="text-sm font-semibold text-gray-900">{mentor.rating}</span>
        </div>
      </div>

      {/* Info */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{mentor.name}</h3>
      <p className="text-sm text-indigo-600 font-medium mb-3">{mentor.subject}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📧</span>
          <span className="truncate">{mentor.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">📞</span>
          <span>{mentor.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🕒</span>
          <span className="text-xs">{mentor.availability}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{mentor.studentsHelped}</span> students helped
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
        Book Session
      </button>
    </div>
  );
};

export default MentorCard;
