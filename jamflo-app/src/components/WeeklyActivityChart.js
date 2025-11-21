import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';

export const WeeklyActivityChart = ({ data }) => {
  // data format: [{ day: "Mon", value: 20 }, ...]
  
  return (
    <LinearGradient
      colors={["#667EEA", "#764BA2"]}
      style={styles.chartCard}
    >
      <Text style={styles.chartTitle}>📊 Weekly Activity</Text>

      <Svg height="180" width="320">
        {/* Y-axis labels */}
        <SvgText x="10" y="20" fill="#fff" fontSize="10">50</SvgText>
        <SvgText x="10" y="60" fill="#fff" fontSize="10">40</SvgText>
        <SvgText x="10" y="100" fill="#fff" fontSize="10">30</SvgText>
        <SvgText x="10" y="140" fill="#fff" fontSize="10">20</SvgText>
        <SvgText x="10" y="165" fill="#fff" fontSize="10">10</SvgText>

        {/* Grid lines */}
        <Line x1="30" y1="20" x2="310" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <Line x1="30" y1="60" x2="310" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <Line x1="30" y1="100" x2="310" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <Line x1="30" y1="140" x2="310" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <Line x1="30" y1="165" x2="310" y2="165" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* Bars */}
        {data.map((item, index) => (
          <Rect
            key={index}
            x={index * 40 + 38}
            y={165 - item.value * 2.8}
            width="26"
            height={item.value * 2.8}
            rx="6"
            fill="#4ECDC4"
          />
        ))}

        {/* X-axis labels */}
        {data.map((item, index) => (
          <SvgText 
            key={item.day} 
            x={index * 40 + 51} 
            y="178" 
            fill="#fff" 
            fontSize="11"
            textAnchor="middle"
          >
            {item.day}
          </SvgText>
        ))}
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
    color: "#fff" 
  },
});