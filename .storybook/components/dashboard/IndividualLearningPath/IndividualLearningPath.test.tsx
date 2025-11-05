import React, { act } from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { render } from "react-dom";

// Mock all the problematic dependencies
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

jest.mock("@/hooks/useSelectedClassroom", () => ({
  __esModule: true,
  default: () => ({ classroomId: "test-classroom-id" }),
}));

// Mock the GraphQL client with proper structure
jest.mock("@/services/graphql/LegacyGraphQLClient", () => ({
  __esModule: true,
  graphQLClient: {
    setEndpoint: jest.fn(),
    query: jest.fn().mockResolvedValue({
      data: {
        usageData: {
          startDate: "2023-01-01",
          endDate: "2023-01-07",
          usageForProducts: [
            {
              productValue: "READING",
              usageStatusPercentages: [
                { status: "UNDER", count: 5, percent: 50 },
                { status: "ACTIVE", count: 3, percent: 30 },
                { status: "MET_GOAL", count: 2, percent: 20 },
              ],
            },
          ],
        },
      },
    }),
  },
  default: {
    setEndpoint: jest.fn(),
    query: jest.fn().mockResolvedValue({
      data: {
        usageData: {
          startDate: "2023-01-01",
          endDate: "2023-01-07",
          usageForProducts: [
            {
              productValue: "READING",
              usageStatusPercentages: [
                { status: "UNDER", count: 5, percent: 50 },
                { status: "ACTIVE", count: 3, percent: 30 },
                { status: "MET_GOAL", count: 2, percent: 20 },
              ],
            },
          ],
        },
      },
    }),
  },
}));

jest.mock("@/components/Global", () => ({
  ArrowIcon: () => <span>ArrowIcon</span>,
  LoadingFailure: ({ onReload }: { onReload: () => void }) => (
    <div data-testid="loading-failure" onClick={onReload}>
      Loading Failure
    </div>
  ),
}));

jest.mock("@/images/icons/calendar-day.svg", () => "calendar-icon");

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    ISTATION_USAGE_API_URL: "/graphql",
    ISTATION_PROGRESS_REPORT_URL: "https://secure.app.amiralearning.com/Report/ProgressReport/",
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Import the actual component
import IndividualLearningPath from "./IndividualLearningPath";

describe("IndividualLearningPath", () => {
  it("renders the correct counts for UNDER, ACTIVE, and MET_GOAL", async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    await act(async () => {
      render(
        <MemoryRouter>
          <IndividualLearningPath />
        </MemoryRouter>,
        container
      );
    });

    // Wait for the async data to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const h1Elements = container.querySelectorAll('h1');
    expect(h1Elements.length).toBeGreaterThan(0);
    
    const h1Texts = Array.from(h1Elements).map(el => el.textContent);
    expect(h1Texts).toContain("5"); // UNDER count
    expect(h1Texts).toContain("3"); // ACTIVE count  
    expect(h1Texts).toContain("2"); // MET_GOAL count
    
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  it("renders the correct link with classroomId", async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    await act(async () => {
      render(
        <MemoryRouter>
          <IndividualLearningPath />
        </MemoryRouter>,
        container
      );
    });

    // Wait for the component to load data
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const expectedUrl = "https://secure.app.amiralearning.com/Report/ProgressReport/test-classroom-id";
    const linkElement = container.querySelector('a');

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', expectedUrl);
    
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });
});
