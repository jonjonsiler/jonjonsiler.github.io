import React from 'react';

export const LessonPlanFixNeeded: React.FC = () => {
  return (
    <div className="modal-template lesson-plan-fix">
      <h3>Lesson Plan Update Required</h3>
      <p>Your lesson plan "Reading Fluency Lesson 4" needs attention.</p>
      <div className="issue-details">
        <h4>Issue: Missing Resources</h4>
        <p>This issue may impact student performance if not addressed before the next class session.</p>
      </div>
      <div className="timeline-placeholder">
        <div className="chart-placeholder">
          [Lesson Schedule Timeline]
        </div>
      </div>
      <div className="action-buttons">
        <button className="btn btn-primary">Fix Lesson Plan</button>
        <button className="btn btn-secondary">View Detailed Report</button>
      </div>
    </div>
  );
};

export default LessonPlanFixNeeded; 