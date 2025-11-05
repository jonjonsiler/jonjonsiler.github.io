import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown, type DropdownOptions } from '@components/global';
import { DropdownType } from '@enums';
import type { AssessmentPeriodItem } from '@models';
// import { useAssessmentPeriodWindows } from '@hooks';

export interface PeriodSelectionDropdownProps {
  // No props needed - component is fully self-contained
}

export const PeriodSelectionDropdown: React.FC<PeriodSelectionDropdownProps> = () => {
  const { t } = useTranslation('dashboard');
  // const { 
  //   groupedAssessmentOptions: dropdownOptions,
  //   selectedWindow, 
  //   updateSelectedWindow,
  // } = useAssessmentPeriodWindows();

  const dropdownOptions: Array<{
    label: string;
    options: Array<{
      label: string;
      value: string;
      subtitle?: string;
      icon?: React.ReactNode;
      originalValue?: AssessmentPeriodItem | { type: 'latest-assessment-status' };
    }>;
  }> = [];
  const selectedWindow: any = null;
  const updateSelectedWindow = (window: any) => {};

  // Helper function to find the dropdown option that matches the selectedWindow
  const findSelectedOption = () => {
    if (!selectedWindow || !dropdownOptions.length) {
      return null;
    }

    // Flatten all options from all groups
    const allOptions = dropdownOptions.flatMap(group => group.options);
    
    // Find the option that matches the selectedWindow by comparing the originalValue
    return allOptions.find(option => {
      if (!option.originalValue) return false;
      
      // For the placeholder "Latest assessment status" option
      if (option.originalValue && typeof option.originalValue === 'object' && 'type' in option.originalValue && 
          selectedWindow && typeof selectedWindow === 'object' && 'type' in selectedWindow) {
        return option.originalValue.type === selectedWindow.type;
      }
      
      // For AssessmentPeriodItem objects, compare key properties instead of object reference
      if (option.originalValue && selectedWindow && typeof option.originalValue === 'object' && typeof selectedWindow === 'object') {
        // Check if both are AssessmentPeriodItem objects (not the placeholder type)
        if ('periodId' in option.originalValue && 'periodId' in selectedWindow) {
          const bothHavePeriod = option.originalValue.periodId !== null && option.originalValue.periodId !== undefined &&
                                 (selectedWindow as any).periodId !== null && (selectedWindow as any).periodId !== undefined;
          // Primary match only when both sides have a concrete period id
          const baseMatch = bothHavePeriod && option.originalValue.periodId === (selectedWindow as any).periodId &&
                 option.originalValue.assignmentType === selectedWindow.assignmentType &&
                 option.originalValue.screeningWindowType === selectedWindow.screeningWindowType;

          if (baseMatch) return true;

          // Fallback for system benchmark: periodId may be null; match by benchmark tag
          const bothBenchmark = option.originalValue.assignmentType === 'BENCHMARK' && selectedWindow.assignmentType === 'BENCHMARK';
          const isSystemBenchmark = (selectedWindow as any).periodId == null;
          if (bothBenchmark && isSystemBenchmark) {
            const optionTags = (option.originalValue as any).tags || [];
            const selectedTags = (selectedWindow as any).tags || [];
            const toArray = (x: any) => Array.isArray(x) ? x : (x ? [x] : []);
            const o = toArray(optionTags);
            const s = toArray(selectedTags);
            const hasTagMatch = s.some((tag: string) => o.includes(tag) || o.includes(`WINDOW_${tag}`));
            return hasTagMatch;
          }
        }
      }
      
      return false;
    }) || null;
  };

  const selectedOption = findSelectedOption();

  // Handle dropdown selection changes
  const handleDropdownChange = (newSelectedOption: any) => {
    if (newSelectedOption) {
      // Store the original value in Redux
      updateSelectedWindow(newSelectedOption.originalValue);
    } else {
      // Clear the selection
      updateSelectedWindow(null);
    }
  };

  return (
    <>
      {dropdownOptions.length > 0 && (
        <div className="period-selection-dropdown">
          <Dropdown
            type={DropdownType.PRIMARY}
            placeholder={t('SELECT_PERIOD')}
            isDisabled={false}
            value={selectedOption}
            options={dropdownOptions}
            onChange={handleDropdownChange}
            aria-label={t('PERIOD_SELECTION')}
            menuMaxHeight="14rem"
          />
        </div>
      )}
    </>
  );
};