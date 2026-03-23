import React from "react";
import { Text, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect, Text as SvgText, Line } from "react-native-svg";

export const WeeklyActivityChart = ({ data = [] }) => {
  const { width } = useWindowDimensions();

  const cardWidth = width - 40;
  const chartWidth = cardWidth - 40;
  const chartHeight = 190;

  const leftPad = 34;
  const rightPad = 10;
  const topPad = 16;
  const bottomPad = 28;

  const plotWidth = chartWidth - leftPad - rightPad;
  const plotHeight = chartHeight - topPad - bottomPad;

  const safeData =
    Array.isArray(data) && data.length
      ? data
      : [
          { day: "Mon", value: 0 },
          { day: "Tue", value: 0 },
          { day: "Wed", value: 0 },
          { day: "Thu", value: 0 },
          { day: "Fri", value: 0 },
          { day: "Sat", value: 0 },
          { day: "Sun", value: 0 },
        ];

  const maxValue = Math.max(...safeData.map((d) => Number(d.value || 0)), 10);
  const step = plotWidth / safeData.length;
  const barWidth = Math.min(26, step * 0.62);

  const gridTicks = 5;
  const tickValues = Array.from({ length: gridTicks }, (_, i) =>
    Math.round((maxValue / gridTicks) * (gridTicks - i))
  );

  return (
    <LinearGradient
      colors={["#667EEA", "#764BA2"]}
      style={styles.chartCard}
    >
      <Text style={styles.chartTitle}>📊 Weekly Activity</Text>

      <Svg height={chartHeight} width={chartWidth}>
        {tickValues.map((tick, i) => {
          const y = topPad + (plotHeight / (gridTicks - 1)) * i;
          return (
            <React.Fragment key={`tick-${tick}-${i}`}>
              <SvgText
                x={leftPad - 12}
                y={y + 4}
                fill="#fff"
                fontSize="10"
                textAnchor="end"
              >
                {tick}
              </SvgText>
              <Line
                x1={leftPad}
                y1={y}
                x2={leftPad + plotWidth}
                y2={y}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
            </React.Fragment>
          );
        })}

        {safeData.map((item, index) => {
          const value = Number(item.value || 0);
          const barHeight =
            maxValue > 0 ? (value / maxValue) * (plotHeight - 6) : 0;

          const x = leftPad + index * step + (step - barWidth) / 2;
          const y = topPad + plotHeight - barHeight;

          return (
            <React.Fragment key={`${item.day}-${index}`}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(0, barHeight)}
                rx="6"
                fill="#22D3EE"
              />
              <SvgText
                x={x + barWidth / 2}
                y={topPad + plotHeight + 18}
                fill="#fff"
                fontSize="11"
                textAnchor="middle"
              >
                {item.day}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    paddingTop: 15,
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 15,
    color: "#fff",
  },
});