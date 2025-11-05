import React from 'react';
import { render, screen } from '@testing-library/react';
import MiniLessonCard, { MiniLessonCardProps } from './MiniLessonCard';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { MasteryStatus } from '@/enums';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
    },
  }),
}));

jest.mock('moment', () => {
  const originalMoment = jest.requireActual('moment');
  const mockMoment = (date?: any) => {
    if (date) {
      return originalMoment(date);
    }
    // Return a fixed date for "now" to make tests predictable
    return originalMoment('2023-01-01T12:00:00.000Z');
  };
  // Copy all static methods from original moment
  Object.setPrototypeOf(mockMoment, originalMoment);
  return mockMoment;
});

const renderComponent = (props: Partial<MiniLessonCardProps> = {}) => {
  const defaultProps: MiniLessonCardProps = {
    date: new Date('2023-01-01'),
    lessonName: 'Lesson 1',
    percentComplete: 50,
    unitName: 'Unit 1',
    mastery: MasteryStatus.DEVELOPING
  };
  return render(<MiniLessonCard {...defaultProps} {...props} />);
};

describe('MiniLessonCard', () => {
  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
  });

  it('displays "TODAY" if the date is today', () => {
    renderComponent({ date: new Date('2023-01-01T12:00:00.000Z') });
    expect(screen.getByText('TODAY')).toBeInTheDocument();
  });

  it('displays the unit name', () => {
    renderComponent({ unitName: 'Unit 1' });
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
  });

  it('displays the lesson name', () => {
    renderComponent({ lessonName: 'Lesson 1' });
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
  });

  it('displays percent in progress', () => {
    renderComponent({ percentComplete: 50 });
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
  });

  it('displays "NOT_STARTED" if percentComplete is null', () => {
    renderComponent({ percentComplete: null });
    expect(screen.getByText('NOT_STARTED')).toBeInTheDocument();
  });

  it('applies the correct aria-label for today', () => {
    renderComponent({ date: new Date('2023-01-01T12:00:00.000Z') });
    expect(screen.getByRole('region')).toHaveAttribute(
      'aria-label',
      'LESSON_CARD_TODAY_ARIA'
    );
  });

  it('displays the correct mastery status as css color class', () => {
    const {container} = renderComponent({ mastery: MasteryStatus.DEVELOPING });
    expect(container.querySelector('.percent-anim-done.developing'));
  })
});
