import taskkill from 'taskkill'

import Monitor from './monitor'

const Hours = 2
const Minutes = 0
const GameTime = 1000 * 60 * (Hours * 60 + Minutes)

const run = () => {
	const endTime = Date.now() + GameTime

	const monitor = new Monitor({
		watchList: ['FIFA18'],

		// Kill tasks when they show up
		taskFoundCallback: tasks => tasks.forEach(task => {
			const timeLeft = Date.now() - endTime
			if(timeLeft <= 0)
				taskkill(task.pid)
		}),

		interval: 1000 * 60,
	})
	monitor.start()
}

run()