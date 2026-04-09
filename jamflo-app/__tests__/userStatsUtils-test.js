import { 
  calculateStreakFromHistory,
  } from "../src/utils/userStatsUtils";

describe("calculateStreakFromHistory", () => {
  /**
   * 
   * calculateStreakFromHistory
   * 
  */
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-09T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  test("calculateStreakFromHistory returns 0 when there is no practice histroy ", () => {
    // Arrange
    const history = {};
      // Act
    const result = calculateStreakFromHistory(history);
    // Assert
    expect(result).toBe(0);
  });

  test("calculateStreakFromHistory returns correct streak for recent consecutive days of activity", () => {
    // Arrange
    const history = {
    "2026-04-07": 10,
    "2026-04-08": 20,
    "2026-04-09": 30,
  };


    // Act
    const result = calculateStreakFromHistory(history);
    // Assert
    expect(result).toBe(3);
  });

  test("calculateStreakFromHistory returns 0 when the latest practice is too old/streak is broken", () => {
    // Arrange
    const history = {
      "2026-04-05": 10,
      "2026-04-06": 20,
    };

    // Act
    const result = calculateStreakFromHistory(history);
    // Assert
    expect(result).toBe(0);
  });

});