import { StyleSheet, View } from "react-native";
import { GradientContainer } from "../components/GradientContainer";
import { InfoCard, InfoItem } from "../components/InfoCard";
import { InfoHeader } from "../components/InfoHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenTitle } from "../components/ScreenTitle";

export default function AppInfoScreen2({ navigation }) {
  return (
    <GradientContainer scrollable={false}>
      <View style={styles.content}>
        <InfoHeader style={{ marginBottom: 60 }} />

        <ScreenTitle style={{ fontSize: 40 }}>What can I do?</ScreenTitle>

        <InfoCard>
          <InfoItem
            iconName="layers-outline"
            title="Structure Practice"
            description={`Create and organize your routines using\nFocus Blocks.`}
          />

          <InfoItem
            iconName="globe-outline"
            title="Share & Discover"
            description={`Browse shared Focus Block templates\nfrom the community.`}
          />

          <InfoItem
            iconName="musical-notes-outline"
            title="Stay Motivated"
            description="Track your progress and stay consistent."
          />
        </InfoCard>

        <PrimaryButton
          title="Got it - Let's Start!"
          onPress={() => navigation.navigate("StartingPoint")}
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
});