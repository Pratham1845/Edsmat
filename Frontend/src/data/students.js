// Dummy student data for the application

const RISK_LEVEL_THRESHOLDS = {
  high: 70,
  medium: 45
};

export const students = [
  {
    id: 1,
    name: 'Alex Thompson',
    email: 'alex.thompson@student.edu',
    grade: '10th Grade',
    marks: 78,
    attendance: 85,
    engagement: 72,
    dropoutRiskScore: 28,
    riskScore: 'low',
    reasons: ['Slight dip in assignment completion this week'],
    interventions: ['Assign mentor check-in', 'Follow-up after 1 week'],
    lastActive: '2 hours ago',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Thompson&background=4F46E5&color=fff&size=128'
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@student.edu',
    grade: '11th Grade',
    marks: 45,
    attendance: 62,
    engagement: 48,
    dropoutRiskScore: 82,
    riskScore: 'high',
    reasons: ['Attendance drop', 'Marks decline', 'Low engagement'],
    interventions: ['Schedule counseling', 'Call parent', 'Assign mentor'],
    lastActive: '1 day ago',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=EF4444&color=fff&size=128'
  },
  {
    id: 3,
    name: 'James Lee',
    email: 'james.lee@student.edu',
    grade: '10th Grade',
    marks: 65,
    attendance: 75,
    engagement: 68,
    dropoutRiskScore: 54,
    riskScore: 'medium',
    reasons: ['Negative sentiment in recent check-ins', 'Lower class participation'],
    interventions: ['Assign mentor', 'Follow-up after 1 week'],
    lastActive: '5 hours ago',
    avatar: 'https://ui-avatars.com/api/?name=James+Lee&background=F59E0B&color=fff&size=128'
  },
  {
    id: 4,
    name: 'Sophie Anderson',
    email: 'sophie.anderson@student.edu',
    grade: '12th Grade',
    marks: 92,
    attendance: 95,
    engagement: 90,
    dropoutRiskScore: 16,
    riskScore: 'low',
    reasons: ['No major risk signals'],
    interventions: ['Continue recognition and weekly encouragement'],
    lastActive: '1 hour ago',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Anderson&background=10B981&color=fff&size=128'
  },
  {
    id: 5,
    name: 'Ryan Patel',
    email: 'ryan.patel@student.edu',
    grade: '11th Grade',
    marks: 52,
    attendance: 68,
    engagement: 55,
    dropoutRiskScore: 58,
    riskScore: 'medium',
    reasons: ['Attendance inconsistency', 'Marks decline'],
    interventions: ['Schedule counseling', 'Follow-up after 1 week'],
    lastActive: '3 hours ago',
    avatar: 'https://ui-avatars.com/api/?name=Ryan+Patel&background=F59E0B&color=fff&size=128'
  },
  {
    id: 6,
    name: 'Emma Wilson',
    email: 'emma.wilson@student.edu',
    grade: '10th Grade',
    marks: 38,
    attendance: 58,
    engagement: 42,
    dropoutRiskScore: 88,
    riskScore: 'high',
    reasons: ['Attendance drop', 'Negative sentiment', 'Low engagement'],
    interventions: ['Schedule counseling', 'Call parent', 'Assign mentor'],
    lastActive: '2 days ago',
    avatar: 'https://ui-avatars.com/api/?name=Emma+Wilson&background=EF4444&color=fff&size=128'
  },
  {
    id: 7,
    name: 'Daniel Brown',
    email: 'daniel.brown@student.edu',
    grade: '12th Grade',
    marks: 88,
    attendance: 92,
    engagement: 85,
    dropoutRiskScore: 18,
    riskScore: 'low',
    reasons: ['No major risk signals'],
    interventions: ['Continue recognition and weekly encouragement'],
    lastActive: '30 minutes ago',
    avatar: 'https://ui-avatars.com/api/?name=Daniel+Brown&background=10B981&color=fff&size=128'
  },
  {
    id: 8,
    name: 'Olivia Martinez',
    email: 'olivia.martinez@student.edu',
    grade: '11th Grade',
    marks: 58,
    attendance: 70,
    engagement: 62,
    dropoutRiskScore: 52,
    riskScore: 'medium',
    reasons: ['Low engagement', 'Recent marks decline'],
    interventions: ['Assign mentor', 'Follow-up after 1 week'],
    lastActive: '4 hours ago',
    avatar: 'https://ui-avatars.com/api/?name=Olivia+Martinez&background=F59E0B&color=fff&size=128'
  }
];

export const getRiskLevelFromScore = (score) => {
  const normalized = Number(score) || 0;
  if (normalized >= RISK_LEVEL_THRESHOLDS.high) return 'high';
  if (normalized >= RISK_LEVEL_THRESHOLDS.medium) return 'medium';
  return 'low';
};

export const getStudentEngagementHealth = (student) => {
  const engagementScore = Math.max(0, Math.min(100, 100 - (student.dropoutRiskScore || 0)));

  if (engagementScore >= 75) {
    return {
      tone: 'high',
      headline: "You're doing well this week",
      message: 'Keep your momentum going with the same study rhythm.'
    };
  }

  if (engagementScore >= 55) {
    return {
      tone: 'medium',
      headline: 'Your progress is moving in the right direction',
      message: 'Small daily wins will help you stay on track.'
    };
  }

  return {
    tone: 'building',
    headline: 'A little extra support can make this week easier',
    message: 'Consider checking in with a mentor to build momentum.'
  };
};

export const getStudentDashboardView = (student) => {
  const engagementScore = Math.max(0, Math.min(100, 100 - (student.dropoutRiskScore || 0)));
  const health = getStudentEngagementHealth(student);

  return {
    ...student,
    engagementScore,
    health,
    progressSummary: `${student.marks}% average marks, ${student.attendance}% attendance, ${student.engagement}% class engagement.`,
    nudges: [
      'Nice work staying on track this week.',
      student.attendance >= 75
        ? 'Attendance is improving and helping your routine.'
        : 'Try one extra attended session this week to strengthen consistency.',
      student.engagement >= 65
        ? 'Your recent participation is consistent.'
        : 'A quick mentor check-in can help you feel more supported.'
    ],
    supportSuggestion:
      engagementScore >= 60
        ? 'Keep going, and reach out if you want extra study support.'
        : 'You may benefit from extra support this week.'
  };
};
