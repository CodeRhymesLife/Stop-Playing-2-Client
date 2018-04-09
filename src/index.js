import taskkill from 'taskkill'

import Monitor from './monitor'

const run = () => {
	const monitor = new Monitor({
		watchList: ['notepad'],

		// Kill tasks when they show up
		taskFoundCallback: tasks => tasks.forEach(task => taskkill(task.pid)),

		interval: 1000,
	})
	monitor.start()
}

run()