import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { ResumeUploadScreen } from '../screens/ResumeUploadScreen';
import { JobPostingScreen } from '../screens/JobPostingScreen';
import { AssessmentHubScreen } from '../screens/AssessmentHubScreen';
import { AssessmentScreen } from '../screens/AssessmentScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { StudyPlanScreen } from '../screens/StudyPlanScreen';
import { COLORS } from '../constants/theme';

export type RootStackParamList = {
  Welcome: undefined;
  ResumeUpload: undefined;
  JobPosting: undefined;
  AssessmentHub: undefined;
  Assessment: undefined;
  Results: undefined;
  StudyPlan: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const headerStyle = {
  headerStyle: { backgroundColor: COLORS.bg },
  headerTintColor: COLORS.white,
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 16, color: COLORS.white },
  contentStyle: { backgroundColor: COLORS.bg },
};

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        ...headerStyle,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResumeUpload"
        component={ResumeUploadScreen}
        options={{ title: 'Your Resume' }}
      />
      <Stack.Screen
        name="JobPosting"
        component={JobPostingScreen}
        options={{ title: 'Job Posting' }}
      />
      <Stack.Screen
        name="AssessmentHub"
        component={AssessmentHubScreen}
        options={{ title: 'Assessment Hub' }}
      />
      <Stack.Screen
        name="Assessment"
        component={AssessmentScreen}
        options={({ navigation }) => ({
          title: 'Assessment',
          headerLeft: () => null, // Prevent back during assessment
        })}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'My Results', headerLeft: () => null }}
      />
      <Stack.Screen
        name="StudyPlan"
        component={StudyPlanScreen}
        options={{ title: 'Study Plan' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
