import { 
  clampBpm,
  getBeatIntervalMs,
  getBeatInBar,
  adjustStartTimeForBpmChange,
  getMissedTicks,
  } from "../src/utils/metronomeUtils";


describe("metronomeUtils", () => {
  /**
   * 
   * clampBPM 
   * 
   **/
  test("clampBpm keeps returns same value when the bpm is valid ", () => {
    // Arrange
    const bpm = 120
    // Act
    const result = clampBpm(bpm)
    // Assert
    expect(result).toBe(120);
  });

  test("clampBpm keeps returns 240 when the bpm is too high ", () => {
    // Arrange
    const bpm = 300
    // Act
    const result = clampBpm(bpm)
    // Assert
    expect(result).toBe(240);
  });

  test("clampBpm keeps returns 40 when the bpm is too low ", () => {
    // Arrange
    const bpm = 10
    // Act
    const result = clampBpm(bpm)
    // Assert
    expect(result).toBe(40);
  });


  /**
   * 
   * getBeatIntervalMs 
   * 
   **/
  test("getBeatIntervalMs converts bpm to milliseconds", () => {
    // Arrange
      const bpm = 120
    // Act
    const result = getBeatIntervalMs(bpm);
    // Assert
    expect(result).toBe(500)
  });


  /*
   getBeatInBar
  */
  test("getBeatInBar returns 1 for tick 5 in 4/4", () => {
    // Arrange
    // Act
    const result = getBeatInBar(5, 4)
    // Assert
    expect(result).toBe(1);
  });

  test("getBeatInBar wraps to 0 at the start of a new bar", () => {
    // Act
    const result = getBeatInBar(4, 4)
    // Assert
    expect(result).toBe(0);
  });


   /**
   * 
   * adjustStartTimeForBpmChange 
   * 
   **/

  test("adjustStartTimeForBpmChange preserves phase", () => {
    // Arrange
     const input = {
      currentTime: 2000,
      startTime: 0,
      tick: 2,
      prevInterval: 500,
      newInterval: 400,
    };
    // Act
    const result = adjustStartTimeForBpmChange(input);
    // Assert
      expect(typeof result).toBe("number");
      expect(result).not.toBe(0);
  });


  /**
   * 
   * getMissedTicks 
   * 
   **/

  test("getMissedTicks returns how many ticks were missed", () => {
    // Arrange
    const input = {
      currentTime: 1000,
      nextTime: 1000,
      interval: 500,
    };
    // Act
    const result = getMissedTicks(input);
    // Assert
      expect(result).toBe(0);
  });

  test("getMissedTicks returns correct number when late", () => {
  const input = {
    currentTime: 2000,
    nextTime: 1000,
    interval: 500,
  };

  const result = getMissedTicks(input);

  expect(result).toBe(2);
});
});