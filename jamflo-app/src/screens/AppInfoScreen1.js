import { StyleSheet, Text, View } from "react-native";
import { GradientContainer } from "../components/GradientContainer";
import { InfoCard, InfoItem } from "../components/InfoCard";
import { InfoHeader } from "../components/InfoHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenTitle } from "../components/ScreenTitle";

export default function AppInfoScreen1({ navigation }) {
  return (
    <GradientContainer scrollable={false}>
      <View style={styles.content}>
        <InfoHeader style={{ marginBottom: 60 }} />

        <ScreenTitle>How does{"\n"}JamFlo work?</ScreenTitle>

        <InfoCard>
          <InfoItem
            iconName="clipboard-outline"
            title="Routines"
            boldText={
              <>
                A routine is made up of <Text style={styles.bold}>one</Text> or{" "}
                <Text style={styles.bold}>more{"\n"}Focus Blocks</Text>.
              </>
            }
          />

          <InfoItem
            iconName="cube-outline"
            title="Focus Blocks"
            boldText={
              <>
                Each Focus Block contains several{" "}
                <Text style={styles.bold}>Exercises</Text> built around a single{" "}
                <Text style={styles.bold}>skill goal</Text> (e.g Warm-Up, Scales,
                Chords)
              </>
            }
          />

          <InfoItem
            iconName="git-compare-outline"
            title="Mix & Match"
            description="Use the Focus Blocks to create your perfect practice routine."
          />
        </InfoCard>

        <PrimaryButton
          title="Continue"
          onPress={() => navigation.navigate("AppInfo2")}
        />
      </View>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  bold: {
    fontWeight: "700",
  },
});