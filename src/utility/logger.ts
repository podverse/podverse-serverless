export const logPerformance = (subject: string, notes = '') => {
  return new Promise(() => {
    console.log(
      subject + ',' + Math.ceil(Date.now()).toString() + 'ms' + ',' + notes + ',' + new Date()
    )
  })
}
