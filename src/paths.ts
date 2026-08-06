export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password', confirmResetPassword: '/auth/confirm-reset-password' },
  dashboard: {
    home: '/dashboard',
    turmas: '/dashboard/turmas',
    tarefas: '/dashboard/tarefas',
    realizarTarefa: (contentId: number | string) => `/dashboard/tarefas/realizar/${contentId}`,
    leituras: '/dashboard/leituras',
    provas: '/dashboard/provas',
    conta: '/dashboard/conta',
  },
} as const;
