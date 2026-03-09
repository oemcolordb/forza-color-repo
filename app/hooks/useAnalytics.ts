export const useAnalytics = () => ({
  track: (event: any) => {
    console.log('Analytics:', event)
  },
})
