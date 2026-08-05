export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    classes: '/dashboard/classes',
    teacherClasses: '/dashboard/teacher-classes',
    studentClasses: '/dashboard/student-classes',
    students: '/dashboard/students',
    enroll: '/dashboard/enroll',
  },
  content: {
    byType: (type: string) => `/content/type/${type}` as const,
    base: '/content',
    byId: (id: number) => `/content/${id}` as const,
    myPerforms: '/content/my-performs',
    fullTest: '/content/full-test',
    fullTestById: (id: number) => `/content/full-test/${id}` as const,
    comment: (id: number) => `/content/${id}/comment` as const,
    submitTest: (id: number) => `/content/test/${id}/submit` as const,
  },
  person: {
    byId: (id: number) => `/person/${id}` as const,
    avatar: (id: number) => `/person/${id}/avatar` as const,
  },
} as const;
