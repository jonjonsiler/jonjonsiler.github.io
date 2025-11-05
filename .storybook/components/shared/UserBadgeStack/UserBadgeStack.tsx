import React from 'react';
import { UserBadge } from '@components/shared';
import './UserBadgeStack.scss';

interface UserBadgeListProps {
  students: string[];
}

export const UserBadgeStack: React.FC<UserBadgeListProps> = ({
  students
}) => (
  students
  && students.length > 0 
  && 
  <ul className="user-badge-list">
  {students.slice(0,3).map((studentName, index) => (
    <li key={`student-badge-${index}`}><UserBadge name={studentName} /></li>
  ))}
  {
    students.length > 3 
    && 
    <li key={`student-badge-more`}><i className="user-badge user-badge-more">+{students.length - 3}</i></li>
  }
  </ul> 
);