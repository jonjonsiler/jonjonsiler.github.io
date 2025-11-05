import React from 'react';

export const StudentBadgeEarned: React.FC = () => {
  return (
    <div className="modal-template student-badge-earned">
      <h3>Student Badge Earned</h3>
      <div className="badge-image-placeholder">
        <div className="placeholder-image">🏆</div>
      </div>
      <p>Congratulations! Your student has earned the Reading Champion badge.</p>
      <p>This achievement represents significant progress in their reading journey.</p>
      <div className="action-buttons">
        <button className="btn btn-primary">Celebrate with Student</button>
        <button className="btn btn-secondary">View All Achievements</button>
      </div>
    </div>
  );
};

export default StudentBadgeEarned; 