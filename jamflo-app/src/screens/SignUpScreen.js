import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthInput } from '../components/AuthInput';
import { GradientContainer } from '../components/GradientContainer';
import { IntroHeader } from '../components/IntroHeader';
import { auth } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState([]);
  const [formMessage, setFormMessage] = useState(null);

  // Password strength evaluation + requirement checklist
  const evaluateStrength = (pass) => {
    let strength = "";
    let requirements = [];

    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[^A-Za-z0-9]/.test(pass);
    const longEnough = pass.length >= 6;

    if (!hasUpper) requirements.push("Missing uppercase letter");
    if (!hasLower) requirements.push("Missing lowercase letter");
    if (!hasNumber) requirements.push("Missing number");
    if (!hasSymbol) requirements.push("Missing symbol (e.g. !@#$)");
    if (!longEnough) requirements.push("Password too short (min 6)");

    if (pass.length < 6) {
      strength = "Too short";
    } else if (hasUpper && hasLower && hasNumber && hasSymbol) {
      strength = "Strong";
    } else if (pass.length >= 8 && hasUpper && hasLower && hasNumber) {
      strength = "Medium";
    } else {
      strength = "Weak";
    }

    setPasswordStrength(strength);
    setPasswordRequirements(requirements);
  };

  const handleSignUp = async () => {
    setFormMessage(null); // Reset message

    if (!username || !email || !password || !confirmPassword) {
      setFormMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (password !== confirmPassword) {
      setFormMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (passwordRequirements.length > 0) {
      setFormMessage({ type: "error", text: "Password does not meet requirements." });
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: username });

      // Reload ensures displayName updates immediately
      await res.user.reload();
      await auth.currentUser.reload();

      // AppNavigator will automatically show onboarding screens
      // because hasCompletedOnboarding will be false for new users
      
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setFormMessage({
          type: "error",
          text: "This email is already registered. Please log in instead."
        });
        return;
      }
      setFormMessage({ type: "error", text: err.message });
    }
  };

  return (
    <GradientContainer>
      <IntroHeader />

      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>
        to get started on your guitar practice journey
      </Text>

      <AuthInput 
        label="Username"
        value={username}
        onChangeText={text => setUsername(text)}
        placeholder="Enter username"
      />

      <AuthInput 
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      <AuthInput 
        label="Password"
        value={password}
        onChangeText={(pwd) => {
          setPassword(pwd);
          evaluateStrength(pwd);
        }}
        placeholder="Enter password"
        secureTextEntry
      />

      {/* Password Strength Indicator */}
      {password !== "" && (
        <View style={styles.passwordFeedbackBox}>
          <Text
            style={[
              styles.passwordStrengthText,
              passwordStrength === "Strong"
                ? styles.strongText
                : passwordStrength === "Medium"
                ? styles.mediumText
                : styles.weakText,
            ]}
          >
            Strength: {passwordStrength}
          </Text>

          {passwordRequirements.length > 0 && (
            <View style={styles.requirementsList}>
              {passwordRequirements.map((req, index) => (
                <Text key={index} style={styles.requirementText}>
                  • {req}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      <AuthInput 
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm password"
        secureTextEntry
      />

      <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
        <Text style={styles.signUpBtnText}>Sign Up</Text>
      </TouchableOpacity>

      {/* INLINE FORM FEEDBACK MESSAGE */}
      {formMessage && (
        <View
          style={[
            styles.formMessageBox,
            formMessage.type === "error"
              ? styles.errorMessageBox
              : styles.successMessageBox,
          ]}
        >
          <Text
            style={[
              styles.formMessageText,
              formMessage.type === "error"
                ? styles.errorMessageText
                : styles.successMessageText,
            ]}
          >
            {formMessage.text}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        onPress={() => navigation.navigate("LogIn")}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Already have an account? Log In
        </Text>
      </TouchableOpacity>
    </GradientContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#e5e5e5',
    textAlign: 'center',
    marginBottom: 32,
  },

  signUpBtn: {
    marginTop: 40,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  signUpBtnText: { fontWeight: '600', fontSize: 16 },
  passwordFeedbackBox: {
  marginTop: 8,
  marginBottom: 12,
  paddingVertical: 10,
  paddingHorizontal: 12,
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: 10,
},

passwordStrengthText: {
  fontSize: 14,
  fontWeight: '600',
  marginBottom: 6,
},

strongText: {
  color: '#7CFC98',
},

mediumText: {
  color: '#FFD76A',
},

weakText: {
  color: '#FFB86B',
},

requirementsList: {
  gap: 4,
},

requirementText: {
  fontSize: 13,
  color: '#F3F3F3',
  opacity: 0.9,
  lineHeight: 18,
},
formMessageBox: {
  marginTop: 16,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 10,
},

errorMessageBox: {
  backgroundColor: 'rgba(255, 0, 0, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(146, 5, 5, 0.35)',
},

successMessageBox: {
  backgroundColor: 'rgba(124, 252, 152, 0.12)',
  borderWidth: 1,
  borderColor: 'rgba(124, 252, 152, 0.35)',
},

formMessageText: {
  textAlign: 'center',
  fontSize: 14,
  fontWeight: '600',
  lineHeight: 20,
},

errorMessageText: {
  color: '#FFD6D6',
},

successMessageText: {
  color: '#D8FFE1',
},
});