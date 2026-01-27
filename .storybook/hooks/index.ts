export const useAccessToken = () => {};
export const useGreetingMessage = () => {};
export const usePlannerCompare = () => {};
export const usePreTeachData = () => {};
export const useReTeachData = () => {};
export const useRosterInfo = () => {};
export const useSkillResources = () => {
  return {
    getResources: (skillIds: string[], limit: number) => {},
    resourceMap: {} as Record<string, any[]>
  }
};
export * from './useSelectedClassroom';
export const useWeeklyPlan = () => {};