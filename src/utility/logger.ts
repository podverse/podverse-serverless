export const logPerformance = (subject: string, notes = '') => {
  console.log(
    subject + ',' + Math.ceil(performance.now()).toString() + 'ms' + ',' + notes + ',' + new Date()
  )
}
