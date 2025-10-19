import React from 'react';
import { BarChart3 } from 'lucide-react';

const ResultsPage = () => {
  return (
    <div className="card text-center">
      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
      <h2 className="text-xl font-semibold mb-2">Results Page</h2>
      <p className="text-gray-600">View your quiz results and performance analytics.</p>
      <p className="text-sm text-gray-500 mt-4">This page will show detailed quiz results, scores, and progress tracking.</p>
    </div>
  );
};

export default ResultsPage;