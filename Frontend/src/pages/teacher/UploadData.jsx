import { useState } from 'react';
import Sidebar from '../../components/Sidebar';

const UploadData = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    grade: '',
    marks: '',
    attendance: '',
    engagement: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send data to backend API
    console.log('Form submitted:', formData);
    alert('Student data uploaded successfully!');
    setFormData({
      studentName: '',
      email: '',
      grade: '',
      marks: '',
      attendance: '',
      engagement: '',
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="teacher" />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Student Data</h1>
          <p className="text-gray-600">Add or update student records and performance metrics</p>
        </div>

        <div className="max-w-3xl">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="student@school.edu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade/Class *
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Grade</option>
                      <option value="9th Grade">9th Grade</option>
                      <option value="10th Grade">10th Grade</option>
                      <option value="11th Grade">11th Grade</option>
                      <option value="12th Grade">12th Grade</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Performance Metrics */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="85"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attendance (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.attendance}
                      onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="90"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engagement (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.engagement}
                      onChange={(e) => setFormData({ ...formData, engagement: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="75"
                      required
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Upload Data
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({
                    studentName: '',
                    email: '',
                    grade: '',
                    marks: '',
                    attendance: '',
                    engagement: '',
                  })}
                  className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-blue-900 mb-2">📝 Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• All fields marked with * are required</li>
              <li>• Marks, Attendance, and Engagement should be between 0-100</li>
              <li>• Risk score will be automatically calculated based on the metrics</li>
              <li>• You can update existing student records by entering their email</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadData;
