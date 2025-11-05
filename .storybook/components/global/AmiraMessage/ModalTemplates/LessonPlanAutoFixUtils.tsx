import {
  getTimeAssignedByGrade,
  getManifestByResourceType,
  handleCreateUpdateAssignments,
  getMostCommonGrade,
  transformId,
  getSkillTimeBalance,
  getSkillResources,
  updateCRUDAssignmentsQueue
} from "@utilities";
// import { updateCRUDAssignmentsQueue } from "@/store/slices";
import { Entity, MasteryStatusPacing, ResourceType, SkillType } from "@enums";
import type { AmiraResources, LessonDetails, AssignmentManifest } from "@models";

/**
 * ============================================================================
 * CONSTANTS AND TYPE DEFINITIONS
 * ============================================================================
 */

/**
 * Resource type enumeration in lowercase for consistent comparison
 */
export enum ResourceTypeLower {
  teacherResource = "teacherresource",
  istationLegacyActivity = "istationlegacyactivity",
  tutor = "tutor",
  skillTutor = "skilltutor",
  erss = "erss",
  textSet = "textset",
  microLesson = "microlesson",
}

/**
 * Priority order for removing resources when students are overbooked.
 * Teacher resources are removed first to minimize impact on core curriculum.
 */
export const ASSIGNMENT_PRIORITY_ORDER_REMOVAL = [
  ResourceTypeLower.teacherResource,
  ResourceTypeLower.istationLegacyActivity,
  ResourceTypeLower.tutor,
  ResourceTypeLower.skillTutor,
  ResourceTypeLower.erss,
  ResourceTypeLower.textSet,
  ResourceTypeLower.microLesson,
] as const;

/**
 * Priority order for adding resources when students are underbooked.
 * Core educational content (tutor, skillTutor) is prioritized over supplementary materials.
 */
export const ASSIGNMENT_PRIORITY_ORDER_ADDITION = [
  ResourceTypeLower.microLesson,
  ResourceTypeLower.istationLegacyActivity,
  ResourceTypeLower.tutor,
  ResourceTypeLower.skillTutor,
  ResourceTypeLower.erss,
  ResourceTypeLower.textSet,
  ResourceTypeLower.teacherResource,
] as const;

/**
 * Content categories for balanced resource distribution.
 * Ensures students receive a well-rounded mix of different resource types.
 */
export const CONTENT_CATEGORIES = {
  teacherResource: [ResourceTypeLower.teacherResource],
  microLessonAndLegacy: [
    ResourceTypeLower.microLesson,
    ResourceTypeLower.istationLegacyActivity,
  ],
  tutorAndSupports: [
    ResourceTypeLower.tutor,
    ResourceTypeLower.skillTutor,
    ResourceTypeLower.erss,
    ResourceTypeLower.textSet,
  ],
} as const;

/**
 * Interface for tracking student skill booking data used in auto-fix calculations
 */
export interface StudentSkillBookingData {
  studentId: string;
  skillId: string;
  excessTime: number;
  shortfallTime: number;
  assignments: AssignmentManifest[];
  timeAssigned: number;
  timeToGrowth: number;
}

/**
 * Threshold in minutes for determining when auto-fix should be applied.
 * Students within this threshold of their target time are considered adequately booked.
 */
export const THRESHOLD_FOR_AUTO_FIX = 4;

/**
 * ============================================================================
 * CORE UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Retrieves the appropriate student assignment data for skill processing.
 * Falls back to main assignment if no specific student assignment exists.
 */
const getStudentAssignmentFromSkillData = (
  studentId: string,
  lesson: LessonDetails
) => {
  let studentAssignment = lesson.studentAssignments.find(
    assignment => assignment.entityId === studentId
  );
  if (!studentAssignment) {
    studentAssignment = lesson.mainAssignment;
  }
  // Note: SKIP_OVERRIDE assignments could be handled differently here if needed

  return studentAssignment;
};

/**
 * Normalizes manifest entries to ensure consistent structure and content tags.
 * Handles special cases like skillTutor resources with placeholder UUIDs.
 */
const normalizeManifest = (manifest: any[]) => {
  return manifest.map((entry: any) => {
    const placeholderUuid = "00000000-0000-0000-0000-000000000000";

    // For skillTutor resources (identified by placeholder storyId and tutor activityType),
    // use existing contentTags - they should already be saved correctly
    let contentTags: string[];
    if (
      entry.storyId === placeholderUuid &&
      entry.activityType === ResourceType.tutor
    ) {
      contentTags = entry.contentTags || [];
    } else {
      // For other resource types, generate contentTags if missing
      contentTags = entry.contentTags || [
        `resourceUniqueId-${entry.storyId}`,
        `resourceType-${entry.activityType}`,
      ];
    }

    return {
      storyId: entry.storyId,
      activityType: entry.activityType,
      contentTags,
      skills:
        entry.skills?.map((skill: any) => ({ skillId: skill.skillId })) || [],
    };
  });
};

/**
 * ============================================================================
 * RESOURCE BALANCING AND CATEGORIZATION
 * ============================================================================
 */

/**
 * Calculates the count of resources in each content category.
 * Used to ensure balanced distribution of resource types.
 */
const getCategoryCounts = (manifest: any[], teacherResources: string[]) => {
  const categoryCounts = {
    teacherResource: 0,
    microLessonAndLegacy: 0,
    tutorAndSupports: 0,
  };

  // Teacher resources are tracked separately from manifest
  categoryCounts.teacherResource = teacherResources.length;

  manifest.forEach(item => {
    const activityType = item.activityType?.toLowerCase();
    if (CONTENT_CATEGORIES.microLessonAndLegacy.includes(activityType as any)) {
      categoryCounts.microLessonAndLegacy++;
    } else if (
      CONTENT_CATEGORIES.tutorAndSupports.includes(activityType as any)
    ) {
      categoryCounts.tutorAndSupports++;
    }
  });

  return categoryCounts;
};

/**
 * Determines if resource categories are balanced.
 * Categories are considered balanced if the difference between max and min counts is ≤ 1.
 */
const areCategoriesBalanced = (categoryCounts: Record<string, number>) => {
  const counts = Object.values(categoryCounts).filter(c => c > 0);
  if (counts.length === 0) return false;
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  return maxCount - minCount <= 1; // Categories are balanced if difference is 0 or 1
};

/**
 * ============================================================================
 * MANIFEST FILTERING AND MANIPULATION
 * ============================================================================
 */

/**
 * Filters manifest entries to only include items for a specific skill.
 */
const filterManifestBySkill = (manifest: any[], skillId: string) => {
  return manifest.filter(item =>
    item.skills?.some((skill: any) => skill.skillId === skillId)
  );
};

/**
 * Removes specific manifest items for a given skill from the complete manifest.
 * Used when reducing resources for overbooked students.
 */
const removeManifestItemsForSkill = (
  manifest: any[],
  skillId: string,
  itemsToRemove: any[]
) => {
  return manifest.filter(manifestItem => {
    if (!manifestItem.skills?.some((skill: any) => skill.skillId === skillId)) {
      return true;
    }

    const shouldRemove = itemsToRemove.some(
      itemToRemove =>
        transformId(manifestItem.storyId) ===
          transformId(itemToRemove.storyId) &&
        manifestItem.activityType === itemToRemove.activityType
    );

    return !shouldRemove;
  });
};

/**
 * Checks if a resource would be a duplicate in the current manifest.
 * Prevents adding the same resource multiple times for the same skill.
 */
const isResourceDuplicate = (
  manifestEntries: any[],
  currentManifest: any[],
  skillId: string
): boolean => {
  return manifestEntries.some(entry => {
    const entryId = transformId(entry.storyId);
    const entryActivityType = entry.activityType;
    return currentManifest.some(existing => {
      const existingId = transformId(existing.storyId);
      const existingActivityType = existing.activityType;
      const existingSkillId = existing.skills?.[0]?.skillId;
      // Check for duplicates based on storyId, activityType, and skillId
      return (
        entryId === existingId &&
        entryActivityType === existingActivityType &&
        existingSkillId === skillId
      );
    });
  });
};

/**
 * ============================================================================
 * RESOURCE REMOVAL FUNCTIONS (FOR OVERBOOKED STUDENTS)
 * ============================================================================
 */

/**
 * Removes resources by priority order to reduce time allocation for overbooked students.
 * Maintains resource metadata integrity while removing resources and their skill associations.
 */
const removeByPriorityForSkill = (
  manifest: any[],
  skillId: string,
  targetTime: number,
  gradeLevel: any[],
  studentName: string,
  teacherResources: string[],
  resourceMetadata: { resourceUniqueId: string; skills: string[] }[] = []
) => {
  const skillManifest = filterManifestBySkill(manifest, skillId);
  let currentSkillManifest = [...skillManifest];
  let newTeacherResources = [...teacherResources];
  let newResourceMetadata = [...resourceMetadata];
  let totalTimeRemoved = 0;
  const itemsToRemove: any[] = [];

  // Process each resource type in removal priority order
  for (const activityType of ASSIGNMENT_PRIORITY_ORDER_REMOVAL) {
    if (totalTimeRemoved >= targetTime) break;

    if (activityType === ResourceTypeLower.teacherResource) {
      // Special handling for teacher resources - they're tracked in metadata
      const resourceForThisSkill = newResourceMetadata.find(
        rm =>
          rm.skills.includes(skillId) &&
          newTeacherResources.includes(rm.resourceUniqueId)
      );

      if (resourceForThisSkill) {
        const resourceId = resourceForThisSkill.resourceUniqueId;

        // Remove the skill from this resource's metadata
        const updatedSkills = resourceForThisSkill.skills.filter(
          s => s !== skillId
        );
        if (updatedSkills.length === 0) {
          // Remove entire resource if no skills remain
          newResourceMetadata = newResourceMetadata.filter(
            rm => transformId(rm.resourceUniqueId) !== transformId(resourceId)
          );
          newTeacherResources = newTeacherResources.filter(
            r => transformId(r) !== transformId(resourceId)
          );
        } else {
          // Keep resource but remove the skill
          newResourceMetadata = newResourceMetadata.map(rm =>
            transformId(rm.resourceUniqueId) === transformId(resourceId)
              ? { ...rm, skills: updatedSkills }
              : rm
          );
        }

        totalTimeRemoved += getTimeAssignedByGrade(
          ResourceType.teacherResource,
          gradeLevel,
          skillId
        );
      }
      continue;
    }

    // Handle manifest-based resources (non-teacher resources)
    const itemsOfType = currentSkillManifest.filter(
      item => item.activityType?.toLowerCase() === activityType
    );

    for (const item of itemsOfType) {
      if (totalTimeRemoved >= targetTime) break;

      const itemTime =
        getTimeAssignedByGrade(item.activityType || "", gradeLevel, skillId) *
        (item.storyIds?.length || 1);
      itemsToRemove.push(item);
      currentSkillManifest = currentSkillManifest.filter(
        manifestItem =>
          !(
            manifestItem.storyId === item.storyId &&
            manifestItem.activityType === item.activityType
          )
      );
      totalTimeRemoved += itemTime;
    }
  }

  const updatedManifest = removeManifestItemsForSkill(
    manifest,
    skillId,
    itemsToRemove
  );
  return {
    manifest: updatedManifest,
    timeRemoved: totalTimeRemoved,
    teacherResources: newTeacherResources,
    resourceMetadata: newResourceMetadata,
  };
};

/**
 * Removes resources to balance categories while meeting time reduction targets.
 * Prioritizes removing from the most over-represented category to maintain balance.
 */
const balanceCategoriesForRemovalBySkill = (
  manifest: any[],
  skillId: string,
  targetTime: number,
  gradeLevel: any[],
  teacherResources: string[],
  resourceMetadata: { resourceUniqueId: string; skills: string[] }[] = []
) => {
  const skillManifest = filterManifestBySkill(manifest, skillId);
  let currentSkillManifest = [...skillManifest];
  let newTeacherResources = [...teacherResources];
  let newResourceMetadata = [...resourceMetadata];
  let totalTimeRemoved = 0;
  const itemsToRemove: any[] = [];

  while (totalTimeRemoved < targetTime) {
    const categoryCounts = getCategoryCounts(
      currentSkillManifest,
      newTeacherResources
    );

    if (areCategoriesBalanced(categoryCounts)) {
      break;
    }

    // Find the category with the most resources to remove from
    const maxCategory = Object.entries(categoryCounts).reduce(
      (max, [category, count]) =>
        count > max.count ? { category, count } : max,
      { category: "", count: 0 }
    );

    if (maxCategory.count === 0) break;

    const categoryTypes =
      CONTENT_CATEGORIES[
        maxCategory.category as keyof typeof CONTENT_CATEGORIES
      ];

    // Try to find a manifest item to remove from the over-represented category
    let itemToRemove = currentSkillManifest.find(item => {
      const activityType = item.activityType?.toLowerCase();
      return (
        activityType &&
        (categoryTypes as readonly string[]).includes(activityType)
      );
    });

    if (itemToRemove) {
      const itemTime =
        getTimeAssignedByGrade(itemToRemove.activityType || "", gradeLevel, skillId) *
        (itemToRemove.storyIds?.length || 1);
      itemsToRemove.push(itemToRemove);
      currentSkillManifest = currentSkillManifest.filter(
        manifestItem =>
          !(
            manifestItem.storyId === itemToRemove.storyId &&
            manifestItem.activityType === itemToRemove.activityType &&
            manifestItem.skills?.[0]?.skillId ===
              itemToRemove.skills?.[0]?.skillId
          )
      );
      totalTimeRemoved += itemTime;
    } else if (
      (categoryTypes as readonly string[]).includes(
        ResourceTypeLower.teacherResource
      )
    ) {
      // Handle teacher resource removal when it's the over-represented category
      const resourceForThisSkill = newResourceMetadata.find(
        rm =>
          rm.skills.includes(skillId) &&
          newTeacherResources.includes(rm.resourceUniqueId)
      );

      if (resourceForThisSkill) {
        const resourceId = resourceForThisSkill.resourceUniqueId;

        const updatedSkills = resourceForThisSkill.skills.filter(
          s => s !== skillId
        );
        if (updatedSkills.length === 0) {
          newResourceMetadata = newResourceMetadata.filter(
            rm => transformId(rm.resourceUniqueId) !== transformId(resourceId)
          );
          newTeacherResources = newTeacherResources.filter(
            r => transformId(r) !== transformId(resourceId)
          );
        } else {
          newResourceMetadata = newResourceMetadata.map(rm =>
            transformId(rm.resourceUniqueId) === transformId(resourceId)
              ? { ...rm, skills: updatedSkills }
              : rm
          );
        }

        totalTimeRemoved += getTimeAssignedByGrade(
          ResourceType.teacherResource,
          gradeLevel,
          skillId
        );
      }
    } else {
      break; // Can't find anything to remove
    }
  }

  const updatedManifest = removeManifestItemsForSkill(
    manifest,
    skillId,
    itemsToRemove
  );
  return {
    manifest: updatedManifest,
    timeRemoved: totalTimeRemoved,
    teacherResources: newTeacherResources,
    resourceMetadata: newResourceMetadata,
  };
};

/**
 * ============================================================================
 * RESOURCE ADDITION FUNCTIONS (FOR UNDERBOOKED STUDENTS)
 * ============================================================================
 */

/**
 * Adds resources while maintaining balanced categories.
 * Prioritizes adding to the least represented category to achieve balance.
 */
const balanceCategoriesForAdditionBySkill = (
  currentManifest: any[],
  availableResources: any[],
  skillId: string,
  shortfallTime: number,
  gradeLevel: { grade: string }[] | [],
  teacherResources: string[],
  isOnlyOneSkill: boolean,
  resourceMetadata: { resourceUniqueId: string; skills: string[] }[] = []
) => {
  let manifest = [...currentManifest];
  let newTeacherResources = [...teacherResources];
  let newResourceMetadata = [...resourceMetadata];
  let remainingShortfall = shortfallTime;
  let skillManifest = filterManifestBySkill(manifest, skillId);

  const hasRemainingShortfall = () => remainingShortfall > 0;
  const hasUnusedResources = () =>
    availableResources.some(resource => resource.targetSkillId === skillId);
  const skippedResources: string[] = [];

  // Continue adding resources while there's remaining shortfall and available resources
  while (hasRemainingShortfall() && hasUnusedResources()) {
    const categoryCounts = getCategoryCounts(
      skillManifest,
      newTeacherResources
    );

    if (areCategoriesBalanced(categoryCounts)) {
      break; // Exit balancing loop, let addByPriorityForSkill handle the remaining shortfall
    }

    // Find the category with the fewest resources to add to
    const minCategory = Object.entries(categoryCounts).reduce(
      (min, [category, count]) =>
        count < min.count && !skippedResources.includes(category)
          ? { category, count }
          : min,
      { category: "", count: Infinity }
    );

    if (minCategory.category === "") {
      break;
    }

    const categoryTypes =
      CONTENT_CATEGORIES[
        minCategory.category as keyof typeof CONTENT_CATEGORIES
      ];
    let resourceAdded = false;
    let resourceSkipped = false;

    // Try to find a resource that fits the under-represented category
    for (let i = 0; i < availableResources.length && !resourceAdded; i++) {
      const resource = availableResources[i];
      const resourceType = resource.resourceType?.toLowerCase();

      if (
        resourceType &&
        (categoryTypes as readonly string[]).includes(resourceType) &&
        resource.targetSkillId === skillId
      ) {
        const itemTime =
          getTimeAssignedByGrade(resource.resourceType || "", gradeLevel, skillId) *
          (resource.storyIds?.length || 1);

        // For auto-fix scenarios, be more lenient with resource sizes
        // Allow resources up to 15 minutes to fix underbooked students
        const maxAllowedTimeForAutoFix = 15;
        if (itemTime > maxAllowedTimeForAutoFix) {
          resourceSkipped = true;
          skippedResources.push(minCategory.category);
          continue;
        }

        const manifestEntries = getManifestByResourceType(resource, skillId);
        const simplifiedManifestEntries = manifestEntries.map(entry => ({
          storyId: entry.storyId,
          activityType: entry.activityType,
          contentTags: entry.contentTags || [],
          skills: entry.skills
            ?.filter(skill => skill.skillId === skillId)
            .map(skill => ({ skillId: skill.skillId })),
        }));

        if (resource.resourceType === ResourceType.teacherResource) {
          // Add teacher resource to tracking lists
          newTeacherResources.push(resource.resourceUniqueId);

          // Add to resourceMetadata
          const existingResource = newResourceMetadata.find(
            rm =>
              transformId(rm.resourceUniqueId) ===
              transformId(resource.resourceUniqueId)
          );
          if (existingResource) {
            // Add skill if not already present
            if (!existingResource.skills.includes(skillId)) {
              newResourceMetadata = newResourceMetadata.map(rm =>
                transformId(rm.resourceUniqueId) ===
                transformId(resource.resourceUniqueId)
                  ? { ...rm, skills: [...rm.skills, skillId] }
                  : rm
              );
            }
          } else {
            // Add new resource with skill
            newResourceMetadata.push({
              resourceUniqueId: resource.resourceUniqueId,
              skills: [skillId],
            });
          }
        } else {
          // Add manifest-based resource
          // make sure we don't add the same resource twice
          if (
            manifest.some(existing =>
              simplifiedManifestEntries.some(
                newEntry =>
                  transformId(existing.storyId) ===
                    transformId(newEntry.storyId) &&
                  existing.activityType === newEntry.activityType &&
                  existing.skills?.[0]?.skillId ===
                    newEntry.skills?.[0]?.skillId
              )
            )
          ) {
            continue;
          }
          manifest = [...manifest, ...simplifiedManifestEntries];
          skillManifest = [...skillManifest, ...simplifiedManifestEntries]; // update skillManifest to include the new resources, so we can use correct category counts
        }

        remainingShortfall = Math.max(0, remainingShortfall - itemTime);
        resourceAdded = true;
      }
    }

    if (!resourceAdded && !resourceSkipped) {
      break;
    }
    if (skippedResources.length === Object.keys(categoryCounts).length) {
      break;
    }
  }

  return {
    manifest,
    remainingShortfall,
    teacherResources: newTeacherResources,
    resourceMetadata: newResourceMetadata,
  };
};

/**
 * Adds resources by priority order without regard to category balance.
 * Used after category balancing to fill remaining shortfall.
 */
const addByPriorityForSkill = (
  manifest: any[],
  availableResources: any[],
  skillId: string,
  shortfallTime: number,
  gradeLevel: { grade: string }[] | [],
  teacherResources: string[],
  isOnlyOneSkill: boolean,
  resourceMetadata: { resourceUniqueId: string; skills: string[] }[] = []
) => {
  let currentManifest = [...manifest];
  let newTeacherResources = [...teacherResources];
  let newResourceMetadata = [...resourceMetadata];
  let remainingShortfall = shortfallTime;
  const skippedResources: {
    tooLarge: { resource: AmiraResources; time: number }[];
  } = { tooLarge: [] };

  // Process resources in priority order
  for (const activityType of ASSIGNMENT_PRIORITY_ORDER_ADDITION) {
    if (
      remainingShortfall <= 0 ||
      !availableResources.some(resource => resource.targetSkillId === skillId)
    ) {
      break;
    }

    for (
      let i = 0;
      i < availableResources.length && remainingShortfall > 0;
      i++
    ) {
      const resource = availableResources[i];

      if (
        resource.resourceType?.toLowerCase() === activityType &&
        resource.targetSkillId === skillId
      ) {
        const itemTime =
          getTimeAssignedByGrade(resource.resourceType || "", gradeLevel, skillId) *
          (resource.storyIds?.length || 1);

        // For auto-fix scenarios, be more lenient with resource sizes
        // Allow resources up to 15 minutes to fix underbooked students
        const maxAllowedTimeForAutoFix = 15;
        if (itemTime > maxAllowedTimeForAutoFix) {
          skippedResources.tooLarge.push({ resource, time: itemTime });
          continue;
        }

        const manifestEntries = getManifestByResourceType(resource, skillId);

        const simplifiedManifestEntries = manifestEntries.map(entry => ({
          storyId: entry.storyId,
          activityType: entry.activityType,
          contentTags: entry.contentTags || [],
          skills: entry.skills
            ?.filter(skill => skill.skillId === skillId)
            .map(skill => ({ skillId: skill.skillId })),
        }));

        if (resource.resourceType === ResourceType.teacherResource) {
          newTeacherResources.push(resource.resourceUniqueId);

          // Add to resourceMetadata
          const existingResource = newResourceMetadata.find(
            rm =>
              transformId(rm.resourceUniqueId) ===
              transformId(resource.resourceUniqueId)
          );
          if (existingResource) {
            // Add skill if not already present
            if (!existingResource.skills.includes(skillId)) {
              newResourceMetadata = newResourceMetadata.map(rm =>
                transformId(rm.resourceUniqueId) ===
                transformId(resource.resourceUniqueId)
                  ? { ...rm, skills: [...rm.skills, skillId] }
                  : rm
              );
            }
          } else {
            // Add new resource with skill
            newResourceMetadata.push({
              resourceUniqueId: resource.resourceUniqueId,
              skills: [skillId],
            });
          }
        } else {
          // Check for duplicates before adding to manifest
          if (
            !currentManifest.some(existing =>
              simplifiedManifestEntries.some(
                newEntry =>
                  transformId(existing.storyId) ===
                    transformId(newEntry.storyId) &&
                  existing.activityType === newEntry.activityType &&
                  existing.skills?.[0]?.skillId ===
                    newEntry.skills?.[0]?.skillId
              )
            )
          ) {
            currentManifest = [
              ...currentManifest,
              ...simplifiedManifestEntries,
            ];
          }
        }

        remainingShortfall = Math.max(0, remainingShortfall - itemTime);
      }
    }
  }

  // If there's still a shortfall and we have large resources that were skipped,
  // add the largest one as a last resort
  if (remainingShortfall > 0) {
    if (skippedResources.tooLarge.length > 0) {
      const resource = skippedResources.tooLarge.sort(
        (a, b) => b.time - a.time
      )[0].resource;

      if (resource.resourceType === ResourceType.teacherResource) {
        newTeacherResources.push(resource.resourceUniqueId);

        // Add to resourceMetadata
        const existingResource = newResourceMetadata.find(
          rm =>
            transformId(rm.resourceUniqueId) ===
            transformId(resource.resourceUniqueId)
        );
        if (existingResource) {
          // Add skill if not already present
          if (!existingResource.skills.includes(skillId)) {
            newResourceMetadata = newResourceMetadata.map(rm =>
              transformId(rm.resourceUniqueId) ===
              transformId(resource.resourceUniqueId)
                ? { ...rm, skills: [...rm.skills, skillId] }
                : rm
            );
          }
        } else {
          // Add new resource with skill
          newResourceMetadata.push({
            resourceUniqueId: resource.resourceUniqueId,
            skills: [skillId],
          });
        }
      } else {
        const manifestEntries = getManifestByResourceType(
          resource,
          skillId
        ).map(entry => ({
          storyId: entry.storyId,
          activityType: entry.activityType,
          contentTags: entry.contentTags || [],
          skills: entry.skills
            ?.filter(skill => skill.skillId === skillId)
            .map(skill => ({ skillId: skill.skillId })),
        }));
        // Check for duplicates before adding to manifest
        if (
          !currentManifest.some(existing =>
            manifestEntries.some(
              newEntry =>
                transformId(existing.storyId) ===
                  transformId(newEntry.storyId) &&
                existing.activityType === newEntry.activityType &&
                existing.skills?.[0]?.skillId === newEntry.skills?.[0]?.skillId
            )
          )
        ) {
          currentManifest = [...currentManifest, ...manifestEntries];
        }
      }
    }
  }

  return {
    manifest: currentManifest,
    teacherResources: newTeacherResources,
    resourceMetadata: newResourceMetadata,
  };
};

/**
 * ============================================================================
 * STUDENT MANIFEST UPDATE ORCHESTRATION
 * ============================================================================
 */

/**
 * Orders manifest items by the provided skillsOrder to ensure consistent ordering
 * across all student manifests. Items without skills or with skills not in the order
 * are placed at the end.
 */
const orderManifestBySkillsOrder = (
  manifest: any[],
  skillsOrder: string[]
): any[] => {
  if (!skillsOrder || skillsOrder.length === 0) {
    return manifest; // Return as-is if no skillsOrder provided
  }

  return [...manifest].sort((a, b) => {
    const aSkillId = a.skills?.[0]?.skillId;
    const bSkillId = b.skills?.[0]?.skillId;

    // If both items have skills, compare their positions in skillsOrder
    if (aSkillId && bSkillId) {
      const aIndex = skillsOrder.indexOf(aSkillId);
      const bIndex = skillsOrder.indexOf(bSkillId);

      // If both skills are in the order, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only one skill is in the order, prioritize the one in the order
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // If neither skill is in the order, maintain original order
      return 0;
    }

    // If only one item has skills, prioritize the one with skills
    if (aSkillId && !bSkillId) return -1;
    if (!aSkillId && bSkillId) return 1;

    // If neither item has skills, maintain original order
    return 0;
  });
};

/**
 * Orchestrates the update of student manifests by calling the assignment handler
 * and dispatching the results to the Redux store for processing.
 */
export const updateStudentManifests = (
  updatedManifests: Array<{
    studentId: string;
    manifest: any[];
    teacherResources: string[];
    resourceMetadata?: { resourceUniqueId: string; skills: string[] }[];
  }>,
  lesson: LessonDetails,
  dispatch: any,
  skillsOrder?: string[]
): Promise<number> => {
  return new Promise(resolve => {
    if (updatedManifests.length === 0) {
      resolve(0);
      return;
    }

    // Preserve original manifests for comparison and rollback if needed
    const originalStudentGroupManifests: {
      studentId: string;
      manifest: AssignmentManifest[];
    }[] = [];
    for (const student of updatedManifests) {
      const studentAssignment = getStudentAssignmentFromSkillData(
        student.studentId,
        lesson
      );
      if (studentAssignment) {
        // Use the full manifest, not just the first item
        originalStudentGroupManifests.push({
          studentId: student.studentId,
          manifest: studentAssignment.manifest,
        });
      }
    }

    // Order manifests by skillsOrder if provided
    const orderedManifests = skillsOrder
      ? updatedManifests.map(manifest => ({
          ...manifest,
          manifest: orderManifestBySkillsOrder(manifest.manifest, skillsOrder),
        }))
      : updatedManifests;

    // Call the assignment handler with auto-fix flag
    const result = handleCreateUpdateAssignments({
      lesson,
      userId: lesson.userId,
      classroomId: lesson.classroomId,
      newStudentManifests: orderedManifests, // This preserves the resourceMetadata from auto-fix
      teacherResources: orderedManifests.map(manifest => ({
        studentId: manifest.studentId,
        resources: manifest.teacherResources,
      })),
      originalStudentGroupManifests,
      isAutoFix: true,
    });

    if (result) {
      // dispatch(updateCRUDAssignmentsQueue(result));
      setTimeout(() => resolve(updatedManifests.length), 0);
    } else {
      resolve(0);
    }
  });
};

/**
 * ============================================================================
 * BOOKING CALCULATION AND VALIDATION
 * ============================================================================
 */

/**
 * Calculates booking data for a specific student-skill combination.
 * Determines if the student is overbooked, underbooked, or adequately assigned.
 */
export const calculateStudentSkillBookingData = (
  studentId: string,
  skillId: string,
  lesson: LessonDetails,
  skills: any[]
): StudentSkillBookingData | null => {
  const studentAssignment = getStudentAssignmentFromSkillData(
    studentId,
    lesson
  );

  if (!studentAssignment) {
    return null;
  }

  const skill = lesson.skills?.find(s => s.skillId === skillId);
  if (!skill) {
    return null;
  }

  // Determine the student's mastery group for this skill
  let groupName = MasteryStatusPacing.NO_DATA;
  const skillGroup = skills.find(s => s.skill.skillId === skillId);
  if (skillGroup) {
    const studentGroup = skillGroup.studentGroups.find((sg: any) =>
      sg.students.some((s: any) => s.student.id === studentId)
    );
    if (studentGroup) {
      groupName = studentGroup.groupName as MasteryStatusPacing;
    }
  }

  // Get current time assigned to this student for this skill
  const timeAssigned =
    lesson.timeAssigned?.[skillId]?.[groupName]?.[studentId] || 0;

  // Calculate time balance based on skill difficulty and student mastery level
  const timeBalance = getSkillTimeBalance(
    skill.timeToMaster || 0,
    timeAssigned,
    groupName
  );

  const timeToGrowth = Number(timeBalance.timeToGrowth) || 0;

  if (timeBalance.timeToGrowth === "--") {
    return null;
  }

  // Calculate excess and shortfall with threshold buffer
  const excessTime = Math.max(
    0,
    timeAssigned - timeToGrowth - THRESHOLD_FOR_AUTO_FIX
  );
  const shortfallTime = Math.max(
    0,
    timeToGrowth - timeAssigned - THRESHOLD_FOR_AUTO_FIX
  );

  if (excessTime <= 0 && shortfallTime <= 0) {
    return null; // Student is adequately booked
  }

  return {
    studentId,
    skillId,
    excessTime,
    shortfallTime,
    assignments: studentAssignment.manifest || [],
    timeAssigned,
    timeToGrowth,
  };
};

/**
 * ============================================================================
 * INDIVIDUAL SKILL PROCESSING FUNCTIONS
 * ============================================================================
 */

/**
 * Processes an overbooked student for a specific skill by removing excess resources.
 * Maintains resource metadata integrity while reducing time allocation.
 */
const processOverbookedStudentSkill = (
  studentId: string,
  skillId: string,
  lesson: LessonDetails,
  skills: any[]
) => {
  const studentAssignment = getStudentAssignmentFromSkillData(
    studentId,
    lesson
  );
  if (!studentAssignment) return null;

  const student = lesson.students?.find(s => s.id === studentId);
  const mostCommonGrade = getMostCommonGrade(
    lesson.students.map(s => ({ grade: s.grade.toString() }))
  );
  const gradeLevel = mostCommonGrade
    ? [{ grade: mostCommonGrade.toString() }]
    : [];

  const overbookedData = calculateStudentSkillBookingData(
    studentId,
    skillId,
    lesson,
    skills
  );
  if (!overbookedData || overbookedData.excessTime <= 0) {
    return null;
  }

  // Only work with manifest items for the specific skill being processed
  let currentManifest = normalizeManifest(
    studentAssignment.manifest || []
  ).filter(item =>
    item.skills?.some((skill: any) => skill.skillId === skillId)
  );

  // Only work with teacher resources that are assigned to this specific skill
  let newTeacherResources: string[] = [];
  let newResourceMetadata: { resourceUniqueId: string; skills: string[] }[] =
    [];

  if (
    studentAssignment.resourceMetadata &&
    studentAssignment.resourceMetadata.length > 0
  ) {
    // Filter resourceMetadata to only include resources assigned to this skill, but preserve all skill associations
    const skillResourceMetadata = studentAssignment.resourceMetadata.filter(
      metadata => metadata.skills.includes(skillId)
    );

    newTeacherResources = skillResourceMetadata.map(rm => rm.resourceUniqueId);
    // Preserve all skills for each resource, not just the current skill
    newResourceMetadata = skillResourceMetadata.map(rm => ({
      resourceUniqueId: rm.resourceUniqueId,
      skills: [...rm.skills], // Deep copy to preserve all skill associations
    }));
  } else {
    // Fallback: use all teacher resources (legacy behavior)
    newTeacherResources = [...(studentAssignment.resources || [])];
    // Create metadata assuming all resources are for this skill
    newResourceMetadata = newTeacherResources.map(resourceId => ({
      resourceUniqueId: resourceId,
      skills: [skillId],
    }));
  }

  // First try to balance categories while removing resources
  const balanceResult = balanceCategoriesForRemovalBySkill(
    currentManifest,
    skillId,
    overbookedData.excessTime,
    gradeLevel,
    newTeacherResources,
    newResourceMetadata
  );

  currentManifest = balanceResult.manifest;
  newTeacherResources = balanceResult.teacherResources;
  let updatedResourceMetadata = balanceResult.resourceMetadata;
  let totalTimeRemoved = balanceResult.timeRemoved;

  // If balancing didn't remove enough, use priority-based removal
  if (totalTimeRemoved < overbookedData.excessTime) {
    const remainingToRemove = overbookedData.excessTime - totalTimeRemoved;

    const priorityResult = removeByPriorityForSkill(
      currentManifest,
      skillId,
      remainingToRemove,
      gradeLevel,
      student?.first_name + " " + student?.last_name || `Student ${studentId}`,
      newTeacherResources,
      updatedResourceMetadata
    );

    currentManifest = priorityResult.manifest;
    newTeacherResources = priorityResult.teacherResources;
    updatedResourceMetadata = priorityResult.resourceMetadata;
  }

  return {
    manifest: currentManifest,
    teacherResources: newTeacherResources,
    resourceMetadata: updatedResourceMetadata,
  };
};

/**
 * Gets available resources for a skill, filtering out duplicates and already assigned resources.
 */
const getAvailableResources = (
  skillResources: AmiraResources[],
  newTeacherResources: string[],
  currentManifest: any[],
  skillId: string
) => {
  const availableResources: any[] = [];

  skillResources.forEach(resource => {
    const storyId =
      resource.storyIds && resource.storyIds.length > 0
        ? resource.storyIds[0]
        : resource.resourceUniqueId;

    if (resource.resourceType === ResourceType.teacherResource) {
      const isDuplicate = newTeacherResources.some(
        existingId =>
          transformId(existingId) === transformId(resource.resourceUniqueId)
      );
      if (!isDuplicate) {
        availableResources.push({
          ...resource,
          targetSkillId: skillId,
        });
      }
    } else {
      const manifestEntries = getManifestByResourceType(resource, skillId);
      const isDuplicate = isResourceDuplicate(
        manifestEntries,
        currentManifest,
        skillId
      );

      if (!isDuplicate && storyId) {
        availableResources.push({
          ...resource,
          targetSkillId: skillId,
        });
      }
    }
  });

  return availableResources;
};

/**
 * Processes an underbooked student for a specific skill by adding appropriate resources.
 * Uses balanced addition followed by priority-based addition to fill shortfall.
 */
const processUnderbookedStudentSkill = (
  studentId: string,
  skillId: string,
  lesson: LessonDetails,
  skills: any[]
) => {
  const studentAssignment = getStudentAssignmentFromSkillData(
    studentId,
    lesson
  );
  if (!studentAssignment) return null;

  const student = lesson.students?.find(s => s.id === studentId);
  const mostCommonGrade = getMostCommonGrade(
    lesson.students.map(s => ({ grade: s.grade.toString() }))
  );
  const gradeLevel = mostCommonGrade
    ? [{ grade: mostCommonGrade.toString() }]
    : [];

  const underbookedData = calculateStudentSkillBookingData(
    studentId,
    skillId,
    lesson,
    skills
  );
  if (!underbookedData || underbookedData.shortfallTime <= 0) {
    return null;
  }

  // Only work with manifest items for the specific skill being processed
  let currentManifest = normalizeManifest(studentAssignment.manifest || []);

  // Only work with teacher resources that are assigned to this specific skill
  let newTeacherResources: string[] = [];
  let newResourceMetadata: { resourceUniqueId: string; skills: string[] }[] =
    [];

  if (
    studentAssignment.resourceMetadata &&
    studentAssignment.resourceMetadata.length > 0
  ) {
    // Filter resourceMetadata to only include resources assigned to this skill, but preserve all skill associations
    const skillResourceMetadata = studentAssignment.resourceMetadata.filter(
      metadata => metadata.skills.includes(skillId)
    );

    newTeacherResources = skillResourceMetadata.map(rm => rm.resourceUniqueId);
    // Preserve all skills for each resource, not just the current skill
    // Use the original resourceMetadata to ensure all skills are preserved
    newResourceMetadata = skillResourceMetadata.map(rm => {
      const originalMeta = studentAssignment.resourceMetadata?.find(
        orig =>
          transformId(orig.resourceUniqueId) ===
          transformId(rm.resourceUniqueId)
      );
      return {
        resourceUniqueId: rm.resourceUniqueId,
        skills: originalMeta ? [...originalMeta.skills] : [...rm.skills], // Use original skills to prevent data loss
      };
    });
  } else {
    // Fallback: use all teacher resources (legacy behavior)
    newTeacherResources = [...(studentAssignment.resources || [])];
    // Create metadata assuming all resources are for this skill
    newResourceMetadata = newTeacherResources.map(resourceId => ({
      resourceUniqueId: resourceId,
      skills: [skillId],
    }));
  }

  const skill = lesson.skills?.find(s => s.skillId === skillId);
  if (!skill) return null;

  // Get available resources for this skill
  const skillResources = getSkillResources({
    skillId: skillId,
    skillResources: lesson.skillResources,
    lessonName: lesson.lessonName || lesson.name,
    curriculumId: lesson.curriculumId,
    lessonSkills: lesson.skills
      .filter(s => s.skillType === SkillType.FOCUS)
      .map(s => ({
        skillId: s.skillId || "",
        displayName: s.displayName || "",
      })),
  });

  let availableResources = getAvailableResources(
    skillResources,
    newTeacherResources,
    currentManifest,
    skillId
  );

  if (availableResources.length === 0) {
    return null; // No resources available for this skill
  }

  // First try to add resources while maintaining category balance
  const balanceResult = balanceCategoriesForAdditionBySkill(
    currentManifest,
    availableResources,
    skillId,
    underbookedData.shortfallTime,
    gradeLevel,
    newTeacherResources,
    lesson.skills.length === 1,
    newResourceMetadata
  );

  currentManifest = balanceResult.manifest;
  newTeacherResources = balanceResult.teacherResources;
  newResourceMetadata = balanceResult.resourceMetadata;
  let remainingShortfall = balanceResult.remainingShortfall;

  // If there's still a shortfall, add resources by priority
  if (remainingShortfall > 0) {
    // balanceCategoriesForAdditionBySkill adds resources to the manifest and teacher resources list
    // so we need to filter out resources that are already in the manifest and teacher resources list
    availableResources = getAvailableResources(
      skillResources,
      newTeacherResources,
      currentManifest,
      skillId
    );
    const addByPriorityResult = addByPriorityForSkill(
      currentManifest,
      availableResources,
      skillId,
      remainingShortfall,
      gradeLevel,
      newTeacherResources,
      lesson.skills.length === 1,
      newResourceMetadata
    );
    currentManifest = addByPriorityResult.manifest;
    newTeacherResources = addByPriorityResult.teacherResources;
    newResourceMetadata = addByPriorityResult.resourceMetadata;
  }

  return {
    manifest: currentManifest,
    teacherResources: newTeacherResources,
    resourceMetadata: newResourceMetadata,
  };
};

/**
 * ============================================================================
 * GROUP PROCESSING FUNCTIONS
 * ============================================================================
 */

/**
 * Processes a skill for all students who need adjustments (either overbooked or underbooked).
 * Filters out students whose skills have been manually modified by teachers.
 */
const processSkillForAllStudents = (
  skillId: string,
  lesson: LessonDetails,
  skills: any[],
  isOverbooked: boolean
) => {
  const skill = lesson.skills?.find(s => s.skillId === skillId);
  if (!skill) return [];

  // Filter students who need this skill processed and haven't been manually modified
  const studentsNeedingSkill =
    lesson.students?.filter(student => {
      // Check if this specific skill has been user-modified (TEACHER_ASSIGNED tag)
      const studentAssignment = lesson.studentAssignments.find(
        sa => sa.entityId === student.id
      );
      if (
        studentAssignment &&
        studentAssignment.entityType === Entity.STUDENT
      ) {
        // Check if this skill has user-assigned or auto-fix tags (indicating it shouldn't be auto-fixed)
        const hasUserModifiedSkill = studentAssignment.manifest?.some(
          m =>
            m.skills?.some(s => s.skillId === skillId) &&
            m.contentTags?.some(
              tag =>
                tag === `${skillId}-TEACHER_ASSIGNED` ||
                tag === `${skillId}-AUTOFIX`
            )
        );

        if (hasUserModifiedSkill) {
          return false; // Don't auto-fix this specific skill for this student
        }
      }

      // Check if student actually needs adjustment for this skill
      const bookingData = calculateStudentSkillBookingData(
        student.id,
        skillId,
        lesson,
        skills
      );
      return (
        bookingData &&
        (isOverbooked
          ? bookingData.excessTime > 0
          : bookingData.shortfallTime > 0)
      );
    }) || [];

  const updatedManifests: Array<{
    studentId: string;
    manifest: any[];
    teacherResources: string[];
    resourceMetadata?: { resourceUniqueId: string; skills: string[] }[];
  }> = [];

  // Process each student that needs adjustment
  for (const student of studentsNeedingSkill) {
    const studentAssignment = getStudentAssignmentFromSkillData(
      student.id,
      lesson
    );
    if (!studentAssignment) continue;

    const bookingData = calculateStudentSkillBookingData(
      student.id,
      skillId,
      lesson,
      skills
    );
    if (!bookingData) continue;

    let currentManifest = normalizeManifest(studentAssignment.manifest || []);
    let newTeacherResources = [...(studentAssignment.resources || [])];
    let newResourceMetadata = [...(studentAssignment.resourceMetadata || [])];
    let hasChanges = false;

    // Process based on whether student is overbooked or underbooked
    if (isOverbooked && bookingData.excessTime > 0) {
      const processedManifest = processOverbookedStudentSkill(
        student.id,
        skillId,
        lesson,
        skills
      );
      if (processedManifest) {
        currentManifest = processedManifest.manifest;
        newTeacherResources = processedManifest.teacherResources;
        newResourceMetadata = processedManifest.resourceMetadata || [];
        hasChanges = true;
      }
    } else if (!isOverbooked && bookingData.shortfallTime > 0) {
      const processedManifest = processUnderbookedStudentSkill(
        student.id,
        skillId,
        lesson,
        skills
      );
      if (processedManifest) {
        currentManifest = processedManifest.manifest;
        newTeacherResources = processedManifest.teacherResources;
        newResourceMetadata = processedManifest.resourceMetadata || [];
        hasChanges = true;
      }
    }

    if (hasChanges) {
      updatedManifests.push({
        studentId: student.id,
        manifest: currentManifest,
        teacherResources: newTeacherResources,
        resourceMetadata: newResourceMetadata,
      });
    }
  }

  return updatedManifests;
};

/**
 * ============================================================================
 * MAIN HANDLER FUNCTIONS
 * ============================================================================
 */

/**
 * Main handler for processing overbooked students across all skills.
 * Merges results from individual skill processing to avoid conflicts.
 */
export const handleOverbookedStudents = async (
  overbookedStudentIds: string[],
  lesson: LessonDetails,
  dispatch: any,
  skills: any[],
  skillsOrder: string[]
) => {
  const studentManifests = new Map<string, any[]>();
  const studentTeacherResources = new Map<string, string[]>();
  const studentResourceMetadata = new Map<
    string,
    { resourceUniqueId: string; skills: string[] }[]
  >();

  // Process each skill independently
  lesson.skills?.forEach(skill => {
    if (!skill.skillId) return;
    const skillManifests = processSkillForAllStudents(
      skill.skillId,
      lesson,
      skills,
      true
    );

    // Merge results from this skill with accumulated results
    skillManifests.forEach(
      ({ studentId, manifest, teacherResources, resourceMetadata }) => {
        const existingManifest = studentManifests.get(studentId) || [];
        const existingTeacherResources =
          studentTeacherResources.get(studentId) || [];
        const existingResourceMetadata =
          studentResourceMetadata.get(studentId) || [];

        // Filter out old entries for this skill and add new ones
        const filteredExistingManifest = existingManifest.filter(
          entry =>
            !entry.skills?.some((skill: any) => skill.skillId === skill.skillId)
        );
        const filteredExistingTeacherResources =
          existingTeacherResources.filter(
            resource => !teacherResources.includes(resource)
          );
        const filteredCurrentManifest = manifest.filter(item =>
          item.skills?.some((skill: any) => skill.skillId === skill.skillId)
        );

        const combinedManifest = [
          ...filteredExistingManifest,
          ...filteredCurrentManifest,
        ];
        const combinedTeacherResources = [
          ...filteredExistingTeacherResources,
          ...teacherResources,
        ];

        // Combine resource metadata with deep cloning to avoid frozen array issues
        const combinedResourceMetadata = existingResourceMetadata.map(rm => ({
          resourceUniqueId: rm.resourceUniqueId,
          skills: [...rm.skills], // Create a new array to avoid frozen array issues
        }));
        if (resourceMetadata) {
          resourceMetadata.forEach(newMeta => {
            const existingMeta = combinedResourceMetadata.find(
              rm =>
                transformId(rm.resourceUniqueId) ===
                transformId(newMeta.resourceUniqueId)
            );
            if (existingMeta) {
              // Merge skills, avoiding duplicates
              newMeta.skills.forEach(skillId => {
                if (!existingMeta.skills.includes(skillId)) {
                  existingMeta.skills.push(skillId);
                }
              });
            } else {
              combinedResourceMetadata.push(newMeta);
            }
          });
        }

        studentManifests.set(studentId, combinedManifest);
        studentTeacherResources.set(studentId, combinedTeacherResources);
        studentResourceMetadata.set(studentId, combinedResourceMetadata);
      }
    );
  });

  // Convert maps to array format for assignment update
  const updatedManifests = Array.from(studentManifests.entries()).map(
    ([studentId, manifest]) => ({
      studentId,
      manifest,
      teacherResources: studentTeacherResources.get(studentId) || [],
      resourceMetadata: studentResourceMetadata.get(studentId) || [],
    })
  );

  await updateStudentManifests(updatedManifests, lesson, dispatch, skillsOrder);
  return studentManifests;
};

/**
 * Main handler for processing underbooked students across all skills.
 * Carefully merges results to preserve existing skill associations while adding new resources.
 */
export const handleUnderbookedStudents = (
  underbookedStudentIds: string[],
  lesson: LessonDetails,
  dispatch: any,
  skills: any[],
  skillsOrder: string[],
  existingManifests?: Map<string, any[]>
) => {
  const studentManifests = existingManifests || new Map<string, any[]>();
  const studentTeacherResources = new Map<string, string[]>();
  const studentResourceMetadata = new Map<
    string,
    { resourceUniqueId: string; skills: string[] }[]
  >();

  lesson.skills?.forEach(skill => {
    if (!skill.skillId) return;
    const skillManifests = processSkillForAllStudents(
      skill.skillId,
      lesson,
      skills,
      false
    );

    skillManifests.forEach(
      ({ studentId, manifest, teacherResources, resourceMetadata }) => {
        // Always start with the original assignment data to avoid corruption from previous skill processing
        const originalAssignment = getStudentAssignmentFromSkillData(
          studentId,
          lesson
        );
        const originalManifest = originalAssignment?.manifest || [];
        const originalTeacherResources = originalAssignment?.resources || [];
        const originalResourceMetadata =
          originalAssignment?.resourceMetadata || [];

        // Get any previously processed data for this student
        const existingManifest =
          studentManifests.get(studentId) || originalManifest;
        const existingTeacherResources =
          studentTeacherResources.get(studentId) || originalTeacherResources;
        const existingResourceMetadata =
          studentResourceMetadata.get(studentId) || originalResourceMetadata;

        // Filter out items for the current skill from the existing manifest
        const filteredExistingManifest = existingManifest.filter(
          entry => !entry.skills?.some((s: any) => s.skillId === skill.skillId)
        );

        // Filter the new manifest to only include items for the current skill
        const filteredCurrentManifest = manifest.filter(item =>
          item.skills?.some((s: any) => s.skillId === skill.skillId)
        );

        const combinedManifest = [
          ...filteredExistingManifest,
          ...filteredCurrentManifest,
        ];

        const combinedTeacherResources = [
          ...new Set([...existingTeacherResources, ...teacherResources]),
        ];

        // Combine resource metadata - always start with the original to preserve all skill associations
        // Deep clone to avoid modifying frozen objects
        const combinedResourceMetadata = originalResourceMetadata.map(rm => ({
          resourceUniqueId: rm.resourceUniqueId,
          skills: [...rm.skills], // Create a new array to avoid frozen array issues
        }));

        // Add any previously processed metadata from other skills
        if (studentResourceMetadata.has(studentId)) {
          const previouslyProcessedMetadata =
            studentResourceMetadata.get(studentId) || [];
          previouslyProcessedMetadata.forEach(prevMeta => {
            const existing = combinedResourceMetadata.find(
              rm =>
                transformId(rm.resourceUniqueId) ===
                transformId(prevMeta.resourceUniqueId)
            );
            if (existing) {
              // Merge skills from previously processed metadata
              prevMeta.skills.forEach(skillId => {
                if (!existing.skills.includes(skillId)) {
                  existing.skills.push(skillId);
                }
              });
            } else {
              combinedResourceMetadata.push(prevMeta);
            }
          });
        }

        // Add new metadata from current skill processing
        if (resourceMetadata) {
          resourceMetadata.forEach(newMeta => {
            const existingMeta = combinedResourceMetadata.find(
              rm =>
                transformId(rm.resourceUniqueId) ===
                transformId(newMeta.resourceUniqueId)
            );
            if (existingMeta) {
              // Merge skills, avoiding duplicates
              newMeta.skills.forEach(skillId => {
                if (!existingMeta.skills.includes(skillId)) {
                  existingMeta.skills.push(skillId);
                }
              });
            } else {
              combinedResourceMetadata.push(newMeta);
            }
          });
        }

        studentManifests.set(studentId, combinedManifest);
        studentTeacherResources.set(studentId, combinedTeacherResources);
        studentResourceMetadata.set(studentId, combinedResourceMetadata);
      }
    );
  });

  const updatedManifests = Array.from(studentManifests.entries()).map(
    ([studentId, manifest]) => ({
      studentId,
      manifest,
      teacherResources: studentTeacherResources.get(studentId) || [],
      resourceMetadata: studentResourceMetadata.get(studentId) || [],
    })
  );

  return updateStudentManifests(
    updatedManifests,
    lesson,
    dispatch,
    skillsOrder
  );
};

/**
 * Handler for processing students who are both overbooked and underbooked across different skills.
 * Applies both reduction and addition logic as needed for each student-skill combination.
 */
export const handleBothOverAndUnderbooked = async (
  overbookedStudentIds: string[],
  underbookedStudentIds: string[],
  lesson: LessonDetails,
  dispatch: any,
  skills: any[],
  skillsOrder: string[]
) => {
  const studentManifests = new Map<string, any[]>();
  const studentTeacherResources = new Map<string, string[]>();
  const studentResourceMetadata = new Map<
    string,
    { resourceUniqueId: string; skills: string[] }[]
  >();

  lesson.skills?.forEach(skill => {
    if (!skill.skillId) return;
    const skillId = skill.skillId;

    const studentsNeedingSkill =
      lesson.students?.filter(student => {
        const bookingData = calculateStudentSkillBookingData(
          student.id,
          skillId,
          lesson,
          skills
        );
        return (
          bookingData &&
          ((overbookedStudentIds.includes(student.id) &&
            bookingData.excessTime > 0) ||
            (underbookedStudentIds.includes(student.id) &&
              bookingData.shortfallTime > 0))
        );
      }) || [];

    for (const student of studentsNeedingSkill) {
      const studentAssignment = getStudentAssignmentFromSkillData(
        student.id,
        lesson
      );
      if (!studentAssignment) continue;

      const mostCommonGrade = getMostCommonGrade(
        lesson.students.map(s => ({ grade: s.grade.toString() }))
      );
      const gradeLevel = mostCommonGrade
        ? [{ grade: mostCommonGrade.toString() }]
        : [];

      const bookingData = calculateStudentSkillBookingData(
        student.id,
        skillId,
        lesson,
        skills
      );
      if (!bookingData) continue;

      let currentManifest = normalizeManifest(studentAssignment.manifest || []);
      let newTeacherResources = [...(studentAssignment.resources || [])];
      let newResourceMetadata = [...(studentAssignment.resourceMetadata || [])];
      let hasChanges = false;

      // Apply overbooked processing if needed
      if (
        overbookedStudentIds.includes(student.id) &&
        bookingData.excessTime > 0
      ) {
        const processedManifest = processOverbookedStudentSkill(
          student.id,
          skillId,
          lesson,
          skills
        );

        if (processedManifest) {
          currentManifest = processedManifest.manifest;
          newTeacherResources = processedManifest.teacherResources;
          newResourceMetadata = processedManifest.resourceMetadata || [];
          hasChanges = true;
        }
      }

      // Apply underbooked processing if needed
      if (
        underbookedStudentIds.includes(student.id) &&
        bookingData.shortfallTime > 0
      ) {
        const processedManifest = processUnderbookedStudentSkill(
          student.id,
          skillId,
          lesson,
          skills
        );

        if (processedManifest) {
          currentManifest = processedManifest.manifest;
          newTeacherResources = processedManifest.teacherResources;
          newResourceMetadata = processedManifest.resourceMetadata || [];
          hasChanges = true;
        }
      }

      if (hasChanges) {
        // Merge with existing results, preserving data from other skills
        const existingManifest =
          studentManifests.get(student.id) ||
          getStudentAssignmentFromSkillData(student.id, lesson)?.manifest ||
          [];
        const existingTeacherResources =
          studentTeacherResources.get(student.id) ||
          getStudentAssignmentFromSkillData(student.id, lesson)?.resources ||
          [];
        const existingResourceMetadata =
          studentResourceMetadata.get(student.id) ||
          getStudentAssignmentFromSkillData(student.id, lesson)
            ?.resourceMetadata ||
          [];

        const filteredExistingManifest = existingManifest.filter(
          entry => !entry.skills?.some((s: any) => s.skillId === skillId)
        );
        const filteredCurrentManifest = currentManifest.filter(item =>
          item.skills?.some((s: any) => s.skillId === skillId)
        );

        const combinedManifest = [
          ...filteredExistingManifest,
          ...filteredCurrentManifest,
        ];

        const combinedTeacherResources = [
          ...new Set([...existingTeacherResources, ...newTeacherResources]),
        ];

        // Combine resource metadata with deep cloning to avoid frozen array issues
        const combinedResourceMetadata = existingResourceMetadata.map(rm => ({
          resourceUniqueId: rm.resourceUniqueId,
          skills: [...rm.skills], // Create a new array to avoid frozen array issues
        }));
        if (newResourceMetadata) {
          newResourceMetadata.forEach(newMeta => {
            const existingMeta = combinedResourceMetadata.find(
              rm =>
                transformId(rm.resourceUniqueId) ===
                transformId(newMeta.resourceUniqueId)
            );
            if (existingMeta) {
              // Merge skills, avoiding duplicates
              newMeta.skills.forEach(skillId => {
                if (!existingMeta.skills.includes(skillId)) {
                  existingMeta.skills.push(skillId);
                }
              });
            } else {
              combinedResourceMetadata.push(newMeta);
            }
          });
        }

        studentManifests.set(student.id, combinedManifest);
        studentTeacherResources.set(student.id, combinedTeacherResources);
        studentResourceMetadata.set(student.id, combinedResourceMetadata);
      }
    }
  });

  const updatedManifests = Array.from(studentManifests.entries()).map(
    ([studentId, manifest]) => ({
      studentId,
      manifest,
      teacherResources: studentTeacherResources.get(studentId) || [],
      resourceMetadata: studentResourceMetadata.get(studentId) || [],
    })
  );

  await updateStudentManifests(updatedManifests, lesson, dispatch, skillsOrder);

  return {
    overbookedCount: overbookedStudentIds.length,
    underbookedCount: underbookedStudentIds.length,
  };
};
